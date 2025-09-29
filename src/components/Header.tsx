import { Building2, Heart, Menu, Search, User, Plus, LogOut, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
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
          <button 
            onClick={() => navigate('/')}
            className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
          >
            Trang chủ
          </button>
          <button 
            onClick={() => navigate('/properties')}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth"
          >
            Mua bán
          </button>
          <button 
            onClick={() => navigate('/properties')}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth"
          >
            Cho thuê
          </button>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth">
            Tin tức
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth">
            Liên hệ
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10"
            onClick={() => navigate('/properties')}
          >
            <Search className="h-5 w-5" />
          </Button>
          
          {user ? (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10"
                onClick={() => navigate('/favorites')}
              >
                <Heart className="h-5 w-5" />
              </Button>
              
              <Button 
                onClick={() => navigate('/add-property')}
                className="hidden md:flex btn-gradient"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Đăng tin
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Hồ sơ
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/favorites')}>
                    Yêu thích
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/my-properties')}>
                    Tin đã đăng
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button 
              onClick={() => navigate('/auth')}
              className="btn-gradient"
            >
              Đăng nhập
            </Button>
          )}
          
          <ThemeToggle />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <div className="container px-4 py-4 space-y-4">
            <button 
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-medium text-foreground hover:text-primary"
            >
              Trang chủ
            </button>
            <button 
              onClick={() => {
                navigate('/properties');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Mua bán
            </button>
            <button 
              onClick={() => {
                navigate('/properties');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Cho thuê
            </button>
            
            {user && (
              <>
                <Button 
                  onClick={() => {
                    navigate('/add-property');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full btn-gradient mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Đăng tin
                </Button>
                <div className="border-t pt-4 space-y-2">
                  <button 
                    onClick={() => {
                      navigate('/profile');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary"
                  >
                    Hồ sơ
                  </button>
                  <button 
                    onClick={() => {
                      navigate('/favorites');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary"
                  >
                    Yêu thích
                  </button>
                  <button 
                    onClick={() => {
                      navigate('/my-properties');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary"
                  >
                    Tin đã đăng
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}