import { Header } from "@/components/Header"
import { Hero } from "@/components/Hero"
import { PropertyCategories } from "@/components/PropertyCategories"
import { FeaturedProperties } from "@/components/FeaturedProperties"
import { Footer } from "@/components/Footer"

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <PropertyCategories />
        <FeaturedProperties />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
