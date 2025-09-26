import { Building2, Heart, Menu, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">NhàĐẹp</h1>
            <p className="text-xs text-muted-foreground">Bất động sản</p>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
            Trang chủ
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth">
            Mua bán
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth">
            Cho thuê
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth">
            Tin tức
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth">
            Liên hệ
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Heart className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}