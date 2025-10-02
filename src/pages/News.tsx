import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Tag, Search, TrendingUp } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
}

const News = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const articles: NewsArticle[] = [
    {
      id: '1',
      title: 'Xu hướng thị trường BĐS TP.HCM Quý 1/2025',
      excerpt: 'Phân tích chi tiết về sự phục hồi mạnh mẽ của thị trường bất động sản TP.HCM trong quý đầu năm 2025, với giá tăng trung bình 15%...',
      category: 'Thị trường',
      date: '2025-10-01',
      readTime: '5 phút đọc',
      image: '/hero-villa.jpg',
      featured: true,
    },
    {
      id: '2',
      title: 'Bí quyết đầu tư BĐS sinh lời cao',
      excerpt: 'Chia sẻ từ các chuyên gia về cách lựa chọn vị trí, thời điểm và loại hình bất động sản để đầu tư hiệu quả nhất...',
      category: 'Tư vấn',
      date: '2025-09-28',
      readTime: '8 phút đọc',
      image: '/apartment-hcm.jpg',
    },
    {
      id: '3',
      title: 'Chính sách hỗ trợ vay mua nhà 2025',
      excerpt: 'Tổng hợp các gói vay ưu đãi từ ngân hàng và chính sách hỗ trợ của chính phủ cho người mua nhà lần đầu...',
      category: 'Chính sách',
      date: '2025-09-25',
      readTime: '6 phút đọc',
      image: '/townhouse-hanoi.jpg',
    },
    {
      id: '4',
      title: 'Top 10 dự án căn hộ đáng chú ý Hà Nội',
      excerpt: 'Điểm qua các dự án căn hộ cao cấp và trung cấp được đánh giá cao về chất lượng, vị trí và tiện ích tại Hà Nội...',
      category: 'Dự án',
      date: '2025-09-20',
      readTime: '10 phút đọc',
      image: '/penthouse-interior.jpg',
    },
  ];

  const categories = ['Tất cả', 'Thị trường', 'Tư vấn', 'Chính sách', 'Dự án'];
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === 'Tất cả' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = articles.find(a => a.featured);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Tin tức Bất động sản</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cập nhật xu hướng thị trường, chính sách và kiến thức đầu tư BĐS mới nhất
            </p>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm kiếm tin tức..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
                size="sm"
              >
                {cat}
              </Button>
            ))}
          </div>
        </section>

        {/* Featured Article */}
        {featuredArticle && selectedCategory === 'Tất cả' && !searchQuery && (
          <Card className="mb-12 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/news/${featuredArticle.id}`)}>
            <div className="grid md:grid-cols-2 gap-0">
              <div className="aspect-video md:aspect-auto relative">
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-primary">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Nổi bật
                </Badge>
              </div>
              <CardContent className="p-8 flex flex-col justify-center">
                <Badge variant="secondary" className="w-fit mb-3">
                  <Tag className="h-3 w-3 mr-1" />
                  {featuredArticle.category}
                </Badge>
                <h2 className="text-3xl font-bold mb-4">{featuredArticle.title}</h2>
                <p className="text-muted-foreground mb-6 line-clamp-3">
                  {featuredArticle.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(featuredArticle.date).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {featuredArticle.readTime}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        )}

        {/* Articles Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Bài viết mới nhất</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => navigate(`/news/${article.id}`)}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">
                    <Tag className="h-3 w-3 mr-1" />
                    {article.category}
                  </Badge>
                  <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(article.date).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {article.readTime}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Không tìm thấy bài viết phù hợp
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default News;
