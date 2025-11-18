import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';
import { formatPrice, translatePropertyType } from '@/utils/propertyHelpers';
import { MapPin } from 'lucide-react';

// Fix default marker icon issue with Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  property_type: string;
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
  area: number;
}

interface PropertyMapProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (property: Property) => void;
}

const PropertyMap = ({ 
  properties, 
  center = [21.0278, 105.8342], // Hanoi center [lat, lng]
  zoom = 11,
  onMarkerClick 
}: PropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geocodedCount, setGeocodedCount] = useState(0);
  const geocodeCache = useRef<Map<string, [number, number] | null>>(new Map());

  // Geocoding function with caching, timeout and rate limiting
  const geocodeLocation = async (location: string): Promise<[number, number] | null> => {
    // Check cache first
    if (geocodeCache.current.has(location)) {
      return geocodeCache.current.get(location) || null;
    }

    try {
      // Add small delay to respect Nominatim rate limits
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const query = encodeURIComponent(`${location}, Vietnam`);
      let response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${query}&limit=1`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }
      
      let data = await response.json();
      
      if ((!data || data.length === 0) && location.includes(',')) {
        // Fallback: try geocoding using only the city/province part
        const city = location.split(',').slice(-1)[0].trim();
        const q2 = encodeURIComponent(`${city}, Vietnam`);
        response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${q2}&limit=1`, { signal: controller.signal });
        data = await response.json();
      }
      
      if (data && data.length > 0) {
        const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        geocodeCache.current.set(location, coords);
        return coords;
      }
      
      geocodeCache.current.set(location, null);
    } catch (error) {
      console.error('Geocoding error for', location, ':', error);
      geocodeCache.current.set(location, null);
    }
    return null;
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      setIsLoading(true);
      setError(null);

      // Create map
      map.current = L.map(mapContainer.current).setView(center, zoom);

      // Add OpenStreetMap tiles with fallback provider and robust events
      let activeLayer: L.TileLayer | null = null;

      const createOSMLayer = () =>
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          crossOrigin: true as any,
        });

      const createCartoLayer = () =>
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19,
          crossOrigin: true as any,
        });

      const attachHandlers = (layer: L.TileLayer) => {
        let loaded = false;
        let errorCount = 0;

        const finish = () => {
          if (loaded) return;
          loaded = true;
          setIsLoading(false);
          setTimeout(() => {
            map.current?.invalidateSize();
          }, 0);
        };

        layer.on('load', finish);
        layer.on('tileerror', () => {
          errorCount++;
          // If early tiles fail, switch to fallback provider
          if (errorCount > 2 && map.current) {
            map.current.removeLayer(layer);
            activeLayer = createCartoLayer().addTo(map.current);
            attachHandlers(activeLayer);
          }
        });

        // Safety timeout to avoid infinite loading state
        setTimeout(() => {
          if (!loaded) finish();
        }, 4000);
      };

      // Mount base layer and handlers
      activeLayer = createOSMLayer().addTo(map.current);
      attachHandlers(activeLayer);

      // Show map immediately to avoid spinner loops regardless of tile events
      setIsLoading(false);
      setTimeout(() => {
        map.current?.invalidateSize();
      }, 0);
    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Không thể khởi tạo bản đồ. Vui lòng thử lại.');
      setIsLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom]);

  // Ensure map resizes correctly when container size changes or view toggles
  useEffect(() => {
    if (isLoading || !map.current || !mapContainer.current) return;

    // Initial invalidate after mount/toggle
    map.current.invalidateSize();

    const ro = new ResizeObserver(() => {
      map.current?.invalidateSize();
    });
    ro.observe(mapContainer.current);

    // Cleanup
    return () => {
      ro.disconnect();
    };
  }, [isLoading]);

  // Add markers for properties progressively
  useEffect(() => {
    if (!map.current || properties.length === 0) {
      return;
    }

    let isMounted = true;
    setGeocodedCount(0);

    const addMarkers = async () => {
      // Clear existing markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      const bounds = L.latLngBounds([]);
      let processedCount = 0;

      // Process properties one at a time to show progress
      for (const property of properties) {
        if (!isMounted) break;
        
        const coords = await geocodeLocation(property.location);
        processedCount++;
        
        if (isMounted) {
          setGeocodedCount(processedCount);
        }

        if (!coords || !map.current || !isMounted) continue;

        // Create custom icon
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: hsl(var(--primary));
              width: 40px;
              height: 40px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              cursor: pointer;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        // Create popup content
        const popupContent = `
          <div style="min-width: 200px; padding: 8px;">
            <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${property.title}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${property.location}</p>
            <p style="font-weight: bold; color: hsl(var(--primary)); margin-bottom: 4px;">${formatPrice(property.price)}</p>
            <p style="font-size: 12px; margin-top: 4px;">${translatePropertyType(property.property_type)} • ${property.area}m²</p>
            ${property.bedrooms ? `<p style="font-size: 12px;">${property.bedrooms} PN • ${property.bathrooms} PT</p>` : ''}
          </div>
        `;

        const marker = L.marker(coords, { icon: customIcon })
          .addTo(map.current)
          .bindPopup(popupContent);

        marker.on('click', () => {
          if (onMarkerClick) {
            onMarkerClick(property);
          }
        });

        markers.current.push(marker);
        bounds.extend(coords);

        // Fit bounds after each marker to show progress
        if (markers.current.length > 0 && map.current) {
          map.current.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    };

    addMarkers().catch((error) => {
      console.error('Error adding markers:', error);
    });

    return () => {
      isMounted = false;
    };
  }, [properties, onMarkerClick]);

  if (isLoading) {
    return (
      <Card className="w-full h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải bản đồ...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full h-[600px] flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="bg-destructive/10 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Không thể tải bản đồ</h3>
          <p className="text-muted-foreground text-sm mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[600px] overflow-hidden relative">
      <div ref={mapContainer} className="w-full h-full" />
      {geocodedCount > 0 && geocodedCount < properties.length && (
        <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border">
          <p className="text-sm text-muted-foreground">
            Đang tải vị trí: {geocodedCount}/{properties.length}
          </p>
        </div>
      )}
    </Card>
  );
};

export default PropertyMap;
