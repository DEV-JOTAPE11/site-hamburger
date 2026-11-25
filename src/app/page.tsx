import Burger3D from "@/components/Burger3D";
import { StageProvider } from "@/components/StageProvider";
import Combos from "@/sections/Combos";
import Delivery from "@/sections/Delivery";
import Feature from "@/sections/Feature";
import Footer from "@/sections/Footer";
import Gallery from "@/sections/Gallery";
import Hero from "@/sections/Hero";
import Kitchen from "@/sections/Kitchen";
import Menu from "@/sections/Menu";
import Novo from "@/sections/Novo";
import Process from "@/sections/Process";
import Ticker from "@/sections/Ticker";
import Visit from "@/sections/Visit";

export default function Home() {
  return (
    <StageProvider>
      <main>
        <Hero />
        <Feature />
        <Ticker />
        <Menu />
        <Novo />
        <Kitchen />
        <Combos />
        <Process />
        <Gallery />
        <Delivery />
        <Visit />
      </main>
      <Footer />
      <Burger3D />
    </StageProvider>
  );
}
