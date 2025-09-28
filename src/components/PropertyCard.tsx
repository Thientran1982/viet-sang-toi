import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Bed, Bath, Square, Eye } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { getVietnamesePropertyType, formatPrice } from "@/utils/propertyHelpers"

interface PropertyCardProps {
  id: string;
  image: string;
  title: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  area: number;
  type: string;
  featured?: boolean;
}

export function PropertyCard({
  id,
  image,
  title,
  location,
  price,
  beds,
  baths,
  area,
  type,
  featured = false
}: PropertyCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfFavorite();
    }
  }, [user, id]);

  const checkIfFavorite = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user?.id)
        .eq('property_id', id)
        .maybeSingle();

      if (error) throw error;
      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: 'Cần đăng nhập',
        description: 'Vui lòng đăng nhập để lưu bất động sản yêu thích',
        variant: 'destructive',
      });
      return;
    }

    setIsToggling(true);
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', id);

        if (error) throw error;
        setIsFavorite(false);
        toast({
          title: 'Thành công',
          description: 'Đã xóa khỏi danh sách yêu thích',
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            property_id: id,
          });

        if (error) throw error;
        setIsFavorite(true);
        toast({
          title: 'Thành công',
          description: 'Đã thêm vào danh sách yêu thích',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật danh sách yêu thích',
        variant: 'destructive',
      });
    } finally {
      setIsToggling(false);
    }
  };
  

  return (
    <div className="property-card rounded-2xl overflow-hidden group">
      {/* Image */}
      <div className="relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-smooth"
        />
        <div className="absolute top-4 left-4">
          {featured && (
            <Badge className="bg-accent text-accent-foreground font-semibold">
              Nổi bật
            </Badge>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className={`absolute top-4 right-4 h-8 w-8 ${
            isFavorite 
              ? 'bg-red-500/90 hover:bg-red-600/90 text-white' 
              : 'bg-white/90 hover:bg-white text-gray-600 hover:text-red-500'
          }`}
          onClick={toggleFavorite}
          disabled={isToggling}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            {getVietnamesePropertyType(type)}
          </Badge>
          <div className="text-2xl font-bold text-primary">
            {formatPrice(price)}
          </div>
        </div>

        <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2">
          {title}
        </h3>

        <div className="flex items-center text-muted-foreground mb-4">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{location}</span>
        </div>

        {/* Property Stats */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            <span>{beds} PN</span>
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            <span>{baths} WC</span>
          </div>
          <div className="flex items-center">
            <Square className="h-4 w-4 mr-1" />
            <span>{area}m²</span>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          className="w-full mt-4 btn-gradient"
          onClick={() => navigate(`/property/${id}`)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Xem chi tiết
        </Button>
      </div>
    </div>
  )
}