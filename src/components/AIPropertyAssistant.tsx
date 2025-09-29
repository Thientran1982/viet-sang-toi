import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, TrendingUp, DollarSign, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AIAssistantProps {
  propertyData: {
    title?: string;
    property_type?: string;
    location?: string;
    price?: number;
    area?: number;
    bedrooms?: number;
    bathrooms?: number;
    amenities?: string[];
    additional_info?: string;
  };
  onResultGenerated?: (type: string, result: string) => void;
}

export function AIPropertyAssistant({ propertyData, onResultGenerated }: AIAssistantProps) {
  const [activeType, setActiveType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const assistantTypes = [
    {
      type: "generate_description",
      icon: Wand2,
      title: "Tạo mô tả AI",
      description: "Tạo mô tả bất động sản hấp dẫn và chuyên nghiệp",
      color: "text-blue-500"
    },
    {
      type: "price_estimate",
      icon: DollarSign,
      title: "Định giá thông minh",
      description: "Ước tính giá trị thị trường dựa trên AI",
      color: "text-green-500"
    },
    {
      type: "investment_advice",
      icon: TrendingUp,
      title: "Tư vấn đầu tư",
      description: "Phân tích tiềm năng đầu tư bất động sản",
      color: "text-purple-500"
    }
  ];

  const generateAIContent = async (type: string) => {
    setLoading(true);
    setActiveType(type);

    try {
      const { data, error } = await supabase.functions.invoke('ai-property-assistant', {
        body: { 
          type,
          data: propertyData
        }
      });

      if (error) {
        throw error;
      }

      const result = data.result;
      setResults(prev => ({ ...prev, [type]: result }));
      onResultGenerated?.(type, result);

      toast({
        title: "Tạo nội dung thành công!",
        description: `AI đã tạo ${getTypeTitle(type)} cho bất động sản`,
      });

    } catch (error: any) {
      console.error("AI Assistant error:", error);
      toast({
        title: "Lỗi tạo nội dung",
        description: error.message || "Không thể tạo nội dung AI",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setActiveType(null);
    }
  };

  const getTypeTitle = (type: string) => {
    const typeMap: Record<string, string> = {
      generate_description: "mô tả bất động sản",
      price_estimate: "định giá",
      investment_advice: "tư vấn đầu tư"
    };
    return typeMap[type] || type;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Trợ lý AI Bất động sản</CardTitle>
            <Badge variant="secondary">Beta</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assistantTypes.map((assistant) => {
              const Icon = assistant.icon;
              const isLoading = loading && activeType === assistant.type;
              const hasResult = results[assistant.type];

              return (
                <Card key={assistant.type} className="relative overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-background ${assistant.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{assistant.title}</h4>
                        {hasResult && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Đã tạo
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {assistant.description}
                    </p>

                    <Button
                      size="sm"
                      variant={hasResult ? "outline" : "default"}
                      className="w-full"
                      onClick={() => generateAIContent(assistant.type)}
                      disabled={loading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang tạo...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          {hasResult ? "Tạo lại" : "Tạo AI"}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Results Display */}
      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Kết quả từ AI</h3>
          {Object.entries(results).map(([type, result]) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {getTypeTitle(type)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={result}
                  readOnly
                  className="min-h-[120px] resize-none"
                />
                <div className="flex justify-end mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(result);
                      toast({
                        title: "Đã sao chép!",
                        description: "Nội dung đã được sao chép vào clipboard",
                      });
                    }}
                  >
                    Sao chép
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}