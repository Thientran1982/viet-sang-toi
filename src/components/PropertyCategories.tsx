import { Building2, Home, TreePine, Building } from "lucide-react"

const categories = [
  {
    icon: Home,
    title: "Nhà riêng",
    description: "Nhà đất, biệt thự độc lập",
    count: "2,500+",
    color: "text-primary"
  },
  {
    icon: Building2,
    title: "Chung cư",
    description: "Căn hộ, condotel, officetel", 
    count: "5,200+",
    color: "text-secondary"
  },
  {
    icon: Building,
    title: "Nhà phố",
    description: "Shophouse, townhouse",
    count: "1,800+", 
    color: "text-accent"
  },
  {
    icon: TreePine,
    title: "Biệt thự",
    description: "Villa, resort, nghỉ dưỡng",
    count: "900+",
    color: "text-emerald-500"
  }
]

export function PropertyCategories() {
  return (
    <section className="py-16">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Danh mục bất động sản
          </h2>
          <p className="text-lg text-muted-foreground">
            Tìm kiếm theo loại hình bất động sản phù hợp với nhu cầu của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <div 
                key={index}
                className="group p-8 rounded-2xl border border-border hover:border-primary/20 transition-smooth cursor-pointer bg-gradient-card hover:shadow-property"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gray-50 dark:bg-gray-800 mb-4 group-hover:scale-110 transition-smooth ${category.color}`}>
                  <Icon className="h-8 w-8" />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {category.title}
                </h3>
                
                <p className="text-muted-foreground mb-4 text-sm">
                  {category.description}
                </p>
                
                <div className="text-2xl font-bold text-primary">
                  {category.count}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Bất động sản
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}