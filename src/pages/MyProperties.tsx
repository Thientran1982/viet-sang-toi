import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Building, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  status: string;
  created_at: string;
  updated_at: string;
}

export default function MyProperties() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyProperties();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMyProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProperties(data || []);
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách bất động sản',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty = async (propertyId: string) => {
    setDeleting(propertyId);
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
        .eq('created_by', user?.id);

      if (error) throw error;

      setProperties(prev => prev.filter(prop => prop.id !== propertyId));
      toast({
        title: 'Thành công',
        description: 'Đã xóa bất động sản',
      });
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa bất động sản',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: { label: 'Còn trống', variant: 'default' as const },
      sold: { label: 'Đã bán', variant: 'secondary' as const },
      rented: { label: 'Đã cho thuê', variant: 'secondary' as const },
      pending: { label: 'Đang xử lý', variant: 'outline' as const },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.available;
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="text-center max-w-md mx-auto">
            <Building className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Vui lòng đăng nhập
            </h1>
            <p className="text-muted-foreground mb-6">
              Bạn cần đăng nhập để xem danh sách bất động sản đã đăng
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
            <p className="text-muted-foreground">Đang tải danh sách bất động sản...</p>
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Bất động sản của tôi
              </h1>
            </div>
            <Button 
              onClick={() => navigate('/add-property')}
              className="btn-gradient"
            >
              <Plus className="h-4 w-4 mr-2" />
              Đăng tin mới
            </Button>
          </div>
          <p className="text-muted-foreground">
            {properties.length > 0 
              ? `Bạn có ${properties.length} bất động sản đã đăng`
              : 'Bạn chưa đăng tin bất động sản nào'
            }
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-16">
            <Building className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Chưa có tin đăng nào
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Bạn chưa đăng tin bất động sản nào. 
              Hãy đăng tin đầu tiên để bắt đầu bán hoặc cho thuê!
            </p>
            <Button 
              onClick={() => navigate('/add-property')}
              className="btn-gradient"
            >
              <Plus className="h-4 w-4 mr-2" />
              Đăng tin ngay
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="relative">
                <div className="property-card rounded-2xl overflow-hidden group">
                  {/* Image */}
                  <div className="relative">
                    <img 
                      src={property.images?.[0] || '/placeholder.svg'} 
                      alt={property.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-smooth"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {property.featured && (
                        <Badge className="bg-accent text-accent-foreground font-semibold">
                          Nổi bật
                        </Badge>
                      )}
                      {getStatusBadge(property.status)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {property.property_type}
                      </Badge>
                      <div className="text-2xl font-bold text-primary">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(property.price)}
                      </div>
                    </div>

                    <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2">
                      {property.title}
                    </h3>

                    <div className="flex items-center text-muted-foreground mb-4">
                      <span className="text-sm">{property.location}</span>
                    </div>

                    {/* Property Stats */}
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                      <span>{property.bedrooms} PN</span>
                      <span>{property.bathrooms} WC</span>
                      <span>{property.area}m²</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/property/${property.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Xem
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/edit-property/${property.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline"
                            size="sm"
                            disabled={deleting === property.id}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa bất động sản "{property.title}"? 
                              Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteProperty(property.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                      Đăng: {new Date(property.created_at).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}