import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { User, Phone, Mail, Edit3, Save, X } from 'lucide-react';
import { z } from 'zod';

const profileSchema = z.object({
  full_name: z.string().min(1, 'Tên không được để trống').max(100, 'Tên không được quá 100 ký tự'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Giới thiệu không được quá 500 ký tự').optional(),
});

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          bio: data.bio || '',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thông tin hồ sơ',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      profileSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Lỗi validation',
          description: error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          bio: formData.bio || null,
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      await fetchProfile();
      setEditing(false);
      toast({
        title: 'Thành công',
        description: 'Cập nhật hồ sơ thành công',
      });
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật hồ sơ',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
    });
    setEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Vui lòng đăng nhập để xem hồ sơ
            </h1>
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
            <p className="text-muted-foreground">Đang tải hồ sơ...</p>
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
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Hồ sơ cá nhân</h1>
            <p className="text-muted-foreground">Quản lý thông tin cá nhân của bạn</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Thông tin cá nhân
                  </CardTitle>
                  <CardDescription>
                    Cập nhật thông tin hồ sơ của bạn
                  </CardDescription>
                </div>
                {!editing ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Hủy
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-gradient"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Email không thể thay đổi
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Họ và tên *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!editing}
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Số điện thoại
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!editing}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Giới thiệu bản thân</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!editing}
                  placeholder="Giới thiệu ngắn về bản thân..."
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.bio.length}/500 ký tự
                </p>
              </div>

              {profile && (
                <div className="pt-4 border-t text-sm text-muted-foreground">
                  <p>Tài khoản được tạo: {new Date(profile.created_at).toLocaleDateString('vi-VN')}</p>
                  <p>Cập nhật lần cuối: {new Date(profile.updated_at).toLocaleDateString('vi-VN')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}