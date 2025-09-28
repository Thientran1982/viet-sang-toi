import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Heart, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  property_type: string;
  images: string[];
  featured: boolean;
}

interface Favorite {
  id: string;
  property_id: string;
  created_at: string;
  properties: Property;
}

export default function Favorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          property_id,
          created_at,
          properties (
            id,
            title,
            location,
            price,
            bedrooms,
            bathrooms,
            area,
            property_type,
            images,
            featured
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFavorites(data || []);
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách yêu thích',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user?.id)
        .eq('property_id', propertyId);

      if (error) throw error;

      setFavorites(prev => prev.filter(fav => fav.property_id !== propertyId));
      toast({
        title: 'Thành công',
        description: 'Đã xóa khỏi danh sách yêu thích',
      });
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa khỏi danh sách yêu thích',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="text-center max-w-md mx-auto">
            <Heart className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Vui lòng đăng nhập
            </h1>
            <p className="text-muted-foreground mb-6">
              Bạn cần đăng nhập để xem danh sách bất động sản yêu thích
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              className="btn-gradient"
            >
              Đăng nhập ngay
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải danh sách yêu thích...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-foreground">
              Bất động sản yêu thích
            </h1>
          </div>
          <p className="text-muted-foreground">
            {favorites.length > 0 
              ? `Bạn có ${favorites.length} bất động sản trong danh sách yêu thích`
              : 'Chưa có bất động sản nào trong danh sách yêu thích'
            }
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Home className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Danh sách trống
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Bạn chưa thêm bất động sản nào vào danh sách yêu thích. 
              Hãy khám phá và lưu những căn nhà mà bạn quan tâm!
            </p>
            <Button 
              onClick={() => navigate('/properties')}
              className="btn-gradient"
            >
              Khám phá bất động sản
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((favorite) => {
              const property = favorite.properties;
              return (
                <div key={favorite.id} className="relative">
                  <PropertyCard
                    id={property.id}
                    image={property.images?.[0] || '/placeholder.svg'}
                    title={property.title}
                    location={property.location}
                    price={property.price}
                    beds={property.bedrooms}
                    baths={property.bathrooms}
                    area={property.area}
                    type={property.property_type}
                    featured={property.featured}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() => removeFavorite(property.id)}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {favorites.length > 0 && (
          <div className="text-center mt-12">
            <Button 
              variant="outline"
              onClick={() => navigate('/properties')}
            >
              Tìm thêm bất động sản khác
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}