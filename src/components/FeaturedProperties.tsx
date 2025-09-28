import { PropertyCard } from "@/components/PropertyCard"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

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


export function FeaturedProperties() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('featured', true)
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;

      setFeaturedProperties(data || []);
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách bất động sản nổi bật',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Bất động sản nổi bật
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Khám phá những căn nhà đẹp nhất được tuyển chọn kỹ lưỡng bởi đội ngũ chuyên gia của chúng tôi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted rounded-2xl h-48 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-6 bg-muted rounded w-full"></div>
                </div>
              </div>
            ))
          ) : featuredProperties.length > 0 ? (
            featuredProperties.map((property) => (
              <PropertyCard 
                key={property.id}
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
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Không có bất động sản nổi bật nào</p>
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <Button 
            className="btn-gradient px-8 py-3 rounded-xl text-white font-semibold transition-smooth hover:shadow-lg"
            onClick={() => navigate('/properties')}
          >
            Xem tất cả bất động sản
          </Button>
        </div>
      </div>
    </section>
  )
}