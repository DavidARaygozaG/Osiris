import { Carlito } from 'next/font/google';
import '@mantine/core/styles.css';
import './globals.css';
import { createTheme, MantineProvider } from '@mantine/core';
import SwRegister from '@/components/SwRegister';
import InstallPWA from '@/components/InstallPWA';

const inter = Carlito({
  variable: '--font-inter',
  weight: '400',
});

export const metadata = {
  title: 'Osiris · Control de Ventas',
  description: 'Control diario de ventas para tortillería',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Osiris',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#22c55e',
};

const theme = createTheme({
  /** Put your mantine theme override here */
});

export default function RootLayout({ children }) {
  return (
    <html lang="es" data-theme="osiris" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Osiris" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-dvh flex flex-col antialiased">
        <MantineProvider theme={theme} defaultColorScheme="dark">
          {children}
        </MantineProvider>
        <SwRegister />
        <InstallPWA />
      </body>
    </html>
  );
}
