import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { formatPrice, translatePropertyType } from '@/utils/propertyHelpers';

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

interface MapboxPropertyMapProps {
  properties: Property[];
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  onMarkerClick?: (property: Property) => void;
}

const MapboxPropertyMap = ({
  properties,
  center = [21.0278, 105.8342], // Hanoi [lat, lng]
  zoom = 11,
  onMarkerClick,
}: MapboxPropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch public token from backend function
  const fetchToken = async (): Promise<string | null> => {
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-mapbox-token`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      return data.token || null;
    } catch (e) {
      console.error('Fetch token error:', e);
      return null;
    }
  };

  useEffect(() => {
    let disposed = false;
    (async () => {
      if (!mapContainer.current) return;
      setIsLoading(true);
      setError(null);

      const token = await fetchToken();
      if (!token) {
        setError('Chưa cấu hình Mapbox token. Vui lòng thêm MAPBOX_PUBLIC_TOKEN.');
        setIsLoading(false);
        return;
      }

      try {
        mapboxgl.accessToken = token;
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [center[1], center[0]], // [lng, lat]
          zoom,
        });

        map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
        map.current.scrollZoom.disable();

        map.current.on('load', () => {
          if (disposed) return;
          setIsLoading(false);
        });

        map.current.on('error', (e) => {
          console.error('Mapbox error:', e);
          if (disposed) return;
          setError('Không thể tải bản đồ Mapbox.');
          setIsLoading(false);
        });

        // Minimal: show popup markers progressively using Mapbox built-in markers
        const bounds = new mapboxgl.LngLatBounds();
        properties.slice(0, 30).forEach((property) => {
          // Best-effort: try Mapbox geocoding, but do not block map rendering
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          const q = encodeURIComponent(`${property.location}, Việt Nam`);
          fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?limit=1&language=vi&access_token=${token}`, { signal: controller.signal })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
              if (!data || !data.features || data.features.length === 0 || !map.current) return;
              const [lng, lat] = data.features[0].center as [number, number];
              const el = document.createElement('div');
              el.className = 'mapbox-marker';
              el.style.cssText = `width:40px;height:40px;border-radius:50%;background:var(--primary);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;display:flex;align-items:center;justify-content:center;`;
              el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;

              const marker = new mapboxgl.Marker({ element: el })
                .setLngLat([lng, lat])
                .setPopup(
                  new mapboxgl.Popup({ offset: 12 }).setHTML(`
                    <div style="min-width:200px;padding:8px">
                      <h3 style="font-weight:bold;font-size:14px;margin-bottom:4px">${property.title}</h3>
                      <p style="font-size:12px;color:#666;margin-bottom:4px">${property.location}</p>
                      <p style="font-weight:bold;color:hsl(var(--primary));margin-bottom:4px">${formatPrice(property.price)}</p>
                      <p style="font-size:12px;margin-top:4px">${translatePropertyType(property.property_type)} • ${property.area}m²</p>
                      ${property.bedrooms ? `<p style="font-size:12px;">${property.bedrooms} PN • ${property.bathrooms} PT</p>` : ''}
                    </div>
                  `)
                )
                .addTo(map.current);

              el.addEventListener('click', () => onMarkerClick?.(property));
              bounds.extend([lng, lat]);
              if (!bounds.isEmpty()) {
                map.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
              }
            })
            .catch((err) => console.warn('Geocode skip:', err))
            .finally(() => clearTimeout(timeout));
        });
      } catch (e) {
        console.error('Map init error:', e);
        setError('Không thể khởi tạo bản đồ.');
        setIsLoading(false);
      }

      return () => {
        disposed = true;
        map.current?.remove();
        map.current = null;
      };
    })();
  }, [center[0], center[1], zoom, properties, onMarkerClick]);

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
          <p className="text-muted-foreground text-sm mb-6">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[600px] overflow-hidden relative">
      <div ref={mapContainer} className="w-full h-full" />
    </Card>
  );
};

export default MapboxPropertyMap;
