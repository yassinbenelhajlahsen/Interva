import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'
import { FloatingInput } from '@/components/ui/FloatingInput'
import { Check } from 'lucide-react'
import { motion } from 'motion/react'

type Mode = 'signin' | 'signup'

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/user-not-found': 'No account found with this email.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/popup-closed-by-user': '',
  'auth/cancelled-popup-request': '',
  'auth/network-request-failed': 'Network error. Check your connection.',
}

function parseFirebaseError(err: unknown): string {
  if (!(err instanceof Error)) return 'Something went wrong.'
  const code = (err as { code?: string }).code ?? ''
  return FIREBASE_ERRORS[code] ?? err.message.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '').trim()
}

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (pw: string) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: (pw: string) => /[a-z]/.test(pw) },
  { label: 'One number', test: (pw: string) => /[0-9]/.test(pw) },
]

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const passwordMet = PASSWORD_RULES.map((r) => r.test(password))
  const allMet = passwordMet.every(Boolean)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (mode === 'signup' && !allMet) return
    setLoading(true)
    try {
      mode === 'signin' ? await signIn(email, password) : await signUp(email, password)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      setError(parseFirebaseError(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const msg = parseFirebaseError(err)
      if (msg) setError(msg)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">

        {/* Brand mark */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <div
            className="w-11 h-11 rounded-[14px] flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#F8CF26', boxShadow: '0 2px 12px rgba(248,207,38,0.35)' }}
          >
            <span className="text-lg font-bold text-[#1A1A1A] leading-none">I</span>
          </div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-app-text-primary">Interva</h1>
          <p className="text-[14px] text-app-text-secondary mt-1">
            {mode === 'signin' ? 'Sign in to continue' : 'Create your account'}
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.04 }}
          className="bg-app-surface rounded-3xl p-8"
          style={{ boxShadow: 'var(--card-shadow)' }}
        >
          {/* Mode toggle */}
          <div className="flex bg-app-surface-secondary rounded-xl p-1 mb-7 gap-1">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError('') }}
                className={`relative flex-1 text-[13px] py-2 rounded-[9px] font-medium transition-all duration-200 ${
                  mode === m
                    ? 'text-app-text-primary'
                    : 'text-app-text-tertiary hover:text-app-text-secondary'
                }`}
              >
                {mode === m && (
                  <motion.div
                    layoutId="login-tab"
                    className="absolute inset-0 bg-app-surface rounded-[9px]"
                    style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="relative">{m === 'signin' ? 'Sign in' : 'Sign up'}</span>
              </button>
            ))}
          </div>

          {/* Google */}
          <motion.button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2.5 h-11 rounded-xl border border-app-border bg-app-surface text-[14px] font-medium text-app-text-primary hover:bg-app-surface-hover disabled:opacity-50 transition-colors mb-5"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-app-brand border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="17" height="17" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
              </svg>
            )}
            Continue with Google
          </motion.button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-app-border" />
            <span className="text-[11px] text-app-text-tertiary tracking-wide uppercase font-medium">or</span>
            <div className="flex-1 h-px bg-app-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <FloatingInput
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            <FloatingInput
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />

            {mode === 'signup' && password.length > 0 && (
              <ul className="space-y-1.5 pt-1">
                {PASSWORD_RULES.map((rule, i) => (
                  <li
                    key={rule.label}
                    className="flex items-center gap-2 text-[12px] transition-colors duration-200"
                    style={{ color: passwordMet[i] ? '#34A853' : 'var(--app-text-tertiary)' }}
                  >
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                      style={{ backgroundColor: passwordMet[i] ? '#34A853' : 'var(--app-input-bg)' }}
                    >
                      {passwordMet[i] && <Check size={9} strokeWidth={3} color="white" />}
                    </span>
                    {rule.label}
                  </li>
                ))}
              </ul>
            )}

            {error && (
              <p className="text-[13px] text-red-500 bg-red-500/8 rounded-xl px-3.5 py-2.5">{error}</p>
            )}

            <motion.button
              type="submit"
              disabled={loading || (mode === 'signup' && password.length > 0 && !allMet)}
              whileTap={{ scale: 0.98 }}
              className="w-full h-11 rounded-xl text-[14px] font-semibold text-white bg-app-brand hover:opacity-90 disabled:opacity-40 transition-all duration-150 mt-1"
            >
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
