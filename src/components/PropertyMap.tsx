import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { formatPrice, translatePropertyType } from '@/utils/propertyHelpers';
import { MapPin } from 'lucide-react';

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
  center = [105.8342, 21.0278], // Hanoi center
  zoom = 11,
  onMarkerClick 
}: PropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Geocoding function to convert location to coordinates
  const geocodeLocation = async (location: string): Promise<[number, number] | null> => {
    if (!mapboxToken) return null;
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location + ', Vietnam')}.json?access_token=${mapboxToken}&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return data.features[0].center as [number, number];
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return null;
  };

  // Initialize map
  useEffect(() => {
    // Get token from environment or use a placeholder
    const token = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || '';
    setMapboxToken(token);
    setIsLoading(false);

    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.scrollZoom.enable();

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, center, zoom]);

  // Add markers for properties
  useEffect(() => {
    if (!map.current || !mapboxToken || properties.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    let markersAdded = 0;

    properties.forEach(async (property) => {
      const coords = await geocodeLocation(property.location);
      
      if (coords) {
        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.cssText = `
          background-color: hsl(var(--primary));
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: transform 0.2s;
        `;
        el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;

        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.1)';
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
        });

        // Create popup
        const popupContent = `
          <div class="p-2" style="min-width: 200px;">
            <h3 class="font-bold text-sm mb-1">${property.title}</h3>
            <p class="text-xs text-muted-foreground mb-1">${property.location}</p>
            <p class="font-bold text-primary">${formatPrice(property.price)}</p>
            <p class="text-xs mt-1">${translatePropertyType(property.property_type)} • ${property.area}m²</p>
            ${property.bedrooms ? `<p class="text-xs">${property.bedrooms} PN • ${property.bathrooms} PT</p>` : ''}
          </div>
        `;

        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(popupContent);

        const marker = new mapboxgl.Marker(el)
          .setLngLat(coords)
          .setPopup(popup)
          .addTo(map.current!);

        el.addEventListener('click', () => {
          if (onMarkerClick) {
            onMarkerClick(property);
          }
        });

        bounds.extend(coords);
        markersAdded++;

        // Fit bounds after all markers are added
        if (markersAdded === properties.length && markersAdded > 1) {
          map.current?.fitBounds(bounds, {
            padding: 50,
            maxZoom: 14
          });
        }
      }
    });
  }, [properties, mapboxToken, onMarkerClick]);

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

  if (!mapboxToken) {
    return (
      <Card className="w-full h-[600px] flex items-center justify-center">
        <div className="text-center p-6">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chưa cấu hình Mapbox</h3>
          <p className="text-muted-foreground text-sm max-w-md">
            Vui lòng thêm MAPBOX_PUBLIC_TOKEN vào biến môi trường để hiển thị bản đồ.
            Bạn có thể lấy token miễn phí tại{' '}
            <a 
              href="https://www.mapbox.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[600px] overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </Card>
  );
};

export default PropertyMap;
