import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'
import { FloatingInput } from '@/components/ui/FloatingInput'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

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

interface PasswordRule {
  label: string
  test: (pw: string) => boolean
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { label: 'One number', test: (pw) => /[0-9]/.test(pw) },
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
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
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
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight" style={{ color: '#5184b4' }}>
            Interva
          </h1>
          <p className="text-[#888] text-sm mt-1">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#f0f0f0] p-8">
          {/* Mode toggle */}
          <div className="flex bg-[#f5f5f5] rounded-xl p-1 mb-6">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 text-sm py-2 rounded-lg font-medium transition-all duration-200 ${
                  mode === m
                    ? 'bg-white text-[#333] shadow-sm'
                    : 'text-[#888] hover:text-[#555]'
                }`}
              >
                {m === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border-2 border-[#f0f0f0] bg-white text-sm font-medium text-[#333] hover:bg-[#fafafa] hover:border-[#e0e0e0] transition-all duration-150 disabled:opacity-50 mb-4"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-[#5184b4] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#f0f0f0]" />
            <span className="text-xs text-[#bbb]">or</span>
            <div className="flex-1 h-px bg-[#f0f0f0]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Password requirements (signup only) */}
            {mode === 'signup' && password.length > 0 && (
              <ul className="space-y-1.5 pt-1">
                {PASSWORD_RULES.map((rule, i) => (
                  <li
                    key={rule.label}
                    className="flex items-center gap-2 text-xs transition-colors duration-200"
                    style={{ color: passwordMet[i] ? '#22c55e' : '#aaa' }}
                  >
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                      style={{
                        backgroundColor: passwordMet[i] ? '#22c55e' : '#f0f0f0',
                      }}
                    >
                      {passwordMet[i] && <Check size={10} strokeWidth={3} color="white" />}
                    </span>
                    {rule.label}
                  </li>
                ))}
              </ul>
            )}

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading || (mode === 'signup' && password.length > 0 && !allMet)}
              className="w-full mt-2 h-11 text-sm font-medium rounded-xl"
              style={{ backgroundColor: '#5184b4' }}
            >
              {loading
                ? 'Please wait…'
                : mode === 'signin'
                ? 'Sign in'
                : 'Create account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
