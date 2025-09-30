import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PropertyMap from "@/components/PropertyMap";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  Share2, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar,
  User,
  Phone,
  Mail,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  amenities: string[];
  featured: boolean;
  status: string;
  created_at: string;
  contact_info: any;
  created_by: string;
}

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProperty();
      checkIfFavorite();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin bất động sản",
        variant: "destructive",
      });
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    if (!user || !id) return;

    try {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', id)
        .single();

      setIsFavorite(!!data);
    } catch (error) {
      // Not a favorite or error - ignore
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để lưu yêu thích",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', id);
        
        setIsFavorite(false);
        toast({
          title: "Đã xóa khỏi yêu thích",
        });
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            property_id: id
          });
        
        setIsFavorite(true);
        toast({
          title: "Đã thêm vào yêu thích",
        });
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật yêu thích",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getPropertyTypeText = (type: string) => {
    const types: Record<string, string> = {
      apartment: 'Chung cư',
      house: 'Nhà riêng',
      villa: 'Biệt thự',
      townhouse: 'Nhà phố',
      land: 'Đất nền'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="bg-muted h-96 rounded-lg"></div>
            <div className="bg-muted h-8 rounded w-2/3"></div>
            <div className="bg-muted h-4 rounded w-1/2"></div>
            <div className="bg-muted h-32 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Không tìm thấy bất động sản</h2>
          <Button onClick={() => navigate('/properties')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/properties')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative">
              {property.images && property.images.length > 0 ? (
                <Carousel className="w-full">
                  <CarouselContent>
                    {property.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-video relative rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`${property.title} - Hình ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {property.images.length > 1 && (
                    <>
                      <CarouselPrevious />
                      <CarouselNext />
                    </>
                  )}
                </Carousel>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Chưa có hình ảnh</p>
                </div>
              )}

              {/* Floating Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={toggleFavorite}
                  className={isFavorite ? "text-red-500" : ""}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
                <Button size="icon" variant="secondary">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {property.featured && (
                <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">
                  Nổi bật
                </Badge>
              )}
            </div>

            {/* Property Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(property.price)}
                  </p>
                  <Badge variant="outline">
                    {getPropertyTypeText(property.property_type)}
                  </Badge>
                </div>
              </div>

              {/* Property Stats */}
              <div className="flex items-center gap-6 py-4">
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-muted-foreground" />
                  <span>{property.bedrooms} phòng ngủ</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="h-5 w-5 text-muted-foreground" />
                  <span>{property.bathrooms} phòng tắm</span>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="h-5 w-5 text-muted-foreground" />
                  <span>{property.area} m²</span>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Mô tả</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {property.description || "Chưa có mô tả chi tiết."}
                </p>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Tiện ích</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Map */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Vị trí</h3>
                <PropertyMap 
                  properties={[property]}
                  zoom={14}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Liên hệ</h3>
              
              {property.contact_info ? (
                <div className="space-y-4">
                  {property.contact_info.name && (
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{property.contact_info.name}</span>
                    </div>
                  )}
                  
                  {property.contact_info.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`tel:${property.contact_info.phone}`}
                        className="text-primary hover:underline"
                      >
                        {property.contact_info.phone}
                      </a>
                    </div>
                  )}
                  
                  {property.contact_info.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`mailto:${property.contact_info.email}`}
                        className="text-primary hover:underline"
                      >
                        {property.contact_info.email}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Thông tin liên hệ sẽ được cập nhật sớm.
                </p>
              )}

              <div className="flex gap-2 mt-6">
                <Button className="flex-1 btn-gradient">
                  <Phone className="h-4 w-4 mr-2" />
                  Gọi ngay
                </Button>
                <Button variant="outline" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            </Card>

            {/* Property Details */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Chi tiết</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loại BDS:</span>
                  <span>{getPropertyTypeText(property.property_type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <Badge variant={property.status === 'available' ? 'default' : 'secondary'}>
                    {property.status === 'available' ? 'Còn trống' : 'Không khả dụng'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày đăng:</span>
                  <span>
                    {new Date(property.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;