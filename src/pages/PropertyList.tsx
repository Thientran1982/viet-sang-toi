import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Grid, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  featured: boolean;
  status: string;
  created_at: string;
}

const PropertyList = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("created_at");
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // Filter states
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");

  useEffect(() => {
    fetchProperties();
  }, [sortBy, propertyType, minPrice, maxPrice, bedrooms, bathrooms]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'available');

      // Apply filters
      if (propertyType) {
        query = query.eq('property_type', propertyType);
      }

      if (minPrice) {
        query = query.gte('price', parseInt(minPrice));
      }

      if (maxPrice) {
        query = query.lte('price', parseInt(maxPrice));
      }

      if (bedrooms) {
        query = query.eq('bedrooms', parseInt(bedrooms));
      }

      if (bathrooms) {
        query = query.eq('bathrooms', parseInt(bathrooms));
      }

      // Apply sorting
      if (sortBy === 'price_low') {
        query = query.order('price', { ascending: true });
      } else if (sortBy === 'price_high') {
        query = query.order('price', { ascending: false });
      } else if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      setProperties(data || []);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách bất động sản",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      // Search implementation - could be enhanced with full-text search
      const filtered = properties.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setProperties(filtered);
    } else {
      fetchProperties();
    }
  };

  const clearFilters = () => {
    setPropertyType("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setBathrooms("");
    setSearchTerm("");
    fetchProperties();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero py-12">
        <div className="container px-4">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Tìm Bất Động Sản
          </h1>
          <p className="text-lg text-muted-foreground">
            Khám phá hàng nghìn bất động sản chất lượng cao
          </p>
        </div>
      </div>

      <div className="container px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, địa điểm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} className="btn-gradient">
              Tìm kiếm
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Bộ lọc</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger>
                <SelectValue placeholder="Loại BDS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">Chung cư</SelectItem>
                <SelectItem value="house">Nhà riêng</SelectItem>
                <SelectItem value="villa">Biệt thự</SelectItem>
                <SelectItem value="townhouse">Nhà phố</SelectItem>
                <SelectItem value="land">Đất nền</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Giá từ (VNĐ)"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              type="number"
            />

            <Input
              placeholder="Giá đến (VNĐ)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              type="number"
            />

            <Select value={bedrooms} onValueChange={setBedrooms}>
              <SelectTrigger>
                <SelectValue placeholder="Phòng ngủ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 phòng</SelectItem>
                <SelectItem value="2">2 phòng</SelectItem>
                <SelectItem value="3">3 phòng</SelectItem>
                <SelectItem value="4">4+ phòng</SelectItem>
              </SelectContent>
            </Select>

            <Select value={bathrooms} onValueChange={setBathrooms}>
              <SelectTrigger>
                <SelectValue placeholder="Phòng tắm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 phòng</SelectItem>
                <SelectItem value="2">2 phòng</SelectItem>
                <SelectItem value="3">3+ phòng</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              Xóa bộ lọc
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {properties.length} bất động sản
            </span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="price_low">Giá thấp đến cao</SelectItem>
                <SelectItem value="price_high">Giá cao đến thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Property Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-48 rounded-lg mb-4"></div>
                <div className="bg-muted h-4 rounded mb-2"></div>
                <div className="bg-muted h-4 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              Không tìm thấy bất động sản nào phù hợp
            </p>
          </div>
        ) : (
          <div className={`${
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
          }`}>
            {properties.map((property) => (
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
        )}
      </div>
    </div>
  );
};

export default PropertyList;