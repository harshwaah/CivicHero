import type {Metadata} from 'next';
import { Plus_Jakarta_Sans, Be_Vietnam_Pro, Inter } from 'next/font/google';
import { MapProvider } from '@/lib/providers/maps/mapProvider';
import { AIProvider } from '@/lib/providers/ai/aiProvider';
import './globals.css'; // Global styles

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'CivicHero - Trust Through Transparency',
  description: 'A transparent civic operating system where citizens, communities, and local administrations collaborate to identify, verify, prioritize and resolve hyperlocal civic issues.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${beVietnamPro.variable} ${inter.variable}`}>
      <body className="bg-brand-bg text-brand-text antialiased min-h-screen" suppressHydrationWarning>
        <AIProvider>
          <MapProvider>
            {children}
          </MapProvider>
        </AIProvider>
      </body>
    </html>
  );
}

