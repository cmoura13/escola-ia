import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Escola-IA - Plataforma de Treinamentos',
  description: 'Plataforma moderna de cursos online e treinamentos profissionais',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} bg-background text-gray-100 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
