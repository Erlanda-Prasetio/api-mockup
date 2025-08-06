import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Whistle Blower DPMPTSP Jawa Tengah',
  description: '',
  generator: '',
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
