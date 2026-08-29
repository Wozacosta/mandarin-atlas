import type { Metadata } from 'next';
import { Geist, Noto_Serif_SC } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const notoSerifSC = Noto_Serif_SC({ variable: '--font-noto-serif-sc', subsets: ['latin'], weight: ['500', '600', '700'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://mandarin-atlas-one.vercel.app'),
  title: 'Mandarin Atlas — Your map to fluency',
  description: 'A clear, level-by-level path through Chinese study, books, apps, film, and native media.',
  openGraph: {
    title: 'Mandarin Atlas — Your map to fluency',
    description: 'Know what to learn, read, watch, and listen to at every stage of Chinese.',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Mandarin Atlas — Your map to fluency.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mandarin Atlas — Your map to fluency',
    description: 'Know what to learn, read, watch, and listen to at every stage of Chinese.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geistSans.variable} ${notoSerifSC.variable} antialiased`}>{children}</body></html>;
}
