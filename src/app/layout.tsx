
import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/Providers';
import { Sidebar } from '@/components/ui/sidebar';

export const metadata: Metadata = {
  title: 'EduSmart',
  description: 'An AI-powered adaptive learning platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <Providers>
            <div className="relative flex min-h-screen">
              <Sidebar side="left" collapsible="icon" className="border-r hidden md:flex">
                  <Header />
              </Sidebar>
              <main className="flex-1 flex flex-col">
                <div className='md:hidden'>
                  <Header/>
                </div>
                {children}
              </main>
            </div>
            <Toaster />
        </Providers>
      </body>
    </html>
  );
}
