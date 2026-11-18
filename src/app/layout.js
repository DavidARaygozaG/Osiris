import { Bricolage_Grotesque, Hanken_Grotesk } from 'next/font/google';
import './globals.css';
import SwRegister from '@/components/SwRegister';
import InstallPWA from '@/components/InstallPWA';
import Aurora from '@/components/ui/Aurora';
import LiquidDefs from '@/components/ui/LiquidDefs';
import LiquidEffects from '@/components/ui/LiquidEffects';

// Display + cifras: Bricolage Grotesque (variable, con carácter).
const display = Bricolage_Grotesque({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
});

// Texto: Hanken Grotesk (muy legible en pantallas pequeñas).
const body = Hanken_Grotesk({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Osiris · Cuenta del día',
  description: 'Cuenta diaria de la Tortillería Única | Eduardo’s',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Osiris',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6eedb' },
    { media: '(prefers-color-scheme: dark)', color: '#272b29' },
  ],
};

// Se ejecuta ANTES de pintar: elige el tema (guardado o el del teléfono) y activa la
// refracción líquida solo en navegadores Chromium. Evita el parpadeo claro→oscuro.
const temaInicial = `(function(){try{var t=localStorage.getItem('osiris-tema');var d=t?t==='oscuro':matchMedia('(prefers-color-scheme: dark)').matches;var h=document.documentElement;h.dataset.theme=d?'maiz-oscuro':'maiz';h.style.colorScheme=d?'dark':'light';if(navigator.userAgentData)h.classList.add('lq');}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="es-MX" data-theme="maiz" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: temaInicial }} />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <Aurora />
        <LiquidDefs />
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-base-100 focus:px-4 focus:py-3">
          Saltar al contenido
        </a>
        {children}
        <SwRegister />
        <InstallPWA />
        <LiquidEffects />
      </body>
    </html>
  );
}
