import { PropertyCard } from "@/components/PropertyCard"
import apartmentHcm from "@/assets/apartment-hcm.jpg"
import townhouseHanoi from "@/assets/townhouse-hanoi.jpg"
import penthouseInterior from "@/assets/penthouse-interior.jpg"
import heroVilla from "@/assets/hero-villa.jpg"

const featuredProperties = [
  {
    id: 1,
    image: heroVilla,
    title: "Biệt thự sang trọng Garden Villa",
    location: "Quận 2, TP.HCM",
    price: "45 tỷ",
    beds: 5,
    baths: 4,
    area: 350,
    type: "Biệt thự",
    featured: true
  },
  {
    id: 2,
    image: apartmentHcm,
    title: "Chung cư cao cấp Landmark 81",
    location: "Quận 1, TP.HCM", 
    price: "8.5 tỷ",
    beds: 3,
    baths: 2,
    area: 120,
    type: "Chung cư",
    featured: true
  },
  {
    id: 3,
    image: townhouseHanoi,
    title: "Nhà phố hiện đại French Quarter",
    location: "Ba Đình, Hà Nội",
    price: "25 tỷ",
    beds: 4,
    baths: 3,
    area: 200,
    type: "Nhà phố",
    featured: false
  },
  {
    id: 4,
    image: penthouseInterior,
    title: "Penthouse view sông Sài Gòn",
    location: "Quận 4, TP.HCM",
    price: "15 tỷ",
    beds: 3,
    baths: 3,
    area: 180,
    type: "Penthouse",
    featured: true
  }
]

export function FeaturedProperties() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Bất động sản nổi bật
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Khám phá những căn nhà đẹp nhất được tuyển chọn kỹ lưỡng bởi đội ngũ chuyên gia của chúng tôi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredProperties.map((property) => (
            <PropertyCard 
              key={property.id}
              image={property.image}
              title={property.title}
              location={property.location}
              price={property.price}
              beds={property.beds}
              baths={property.baths}
              area={property.area}
              type={property.type}
              featured={property.featured}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <button className="btn-gradient px-8 py-3 rounded-xl text-white font-semibold transition-smooth hover:shadow-lg">
            Xem tất cả bất động sản
          </button>
        </div>
      </div>
    </section>
  )
}