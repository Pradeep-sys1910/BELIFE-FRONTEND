import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import LatestBlogs from '@/components/home/LatestBlogs';
import Categories from '@/components/home/Categories';
import Newsletter from '@/components/home/Newsletter';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <LatestBlogs />
      <Categories />
      <Newsletter />
      <Footer />
    </main>
  );
}