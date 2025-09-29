import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";

const propertySchema = z.object({
  title: z.string().min(10, "Tiêu đề phải có ít nhất 10 ký tự").max(200, "Tiêu đề không được vượt quá 200 ký tự"),
  description: z.string().min(50, "Mô tả phải có ít nhất 50 ký tự").max(2000, "Mô tả không được vượt quá 2000 ký tự"),
  property_type: z.string().min(1, "Vui lòng chọn loại bất động sản"),
  price: z.number().min(1, "Giá phải lớn hơn 0"),
  location: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự").max(200, "Địa chỉ không được vượt quá 200 ký tự"),
  area: z.number().min(1, "Diện tích phải lớn hơn 0"),
  bedrooms: z.number().min(0, "Số phòng ngủ không thể âm"),
  bathrooms: z.number().min(0, "Số phòng tắm không thể âm"),
  contact_name: z.string().min(2, "Tên liên hệ phải có ít nhất 2 ký tự").max(100, "Tên không được vượt quá 100 ký tự"),
  contact_phone: z.string().regex(/^[0-9+\-\s()]{10,15}$/, "Số điện thoại không hợp lệ"),
  contact_email: z.string().email("Email không hợp lệ").optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

const PropertyForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [propertyImages, setPropertyImages] = useState<string[]>([]);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      description: "",
      property_type: "",
      price: 0,
      location: "",
      area: 0,
      bedrooms: 0,
      bathrooms: 0,
      contact_name: "",
      contact_phone: "",
      contact_email: "",
    },
  });

  const amenitiesList = [
    "Điều hòa",
    "Thang máy",
    "Bãi đỗ xe",
    "Hồ bơi",
    "Gym",
    "An ninh 24/7",
    "Siêu thị",
    "Trường học",
    "Bệnh viện",
    "Gần trung tâm",
    "Balcony",
    "Sân vườn"
  ];

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities(prev => [...prev, amenity]);
    } else {
      setSelectedAmenities(prev => prev.filter(a => a !== amenity));
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (!user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để đăng tin",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const propertyData = {
        title: data.title.trim(),
        description: data.description.trim(),
        property_type: data.property_type,
        price: data.price,
        location: data.location.trim(),
        area: data.area,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        amenities: selectedAmenities,
        contact_info: {
          name: data.contact_name.trim(),
          phone: data.contact_phone.trim(),
          email: data.contact_email?.trim() || null,
        },
        created_by: user.id,
        images: propertyImages,
        featured: false,
        status: 'available'
      };

      const { data: newProperty, error } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã đăng tin bất động sản thành công",
      });

      navigate(`/property/${newProperty.id}`);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể đăng tin bất động sản",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-semibold mb-4">Yêu cầu đăng nhập</h2>
            <p className="text-muted-foreground mb-6">
              Bạn cần đăng nhập để đăng tin bất động sản
            </p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/properties')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold">Đăng tin bất động sản</h1>
          <p className="text-muted-foreground">
            Điền thông tin chi tiết để đăng tin bất động sản của bạn
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tiêu đề *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="VD: Chung cư cao cấp 2PN view sông Hàn, nội thất đầy đủ"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả chi tiết *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Mô tả chi tiết về bất động sản, vị trí, tiện ích xung quanh..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="property_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loại bất động sản *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn loại BDS" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="apartment">Chung cư</SelectItem>
                              <SelectItem value="house">Nhà riêng</SelectItem>
                              <SelectItem value="villa">Biệt thự</SelectItem>
                              <SelectItem value="townhouse">Nhà phố</SelectItem>
                              <SelectItem value="land">Đất nền</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giá (VNĐ) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="5000000000"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Địa chỉ *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="VD: 123 Trần Phú, Hai Châu, Đà Nẵng"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Property Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Chi tiết bất động sản</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diện tích (m²) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="100"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số phòng ngủ</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="2"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số phòng tắm</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="2"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Property Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Hình ảnh bất động sản</h3>
                  <ImageUpload
                    onImagesChange={setPropertyImages}
                    maxImages={8}
                    existingImages={propertyImages}
                  />
                </div>

                {/* Amenities */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Tiện ích</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {amenitiesList.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={(checked) => 
                            handleAmenityChange(amenity, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={amenity}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Thông tin liên hệ</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contact_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên liên hệ *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nguyễn Văn A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contact_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số điện thoại *</FormLabel>
                          <FormControl>
                            <Input placeholder="0123456789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (không bắt buộc)</FormLabel>
                        <FormControl>
                          <Input placeholder="example@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/properties')}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-gradient"
                  >
                    {loading ? "Đang đăng..." : "Đăng tin"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyForm;