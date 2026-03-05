import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <header className="bg-white border-b border-[#f0f0f0] sticky top-0 z-50">
      <div className="w-full px-6 h-16 flex items-center justify-between">
        <span
          className="text-xl font-semibold tracking-tight"
          style={{ color: '#5184b4' }}
        >
          Interva
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#888] hidden sm:block">
            {user?.email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-[#888] hover:text-[#333] gap-2"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
