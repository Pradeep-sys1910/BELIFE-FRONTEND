import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import ToasterProvider from '@/components/ToasterProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'BeLife - Stories: Nature. Living: Better.',
  description: 'Your digital sanctuary for mindful living, green choices, and a better planet.',
  keywords: ['sustainability', 'eco-friendly', 'nature', 'green living', 'blog'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-cream-50 text-forest-700 font-sans antialiased">
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}