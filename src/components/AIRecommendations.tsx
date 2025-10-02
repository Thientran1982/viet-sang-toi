import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, RefreshCw, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard } from "@/components/PropertyCard";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  featured: boolean;
}

interface RecommendationData {
  recommendations: Property[];
  total: number;
  basedOn: {
    favorites: number;
    preferences: number;
  };
}

export function AIRecommendations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (user && initialLoad) {
      loadRecommendations();
      setInitialLoad(false);
    }
  }, [user, initialLoad]);

  const loadRecommendations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get user preferences (you could expand this based on profile data)
      const preferences = {
        // Could be expanded with user's saved search criteria, profile preferences, etc.
      };

      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: { 
          userId: user.id,
          preferences
        }
      });

      if (error) {
        throw error;
      }

      setRecommendations(data);

    } catch (error: any) {
      console.error("AI Recommendations error:", error);
      
      // Show a more user-friendly error message
      const errorMessage = error.message?.includes("402") 
        ? "Dịch vụ AI tạm thời không khả dụng. Đang dùng gợi ý thông minh thay thế."
        : "Đã xảy ra lỗi khi tải gợi ý bất động sản";
      
      toast({
        title: "Thông báo",
        description: errorMessage,
        variant: error.message?.includes("402") ? "default" : "destructive",
      });
      
      // Don't clear recommendations on error, keep showing previous ones
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Gợi ý thông minh với AI</h3>
          <p className="text-muted-foreground mb-4">
            Đăng nhập để nhận gợi ý bất động sản được cá nhân hóa bằng AI
          </p>
          <Button onClick={() => window.location.href = '/auth'} className="btn-gradient">
            Đăng nhập ngay
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Gợi ý dành cho bạn</CardTitle>
            <Badge variant="secondary" className="ml-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              AI
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadRecommendations}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>

        {recommendations && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              Dựa trên {recommendations.basedOn.favorites} sở thích
            </div>
            <Badge variant="outline" className="text-xs">
              {recommendations.total} gợi ý
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-48 rounded-lg mb-3"></div>
                <div className="bg-muted h-4 rounded mb-2"></div>
                <div className="bg-muted h-4 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : recommendations && recommendations.recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.recommendations.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                image={property.images[0] || "/placeholder.svg"}
                title={property.title}
                location={property.location}
                price={property.price}
                beds={property.bedrooms}
                baths={property.bathrooms}
                area={property.area}
                type={property.property_type}
                featured={property.featured}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có gợi ý</h3>
            <p className="text-muted-foreground mb-4">
              Hãy thêm một số bất động sản vào yêu thích để nhận gợi ý cá nhân hóa
            </p>
            <Button onClick={() => window.location.href = '/properties'}>
              Khám phá bất động sản
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}