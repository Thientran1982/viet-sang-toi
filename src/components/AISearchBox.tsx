import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Search, Loader2, MapPin, Bed, Bath, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/utils/propertyHelpers";

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

interface AISearchResults {
  properties: Property[];
  query: string;
  total: number;
}

interface AISearchBoxProps {
  onResults?: (results: AISearchResults) => void;
}

export function AISearchBox({ onResults }: AISearchBoxProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AISearchResults | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Vui lòng nhập từ khóa tìm kiếm",
        description: "Hãy mô tả bất động sản mà bạn đang tìm kiếm",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-search', {
        body: { 
          query: query.trim(),
          location: null,
          budget: null,
          propertyType: null
        }
      });

      if (error) {
        throw error;
      }

      setResults(data);
      onResults?.(data);
      
      toast({
        title: "Tìm kiếm thành công!",
        description: `Tìm thấy ${data.total} bất động sản phù hợp với yêu cầu của bạn`,
      });

    } catch (error: any) {
      console.error("AI Search error:", error);
      toast({
        title: "Lỗi tìm kiếm",
        description: error.message || "Không thể thực hiện tìm kiếm thông minh",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const exampleQueries = [
    "Chung cư 2 phòng ngủ gần trung tâm dưới 3 tỷ",
    "Nhà riêng có sân vườn quận Hai Châu", 
    "Biệt thự view biển có hồ bơi",
    "Căn hộ studio cho thuê gần đại học"
  ];

  return (
    <div className="space-y-6">
      {/* AI Search Input */}
      <Card className="p-6 bg-gradient-hero border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Tìm kiếm thông minh với AI
            </h3>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="VD: Tôi muốn tìm chung cư 2 phòng ngủ có ban công, gần trường học, giá dưới 2 tỷ..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 h-12 text-base"
                disabled={loading}
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="btn-gradient h-12 px-6"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {loading ? "Đang tìm..." : "Tìm với AI"}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            💡 <strong>Mẹo:</strong> Mô tả chi tiết về bất động sản bạn muốn tìm. 
            AI sẽ hiểu và tìm cho bạn những lựa chọn phù hợp nhất!
          </div>
        </div>
      </Card>

      {/* Example Queries */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          Hoặc thử các tìm kiếm mẫu:
        </p>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((example, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => setQuery(example)}
            >
              {example}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results Preview */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">
              Kết quả tìm kiếm: "{results.query}"
            </h4>
            <Badge variant="secondary">
              {results.total} kết quả
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.properties.slice(0, 6).map((property) => (
              <Card key={property.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="space-y-3">
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Chưa có hình ảnh
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-semibold line-clamp-2">{property.title}</h5>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {property.location}
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {formatPrice(property.price)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Bed className="h-3 w-3 mr-1" />
                        {property.bedrooms}
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-3 w-3 mr-1" />
                        {property.bathrooms}
                      </div>
                      <div className="flex items-center">
                        <Square className="h-3 w-3 mr-1" />
                        {property.area}m²
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}