import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building2, Home, Users, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/utils/propertyHelpers';

interface Property {
  id: string;
  title: string;
  price: number;
  property_type: string;
  status: string;
  location: string;
  created_at: string;
  created_by: string;
}

interface DashboardStats {
  totalProperties: number;
  totalUsers: number;
  activeListings: number;
  averagePrice: number;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useAdminRole();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalUsers: 0,
    activeListings: 0,
    averagePrice: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast({
        title: 'Truy cập bị từ chối',
        description: 'Bạn không có quyền truy cập trang này.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [isAdmin, roleLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;

      // Fetch user count
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (userError) throw userError;

      setProperties(propertiesData || []);

      const activeCount = propertiesData?.filter(p => p.status === 'available').length || 0;
      const avgPrice = propertiesData?.length 
        ? propertiesData.reduce((sum, p) => sum + p.price, 0) / propertiesData.length 
        : 0;

      setStats({
        totalProperties: propertiesData?.length || 0,
        totalUsers: userCount || 0,
        activeListings: activeCount,
        averagePrice: avgPrice,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu dashboard.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bất động sản này?')) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: 'Đã xóa bất động sản.',
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa bất động sản.',
        variant: 'destructive',
      });
    }
  };

  const getPropertyTypeData = () => {
    const typeCounts = properties.reduce((acc, property) => {
      acc[property.property_type] = (acc[property.property_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  };

  const getStatusData = () => {
    const statusCounts = properties.reduce((acc, property) => {
      acc[property.status] = (acc[property.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard Quản Trị</h1>
          <p className="text-muted-foreground">Tổng quan và quản lý bất động sản</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng BĐS</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProperties}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Người Dùng</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đang Bán</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeListings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Giá Trung Bình</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(stats.averagePrice)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList>
            <TabsTrigger value="analytics">Phân Tích</TabsTrigger>
            <TabsTrigger value="properties">Quản Lý BĐS</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Phân Bố Theo Loại</CardTitle>
                  <CardDescription>Số lượng bất động sản theo loại hình</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getPropertyTypeData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="hsl(var(--primary))"
                        dataKey="value"
                      >
                        {getPropertyTypeData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trạng Thái</CardTitle>
                  <CardDescription>Phân bố theo trạng thái</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getStatusData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle>Danh Sách Bất Động Sản</CardTitle>
                <CardDescription>Quản lý tất cả bất động sản trong hệ thống</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tiêu Đề</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Vị Trí</TableHead>
                      <TableHead>Trạng Thái</TableHead>
                      <TableHead className="text-right">Thao Tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">{property.title}</TableCell>
                        <TableCell>{property.property_type}</TableCell>
                        <TableCell>{formatPrice(property.price)}</TableCell>
                        <TableCell>{property.location}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            property.status === 'available' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }`}>
                            {property.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/property/${property.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(property.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
