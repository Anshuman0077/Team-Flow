import { HeroHeader } from "@/components/header";
import HeroSection from "@/app/(marketing)/_components/hero-section";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/themeToggle";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      {/* You can uncomment and use these for testing */}
      {/* <h1>Hello world!</h1>
      <Button>Hello world! welcome to my first manual code project </Button>
      <ThemeToggle /> */}
      
      {/* Render the header and hero section components */}
      <HeroHeader />
      <HeroSection />   
    </div>
  );
}