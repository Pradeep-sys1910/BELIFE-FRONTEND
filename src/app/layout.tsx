import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import ToasterProvider from '@/components/ToasterProvider';
import SideNav from '@/components/layout/SideNav';
import BottomNav from '@/components/layout/BottomNav';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.belife.site'),
  title: {
    default: 'BeLife – Stories for a Greener World',
    template: '%s | BeLife',
  },
  description: 'Discover mindful living, eco-tips and sustainable stories from a community that cares about the planet.',
  keywords: ['sustainability', 'eco-friendly', 'nature', 'green living', 'environment', 'blog', 'mindful living', 'climate'],
  authors: [{ name: 'BeLife', url: 'https://www.belife.site' }],
  creator: 'BeLife',
  publisher: 'BeLife',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.belife.site',
    siteName: 'BeLife',
    title: 'BeLife – Stories for a Greener World',
    description: 'Discover mindful living, eco-tips and sustainable stories from a community that cares about the planet.',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'BeLife' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BeLife – Stories for a Greener World',
    description: 'Discover mindful living, eco-tips and sustainable stories from a community that cares about the planet.',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: 'https://www.belife.site',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="flex min-h-screen">
          <SideNav />
          <main className="flex-1 md:ml-[244px] pb-20 md:pb-0 min-w-0">
            {children}
          </main>
        </div>
        <BottomNav />
        <ToasterProvider />
      </body>
    </html>
  );
}
