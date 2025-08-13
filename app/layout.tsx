import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Whistle Blowing DPMPTSP Jawa Tengah',
  description: 'Sistem Pelaporan Whistleblowing DPMPTSP Provinsi Jawa Tengah - Laporkan korupsi, gratifikasi, dan benturan kepentingan secara aman dan rahasia.',
  generator: 'Next.js',
  keywords: 'whistleblowing, pelaporan, korupsi, gratifikasi, benturan kepentingan, DPMPTSP, Jawa Tengah',
  authors: [{ name: 'DPMPTSP Jawa Tengah' }],
  openGraph: {
    title: 'Whistle Blowing DPMPTSP Jawa Tengah',
    description: 'Sistem Pelaporan Whistleblowing DPMPTSP Provinsi Jawa Tengah - Laporkan korupsi, gratifikasi, dan benturan kepentingan secara aman dan rahasia.',
    url: 'https://wbs.dpmptsp.jatengprov.go.id',
    siteName: 'WBS DPMPTSP Jawa Tengah',
    images: [
      {
        url: '/images/logo_baru.png',
        width: 1800,
        height: 730,
        alt: 'DPMPTSP Jawa Tengah Logo',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whistle Blowing DPMPTSP Jawa Tengah',
    description: 'Sistem Pelaporan Whistleblowing DPMPTSP Provinsi Jawa Tengah - Laporkan korupsi, gratifikasi, dan benturan kepentingan secara aman dan rahasia.',
    images: ['/images/logo_baru.png'],
  },
  icons: {
    icon: [
      { url: '/images/logo.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/logo.png', sizes: '48x48', type: 'image/png' },
      { url: '/images/logo.png', sizes: '64x64', type: 'image/png' },
    ],
    shortcut: { url: '/images/logo.png', sizes: '32x32', type: 'image/png' },
    apple: [
      { url: '/images/logo.png', sizes: '180x180', type: 'image/png' },
      { url: '/images/logo.png', sizes: '192x192', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        {children}
        <Toaster 
          position="top-center"
          expand={true}
          richColors={false}
          closeButton
          toastOptions={{
            style: {
              fontSize: '18px',
              padding: '24px',
              minHeight: '100px',
              maxWidth: '700px',
              backgroundColor: 'white',
              color: 'black',
              border: '1px solid #e5e7eb',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            className: 'text-lg font-medium',
            duration: 8000,
          }}
        />
      </body>
    </html>
  )
}
