import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPrice, translatePropertyType } from '@/utils/propertyHelpers';
import { 
  Home, 
  MapPin, 
  Maximize, 
  Bed, 
  Bath, 
  DollarSign,
  CheckCircle2,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  amenities?: string[];
  description?: string;
  status: string;
}

const PropertyComparison = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      const ids = searchParams.get('ids')?.split(',') || [];
      
      if (ids.length === 0) {
        toast({
          title: 'Không có bất động sản để so sánh',
          description: 'Vui lòng chọn ít nhất 1 bất động sản',
          variant: 'destructive',
        });
        navigate('/properties');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .in('id', ids);

        if (error) throw error;
        
        setProperties(data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast({
          title: 'Lỗi tải dữ liệu',
          description: 'Không thể tải thông tin bất động sản',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams, navigate, toast]);

  const allAmenities = Array.from(
    new Set(properties.flatMap(p => p.amenities || []))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải dữ liệu so sánh...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">So sánh bất động sản</h1>
            <p className="text-muted-foreground">
              So sánh {properties.length} bất động sản đã chọn
            </p>
          </div>
          <Button onClick={() => navigate('/properties')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>

        {properties.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                Không có bất động sản để so sánh
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Header with property images and titles */}
              <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `200px repeat(${properties.length}, 300px)` }}>
                <div></div>
                {properties.map(property => (
                  <Card key={property.id} className="overflow-hidden">
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={property.images?.[0] || '/placeholder.svg'}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 right-2">
                        {translatePropertyType(property.property_type)}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-1 line-clamp-2">
                        {property.title}
                      </h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/property/${property.id}`)}
                        className="w-full mt-2"
                      >
                        Xem chi tiết
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Comparison rows */}
              <Card>
                <CardContent className="p-0">
                  {/* Price */}
                  <div className="grid items-center border-b" style={{ gridTemplateColumns: `200px repeat(${properties.length}, 300px)` }}>
                    <div className="p-4 bg-muted font-semibold flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Giá
                    </div>
                    {properties.map(property => (
                      <div key={property.id} className="p-4 text-center">
                        <p className="font-bold text-lg text-primary">
                          {formatPrice(property.price)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Location */}
                  <div className="grid items-center border-b" style={{ gridTemplateColumns: `200px repeat(${properties.length}, 300px)` }}>
                    <div className="p-4 bg-muted font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Vị trí
                    </div>
                    {properties.map(property => (
                      <div key={property.id} className="p-4 text-center">
                        <p className="text-sm">{property.location}</p>
                      </div>
                    ))}
                  </div>

                  {/* Area */}
                  <div className="grid items-center border-b" style={{ gridTemplateColumns: `200px repeat(${properties.length}, 300px)` }}>
                    <div className="p-4 bg-muted font-semibold flex items-center gap-2">
                      <Maximize className="h-4 w-4" />
                      Diện tích
                    </div>
                    {properties.map(property => (
                      <div key={property.id} className="p-4 text-center">
                        <p className="font-semibold">{property.area} m²</p>
                      </div>
                    ))}
                  </div>

                  {/* Bedrooms */}
                  <div className="grid items-center border-b" style={{ gridTemplateColumns: `200px repeat(${properties.length}, 300px)` }}>
                    <div className="p-4 bg-muted font-semibold flex items-center gap-2">
                      <Bed className="h-4 w-4" />
                      Phòng ngủ
                    </div>
                    {properties.map(property => (
                      <div key={property.id} className="p-4 text-center">
                        <p>{property.bedrooms || 'N/A'}</p>
                      </div>
                    ))}
                  </div>

                  {/* Bathrooms */}
                  <div className="grid items-center border-b" style={{ gridTemplateColumns: `200px repeat(${properties.length}, 300px)` }}>
                    <div className="p-4 bg-muted font-semibold flex items-center gap-2">
                      <Bath className="h-4 w-4" />
                      Phòng tắm
                    </div>
                    {properties.map(property => (
                      <div key={property.id} className="p-4 text-center">
                        <p>{property.bathrooms || 'N/A'}</p>
                      </div>
                    ))}
                  </div>

                  {/* Price per m² */}
                  <div className="grid items-center border-b" style={{ gridTemplateColumns: `200px repeat(${properties.length}, 300px)` }}>
                    <div className="p-4 bg-muted font-semibold">
                      Giá/m²
                    </div>
                    {properties.map(property => (
                      <div key={property.id} className="p-4 text-center">
                        <p className="font-semibold text-primary">
                          {formatPrice(Math.round(property.price / property.area))}/m²
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Amenities comparison */}
                  {allAmenities.length > 0 && (
                    <>
                      <div className="p-4 bg-muted">
                        <h3 className="font-bold">Tiện ích</h3>
                      </div>
                      {allAmenities.map(amenity => (
                        <div 
                          key={amenity}
                          className="grid items-center border-b" 
                          style={{ gridTemplateColumns: `200px repeat(${properties.length}, 300px)` }}
                        >
                          <div className="p-4 text-sm">
                            {amenity}
                          </div>
                          {properties.map(property => (
                            <div key={property.id} className="p-4 flex justify-center">
                              {property.amenities?.includes(amenity) ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-muted-foreground/30" />
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PropertyComparison;
