import type { Metadata } from 'next';
import { Geist, Noto_Serif_SC } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const notoSerifSC = Noto_Serif_SC({ variable: '--font-noto-serif-sc', subsets: ['latin'], weight: ['500', '600', '700'] });

export const metadata: Metadata = {
  title: '句子 Jùzi — Chinese grammar that sticks',
  description: 'Learn Chinese grammar through sentence mining and spaced repetition.',
  openGraph: {
    title: '句子 Jùzi',
    description: 'Chinese grammar that sticks.',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: '句子 Jùzi — Chinese grammar that sticks.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '句子 Jùzi',
    description: 'Chinese grammar that sticks.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geistSans.variable} ${notoSerifSC.variable} antialiased`}>{children}</body></html>;
}
