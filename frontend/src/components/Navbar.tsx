import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'
import { LogOut, Settings } from 'lucide-react'
import { motion } from 'motion/react'

export function Navbar() {
  const { signOut } = useAuth()

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="sticky top-0 z-50"
    >
      <div
        className="bg-app-surface/70 backdrop-blur-2xl border-b border-app-border"
        style={{ WebkitBackdropFilter: 'blur(24px)' }}
      >
        <div className="max-w-5xl mx-auto px-6 h-[52px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center"
              style={{ backgroundColor: '#F8CF26' }}
            >
              <span className="text-[10px] font-bold text-[#1A1A1A] leading-none">I</span>
            </div>
            <span className="text-[14px] font-semibold tracking-[-0.01em] text-app-text-primary">
              Interva
            </span>
          </Link>

          <div className="flex items-center gap-0.5">
            <Link
              to="/settings"
              className="flex items-center justify-center w-8 h-8 rounded-xl text-app-text-tertiary hover:text-app-text-primary hover:bg-app-surface-hover transition-all duration-150"
            >
              <Settings size={15} />
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-2.5 h-8 rounded-xl text-[13px] text-app-text-tertiary hover:text-app-text-primary hover:bg-app-surface-hover transition-all duration-150"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline font-medium">Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
