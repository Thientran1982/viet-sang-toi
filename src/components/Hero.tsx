import { MapPin, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import heroVilla from "@/assets/hero-villa.jpg"

export function Hero() {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroVilla} 
          alt="Biệt thự hiện đại" 
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 hero-bg z-10" />

      {/* Content */}
      <div className="relative z-20 container px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Tìm ngôi nhà
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              mơ ước của bạn
            </span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Khám phá hàng nghìn bất động sản chất lượng cao tại Việt Nam. 
            Từ biệt thự sang trọng đến chung cư hiện đại.
          </p>

          {/* Search Bar */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-property max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="Nhập địa điểm bạn muốn tìm..."
                    className="pl-10 h-12 border-0 bg-gray-50 text-base"
                  />
                </div>
              </div>
              <Select>
                <SelectTrigger className="h-12 border-0 bg-gray-50">
                  <SelectValue placeholder="Loại nhà" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Chung cư</SelectItem>
                  <SelectItem value="house">Nhà riêng</SelectItem>
                  <SelectItem value="villa">Biệt thự</SelectItem>
                  <SelectItem value="townhouse">Nhà phố</SelectItem>
                </SelectContent>
              </Select>
              <Button className="h-12 btn-gradient text-white font-semibold">
                <Search className="w-5 h-5 mr-2" />
                Tìm kiếm
              </Button>
            </div>
            
            {/* Quick Stats */}
            <div className="flex justify-center space-x-8 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Bất động sản</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">500+</div>
                <div className="text-sm text-muted-foreground">Đối tác</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">50K+</div>
                <div className="text-sm text-muted-foreground">Khách hàng</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}