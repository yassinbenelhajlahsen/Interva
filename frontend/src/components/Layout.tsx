import type { ReactNode } from 'react'
import { Navbar } from './Navbar'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-app-bg">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
    </div>
  )
}
