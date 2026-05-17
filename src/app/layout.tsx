import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import ToasterProvider from '@/components/ToasterProvider';
import TopNav from '@/components/layout/TopNav';
import BottomNav from '@/components/layout/BottomNav';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'BeLife - Stories for a Greener World',
  description: 'Discover mindful living, eco-tips and sustainable stories from a community that cares.',
  keywords: ['sustainability', 'eco-friendly', 'nature', 'green living', 'blog'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-cream-50 text-gray-900 font-sans antialiased">
        <TopNav />
        {children}
        <BottomNav />
        <ToasterProvider />
      </body>
    </html>
  );
}
