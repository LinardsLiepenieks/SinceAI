import type { Metadata } from 'next';
import { Poppins, Geist_Mono } from 'next/font/google';
import './globals.css';
import { PDFProvider } from '@/contexts/PDFContext';
import { ExtractionDataProvider } from '@/contexts/ExtractionDataContext';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Eisko Analyzer',
  description: 'AI-powered electrical diagram PDF analysis and data extraction',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${geistMono.variable} antialiased`}>
        <PDFProvider>
          <ExtractionDataProvider>{children}</ExtractionDataProvider>
        </PDFProvider>
      </body>
    </html>
  );
}
