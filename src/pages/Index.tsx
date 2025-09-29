import { Header } from "@/components/Header"
import { Hero } from "@/components/Hero"
import { PropertyCategories } from "@/components/PropertyCategories"
import { FeaturedProperties } from "@/components/FeaturedProperties"
import { Footer } from "@/components/Footer"
import { AISearchBox } from "@/components/AISearchBox"
import { AIRecommendations } from "@/components/AIRecommendations"

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <div className="container px-4 py-16">
          <AISearchBox />
        </div>
        <PropertyCategories />
        <FeaturedProperties />
        <div className="container px-4 py-16">
          <AIRecommendations />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
