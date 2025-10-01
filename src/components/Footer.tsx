import { Building2, Facebook, Instagram, Twitter, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">NhàĐẹp</h3>
                <p className="text-xs text-gray-400">Bất động sản</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              Nền tảng bất động sản hàng đầu Việt Nam, kết nối người mua và người bán một cách hiệu quả nhất.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-smooth cursor-pointer">
                <Facebook className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-smooth cursor-pointer">
                <Instagram className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-smooth cursor-pointer">
                <Twitter className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-smooth cursor-pointer">
                <Youtube className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-primary transition-smooth">Trang chủ</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Mua bán</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Cho thuê</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Tin tức</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Liên hệ</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Dịch vụ</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-primary transition-smooth">Định giá BĐS</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Tư vấn đầu tư</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Hỗ trợ pháp lý</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Môi giới</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Quản lý tài sản</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Liên hệ</h4>
            <div className="space-y-2">
              <p className="text-gray-400">
                📍 123 Nguyễn Huệ, Quận 1, TP.HCM
              </p>
              <p className="text-gray-400">
                📞 (+84) 123 456 789
              </p>
              <p className="text-gray-400">
                ✉️ contact@nhadep.vn
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 NhàĐẹp. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}