import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: 'Gửi thành công!',
      description: 'Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.',
    });

    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Địa chỉ',
      content: '122 Nguyễn Văn Linh, Quận 7, TP.HCM',
    },
    {
      icon: Phone,
      title: 'Điện thoại',
      content: '1900 xxxx',
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'contact@sgsland.com',
    },
    {
      icon: Clock,
      title: 'Giờ làm việc',
      content: 'T2 - T7: 8:00 - 18:00',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hãy để lại thông tin, chúng tôi sẽ liên hệ tư vấn miễn phí cho bạn
          </p>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Gửi tin nhắn cho chúng tôi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Họ và tên <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Số điện thoại <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0912345678"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">
                    Tiêu đề <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Tôi muốn được tư vấn về..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">
                    Nội dung <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Vui lòng mô tả chi tiết nhu cầu của bạn..."
                    rows={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full btn-gradient"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Đang gửi...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Gửi tin nhắn
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info & Map */}
          <div className="space-y-6">
            {/* Contact Info Cards */}
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <info.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{info.title}</h3>
                        <p className="text-muted-foreground text-sm">
                          {info.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Map */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-square relative overflow-hidden rounded-lg">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.954654365869!2d106.69917631533444!3d10.733752762765426!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752fbd6f5b8d43%3A0x1619db32acfc2e6!2zMTIyIE5ndXnhu4VuIFbEg24gTGluaCwgVMOibiBI4bqtbmcsIFF14bqtbiA3LCBI4buTIENow60gTWluaA!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <section className="mt-16 text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-12 px-6">
              <h2 className="text-3xl font-bold mb-4">
                Cần tư vấn ngay lập tức?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Đội ngũ chuyên viên của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="btn-gradient">
                  <Phone className="h-5 w-5 mr-2" />
                  Gọi ngay: 1900 xxxx
                </Button>
                <Button size="lg" variant="outline">
                  <Mail className="h-5 w-5 mr-2" />
                  Email: contact@sgsland.com
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
