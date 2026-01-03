import type { Metadata } from 'next'
import { Poppins, Roboto } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins'
})

const roboto = Roboto({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto'
})

export const metadata: Metadata = {
  title: 'SuperAdmin - Laundry Management System',
  description: 'SuperAdmin panel for Laundry Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${roboto.variable} font-roboto`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
