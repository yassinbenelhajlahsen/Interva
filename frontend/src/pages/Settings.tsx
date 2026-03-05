import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sun, Moon, Monitor, Check, Eye, EyeOff } from 'lucide-react'
import { FloatingInput } from '@/components/ui/FloatingInput'
import { useTheme, type ThemeMode } from '@/contexts/theme-context'
import { useAuth } from '@/contexts/auth-context'
import { motion } from 'motion/react'

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (pw: string) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: (pw: string) => /[a-z]/.test(pw) },
  { label: 'One number', test: (pw: string) => /[0-9]/.test(pw) },
]

const THEME_OPTIONS: { mode: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { mode: 'light', label: 'Light', Icon: Sun },
  { mode: 'dark', label: 'Dark', Icon: Moon },
  { mode: 'system', label: 'System', Icon: Monitor },
]

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-app-surface rounded-2xl p-6 mb-4" style={{ boxShadow: 'var(--card-shadow)' }}>
      {children}
    </div>
  )
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-[15px] font-semibold text-app-text-primary">{title}</h2>
      {subtitle && <p className="text-[12px] text-app-text-secondary mt-0.5">{subtitle}</p>}
    </div>
  )
}

export default function Settings() {
  const { mode, setMode } = useTheme()
  const { user } = useAuth()

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)

  const pwRulesMet = PASSWORD_RULES.map((r) => r.test(newPw))
  const allPwMet = pwRulesMet.every(Boolean)
  const pwsMatch = newPw === confirmPw && confirmPw.length > 0

  function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!allPwMet || !pwsMatch || !currentPw) return
    // UI only — not wired to Firebase yet
    setPwSaved(true)
    setTimeout(() => {
      setPwSaved(false)
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    }, 2500)
  }

  const PasswordToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className="p-2 rounded-lg text-app-text-tertiary hover:text-app-text-secondary transition-colors"
    >
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-[13px] text-app-text-secondary hover:text-app-brand transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back
      </Link>

      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-app-text-primary tracking-tight">Settings</h1>
        <p className="text-[13px] text-app-text-secondary mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Appearance */}
      <SectionCard>
        <SectionTitle title="Appearance" subtitle="Choose how Interva looks for you" />
        <div className="flex bg-app-surface-hover rounded-xl p-1 gap-1">
          {THEME_OPTIONS.map(({ mode: m, label, Icon }) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                mode === m
                  ? 'text-app-text-primary'
                  : 'text-app-text-secondary hover:text-app-text-primary'
              }`}
            >
              {mode === m && (
                <motion.div
                  layoutId="theme-indicator"
                  className="absolute inset-0 bg-app-surface rounded-lg shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                <Icon size={14} />
                {label}
              </span>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Change Password */}
      <SectionCard>
        <SectionTitle title="Change Password" subtitle="Update your account password" />
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <FloatingInput
            id="current-pw"
            type={showCurrent ? 'text' : 'password'}
            label="Current Password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            autoComplete="current-password"
            rightSlot={<PasswordToggle show={showCurrent} onToggle={() => setShowCurrent(v => !v)} />}
          />
          <FloatingInput
            id="new-pw"
            type={showNew ? 'text' : 'password'}
            label="New Password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            autoComplete="new-password"
            rightSlot={<PasswordToggle show={showNew} onToggle={() => setShowNew(v => !v)} />}
          />
          <FloatingInput
            id="confirm-pw"
            type={showConfirm ? 'text' : 'password'}
            label="Confirm New Password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            autoComplete="new-password"
            rightSlot={<PasswordToggle show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />}
            error={confirmPw.length > 0 && !pwsMatch ? 'Passwords do not match' : undefined}
          />

          {newPw.length > 0 && (
            <ul className="space-y-1.5 pt-1">
              {PASSWORD_RULES.map((rule, i) => (
                <li
                  key={rule.label}
                  className="flex items-center gap-2 text-[12px] transition-colors duration-200"
                  style={{ color: pwRulesMet[i] ? '#34A853' : 'var(--app-text-tertiary)' }}
                >
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                    style={{ backgroundColor: pwRulesMet[i] ? '#34A853' : 'var(--app-surface-secondary)' }}
                  >
                    {pwRulesMet[i] && <Check size={9} strokeWidth={3} color="white" />}
                  </span>
                  {rule.label}
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-end pt-1">
            <motion.button
              type="submit"
              disabled={!allPwMet || !pwsMatch || !currentPw || pwSaved}
              whileTap={{ scale: 0.97 }}
              className="px-5 h-9 rounded-xl text-[13px] font-semibold text-white bg-app-brand transition-all duration-150 disabled:opacity-50 hover:opacity-90"
            >
              {pwSaved ? '✓ Password updated' : 'Update Password'}
            </motion.button>
          </div>
        </form>
      </SectionCard>

      {/* Account */}
      <SectionCard>
        <SectionTitle title="Account" subtitle="Manage your account details" />
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-app-border">
            <div>
              <p className="text-[13px] font-medium text-app-text-primary">Email address</p>
              <p className="text-[12px] text-app-text-secondary mt-0.5">{user?.email ?? '—'}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-[13px] font-medium text-app-text-primary">Delete account</p>
              <p className="text-[12px] text-app-text-secondary mt-0.5">Permanently delete your account and all data</p>
            </div>
            <button
              disabled
              className="px-3 h-8 rounded-xl text-[12px] font-semibold text-red-500 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 opacity-50 cursor-not-allowed transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
