import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Award, 
  TrendingUp,
  Search,
  Building,
  MessageCircle
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  avatar: string;
  title: string;
  specialization: string[];
  location: string;
  rating: number;
  totalSales: number;
  experience: string;
  phone: string;
  email: string;
  description: string;
  verified: boolean;
}

const Agents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('Tất cả');

  const agents: Agent[] = [
    {
      id: '1',
      name: 'Nguyễn Văn An',
      avatar: '/placeholder.svg',
      title: 'Chuyên viên cao cấp',
      specialization: ['Căn hộ', 'Biệt thự'],
      location: 'TP.HCM',
      rating: 4.9,
      totalSales: 150,
      experience: '8 năm',
      phone: '0901234567',
      email: 'an.nguyen@sgsland.com',
      description: 'Chuyên gia về bất động sản cao cấp tại khu vực TP.HCM với hơn 8 năm kinh nghiệm.',
      verified: true,
    },
    {
      id: '2',
      name: 'Trần Thị Bình',
      avatar: '/placeholder.svg',
      title: 'Chuyên viên chính',
      specialization: ['Nhà phố', 'Đất nền'],
      location: 'Hà Nội',
      rating: 4.8,
      totalSales: 120,
      experience: '6 năm',
      phone: '0902345678',
      email: 'binh.tran@sgsland.com',
      description: 'Chuyên tư vấn đất nền và nhà phố tại khu vực Hà Nội và các tỉnh phía Bắc.',
      verified: true,
    },
    {
      id: '3',
      name: 'Lê Hoàng Cường',
      avatar: '/placeholder.svg',
      title: 'Chuyên viên',
      specialization: ['Căn hộ', 'Nhà phố'],
      location: 'Đà Nẵng',
      rating: 4.7,
      totalSales: 85,
      experience: '4 năm',
      phone: '0903456789',
      email: 'cuong.le@sgsland.com',
      description: 'Am hiểu thị trường bất động sản miền Trung, đặc biệt là khu vực Đà Nẵng.',
      verified: true,
    },
    {
      id: '4',
      name: 'Phạm Minh Đức',
      avatar: '/placeholder.svg',
      title: 'Chuyên viên cao cấp',
      specialization: ['Biệt thự', 'Căn hộ'],
      location: 'TP.HCM',
      rating: 4.9,
      totalSales: 200,
      experience: '10 năm',
      phone: '0904567890',
      email: 'duc.pham@sgsland.com',
      description: 'Chuyên gia hàng đầu về bất động sản cao cấp và dự án lớn tại TP.HCM.',
      verified: true,
    },
  ];

  const specializations = ['Tất cả', 'Căn hộ', 'Nhà phố', 'Biệt thự', 'Đất nền'];

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialization = selectedSpecialization === 'Tất cả' || 
                                 agent.specialization.includes(selectedSpecialization);
    return matchesSearch && matchesSpecialization;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Đội ngũ môi giới</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Kết nối với các chuyên viên bất động sản chuyên nghiệp và uy tín
          </p>
        </section>

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc khu vực..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {specializations.map((spec) => (
              <Button
                key={spec}
                variant={selectedSpecialization === spec ? 'default' : 'outline'}
                onClick={() => setSelectedSpecialization(spec)}
                size="sm"
              >
                <Building className="h-4 w-4 mr-1" />
                {spec}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="text-3xl font-bold mb-1">500+</h3>
              <p className="text-muted-foreground">Giao dịch thành công</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="text-3xl font-bold mb-1">50+</h3>
              <p className="text-muted-foreground">Môi giới chuyên nghiệp</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="text-3xl font-bold mb-1">4.8/5</h3>
              <p className="text-muted-foreground">Đánh giá trung bình</p>
            </CardContent>
          </Card>
        </div>

        {/* Agents Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Môi giới nổi bật</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={agent.avatar} alt={agent.name} />
                      <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{agent.name}</h3>
                        {agent.verified && (
                          <Badge variant="secondary" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {agent.title}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{agent.rating}</span>
                        <span className="text-sm text-muted-foreground">
                          ({agent.totalSales} giao dịch)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {agent.specialization.map((spec) => (
                      <Badge key={spec} variant="outline">
                        {spec}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {agent.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {agent.location}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      Kinh nghiệm: {agent.experience}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      <Phone className="h-4 w-4 mr-1" />
                      Gọi
                    </Button>
                    <Button size="sm" className="w-full btn-gradient">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAgents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Không tìm thấy môi giới phù hợp
              </p>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="mt-16">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-12 px-6 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Bạn muốn trở thành môi giới của chúng tôi?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Gia nhập đội ngũ chuyên nghiệp với hoa hồng hấp dẫn và cơ hội phát triển
              </p>
              <Button size="lg" className="btn-gradient">
                <Mail className="h-5 w-5 mr-2" />
                Gửi hồ sơ ứng tuyển
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Agents;
