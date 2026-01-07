import { HeroHeader } from "@/components/header";
import HeroSection from "@/app/(marketing)/_components/hero-section";

export default function Home() {
  return (
    <div>      
      {/* Render the header and hero section components */}
      <HeroHeader />
      <HeroSection />   
    </div>
  );
}