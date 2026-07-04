import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import StorySection from '../components/StorySection';
import FeaturedDishSection from '../components/FeaturedDishSection';
import MenuSection from '../components/MenuSection';
import ReservationSection from '../components/ReservationSection';
import Footer from '../components/Footer';
import '../components/home.css';

export default function Home() {
  return (
    <div className="fade-in">
      <Header />
      <main>
        <HeroSection />
        <StorySection />
        <FeaturedDishSection />
        <MenuSection />
        <ReservationSection />
      </main>
      <Footer />
    </div>
  );
}
