import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FloatingInput } from '@/components/ui/FloatingInput'
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  Sparkles,
  Layers,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import { motion, AnimatePresence } from 'motion/react'

type ApplicationStatus = 'APPLIED' | 'INTERVIEWING' | 'OFFER' | 'REJECTED' | 'ACCEPTED'

interface Application {
  id: string
  company: string
  role: string
  status: ApplicationStatus
  jobDescription?: string
  createdAt: string
  updatedAt: string
}

interface GeneratedQuestion {
  id: string
  interviewRoundId: string
  questionText: string
  createdAt: string
}

interface InterviewRound {
  id: string
  applicationId: string
  roundType: string
  date?: string
  notes?: string
  outcome?: string
  createdAt: string
  updatedAt: string
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; cls: string }> = {
  APPLIED:      { label: 'Applied',      cls: 'bg-[#EBF2FA] text-[#5184b4] dark:bg-[#1A2A3A] dark:text-[#6BA3D6]' },
  INTERVIEWING: { label: 'Interviewing', cls: 'bg-[#FEF9E7] text-[#B8860B] dark:bg-[#2A2510] dark:text-[#D4A832]' },
  OFFER:        { label: 'Offer',        cls: 'bg-[#EDFAEB] text-[#1E8A3A] dark:bg-[#0F2A15] dark:text-[#4ADE80]' },
  REJECTED:     { label: 'Rejected',     cls: 'bg-[#FAEBEB] text-[#DC3545] dark:bg-[#2A0F0F] dark:text-[#F87171]' },
  ACCEPTED:     { label: 'Accepted',     cls: 'bg-[#EDFAEB] text-[#166534] dark:bg-[#0F2A15] dark:text-[#4ADE80]' },
}

const STATUS_OPTIONS: ApplicationStatus[] = ['APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED', 'ACCEPTED']

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [app, setApp] = useState<Application | null>(null)
  const [rounds, setRounds] = useState<InterviewRound[]>([])
  const [loading, setLoading] = useState(true)

  // App edit
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState<ApplicationStatus>('APPLIED')
  const [jobDescription, setJobDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Add round dialog
  const [roundDialogOpen, setRoundDialogOpen] = useState(false)
  const [roundType, setRoundType] = useState('')
  const [roundDate, setRoundDate] = useState('')
  const [roundNotes, setRoundNotes] = useState('')
  const [roundOutcome, setRoundOutcome] = useState('')
  const [addingRound, setAddingRound] = useState(false)
  const [deleteRoundId, setDeleteRoundId] = useState<string | null>(null)
  const [deletingRound, setDeletingRound] = useState(false)

  // Inline round expansion
  const [expandedRoundId, setExpandedRoundId] = useState<string | null>(null)
  const [draftType, setDraftType] = useState('')
  const [draftDate, setDraftDate] = useState('')
  const [draftNotes, setDraftNotes] = useState('')
  const [draftOutcome, setDraftOutcome] = useState('')
  const [roundSaving, setRoundSaving] = useState(false)
  const [roundSaved, setRoundSaved] = useState(false)

  // Questions per round
  const [roundQuestions, setRoundQuestions] = useState<Record<string, GeneratedQuestion[]>>({})
  const [loadingQuestionsFor, setLoadingQuestionsFor] = useState<string | null>(null)
  const [generatingFor, setGeneratingFor] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([
      api.get<Application>(`/applications/${id}`),
      api.get<InterviewRound[]>(`/applications/${id}/rounds`),
    ]).then(([appRes, roundsRes]) => {
      const a = appRes.data
      setApp(a)
      setCompany(a.company)
      setRole(a.role)
      setStatus(a.status)
      setJobDescription(a.jobDescription ?? '')
      setRounds(roundsRes.data)
    }).catch(() => navigate('/'))
    .finally(() => setLoading(false))
  }, [id, navigate])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setSaving(true)
    try {
      const res = await api.patch<Application>(`/applications/${id}`, {
        company,
        role,
        status,
        jobDescription: jobDescription || undefined,
      })
      setApp(res.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  function resetRoundForm() {
    setRoundType('')
    setRoundDate('')
    setRoundNotes('')
    setRoundOutcome('')
  }

  async function handleAddRound(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setAddingRound(true)
    try {
      const res = await api.post<InterviewRound>(`/applications/${id}/rounds`, {
        roundType,
        date: roundDate || undefined,
        notes: roundNotes || undefined,
        outcome: roundOutcome || undefined,
      })
      setRounds((prev) => [...prev, res.data])
      setRoundDialogOpen(false)
      resetRoundForm()
    } finally {
      setAddingRound(false)
    }
  }

  async function handleDeleteRound() {
    if (!deleteRoundId) return
    setDeletingRound(true)
    try {
      await api.delete(`/rounds/${deleteRoundId}`)
      setRounds((prev) => prev.filter((r) => r.id !== deleteRoundId))
      if (expandedRoundId === deleteRoundId) setExpandedRoundId(null)
      setDeleteRoundId(null)
    } finally {
      setDeletingRound(false)
    }
  }

  function toggleRound(round: InterviewRound) {
    if (expandedRoundId === round.id) {
      setExpandedRoundId(null)
      return
    }
    setExpandedRoundId(round.id)
    setDraftType(round.roundType)
    setDraftDate(round.date ? round.date.slice(0, 10) : '')
    setDraftNotes(round.notes ?? '')
    setDraftOutcome(round.outcome ?? '')
    setRoundSaved(false)

    if (!(round.id in roundQuestions)) {
      setLoadingQuestionsFor(round.id)
      api.get<InterviewRound & { questions: GeneratedQuestion[] }>(`/rounds/${round.id}`)
        .then((res) => {
          setRoundQuestions((prev) => ({ ...prev, [round.id]: res.data.questions }))
        })
        .finally(() => setLoadingQuestionsFor(null))
    }
  }

  async function handleSaveRound(roundId: string) {
    setRoundSaving(true)
    try {
      const res = await api.patch<InterviewRound>(`/rounds/${roundId}`, {
        roundType: draftType,
        date: draftDate || undefined,
        notes: draftNotes || undefined,
        outcome: draftOutcome || undefined,
      })
      setRounds((prev) => prev.map((r) => (r.id === roundId ? { ...r, ...res.data } : r)))
      setRoundSaved(true)
      setTimeout(() => setRoundSaved(false), 2000)
    } finally {
      setRoundSaving(false)
    }
  }

  async function handleGenerateQuestions(roundId: string) {
    setGeneratingFor(roundId)
    try {
      const res = await api.post<GeneratedQuestion[]>(`/rounds/${roundId}/generate-questions`)
      setRoundQuestions((prev) => ({ ...prev, [roundId]: res.data }))
    } finally {
      setGeneratingFor(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Skeleton className="h-4 w-32 mb-6" />
        <div className="bg-app-surface rounded-2xl p-6 mb-4" style={{ boxShadow: 'var(--card-shadow)' }}>
          <Skeleton className="h-6 w-48 mb-5" />
          <div className="space-y-4">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
        </div>
        <div className="bg-app-surface rounded-2xl p-6" style={{ boxShadow: 'var(--card-shadow)' }}>
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!app) return null

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-[13px] text-app-text-secondary hover:text-app-brand transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        All Applications
      </Link>

      {/* App header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-semibold text-app-text-primary tracking-tight">{app.company}</h1>
          <p className="text-[14px] text-app-text-secondary mt-0.5">{app.role}</p>
        </div>
        <span className={`text-[12px] font-medium px-2.5 py-1 rounded-full mt-1 ${STATUS_CONFIG[app.status].cls}`}>
          {STATUS_CONFIG[app.status].label}
        </span>
      </div>

      {/* Application details */}
      <div className="bg-app-surface rounded-2xl p-6 mb-4" style={{ boxShadow: 'var(--card-shadow)' }}>
        <h2 className="text-[15px] font-semibold text-app-text-primary mb-4">Details</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <FloatingInput
            id="company"
            type="text"
            label="Company *"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <FloatingInput
            id="role"
            type="text"
            label="Role *"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <div>
            <label className="text-[12px] text-app-text-secondary mb-1.5 block font-medium">Status</label>
            <Select value={status} onValueChange={(v) => setStatus(v as ApplicationStatus)}>
              <SelectTrigger className="rounded-xl border-app-border border h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_CONFIG[s].cls}`}>
                      {STATUS_CONFIG[s].label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[12px] text-app-text-secondary mb-1.5 block font-medium">Job Description</label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description…"
              className="rounded-xl border-app-border border min-h-[120px] resize-none"
            />
          </div>
          <div className="flex justify-end pt-1">
            <motion.button
              type="submit"
              disabled={saving || !company || !role}
              whileTap={{ scale: 0.97 }}
              className="px-5 h-9 rounded-xl text-[13px] font-semibold text-white bg-app-brand transition-all duration-150 disabled:opacity-50 hover:opacity-90"
            >
              {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}
            </motion.button>
          </div>
        </form>
      </div>

      {/* Interview Rounds */}
      <div className="bg-app-surface rounded-2xl p-6" style={{ boxShadow: 'var(--card-shadow)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-app-text-primary">Interview Rounds</h2>
          <motion.button
            onClick={() => setRoundDialogOpen(true)}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-[12px] font-semibold text-app-brand bg-app-brand-light hover:opacity-80 transition-opacity"
          >
            <Plus size={13} strokeWidth={2.5} />
            Add Round
          </motion.button>
        </div>

        {rounds.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-10 h-10 rounded-xl bg-app-surface-hover flex items-center justify-center mx-auto mb-3">
              <Layers size={18} className="text-app-text-tertiary" />
            </div>
            <p className="text-[13px] text-app-text-tertiary">No rounds yet. Add your first interview round.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rounds.map((round, index) => {
              const isExpanded = expandedRoundId === round.id
              const o = round.outcome?.toLowerCase() ?? ''
              const passed = o.includes('pass') || o.includes('advance') || o.includes('moved')
              const failed = o.includes('fail') || o.includes('reject')
              const questions = roundQuestions[round.id] ?? []
              const loadingQs = loadingQuestionsFor === round.id
              const generating = generatingFor === round.id

              return (
                <div
                  key={round.id}
                  className={`rounded-xl border transition-all duration-200 ${
                    isExpanded ? 'border-app-brand/30 bg-app-surface-hover' : 'border-app-border bg-app-surface'
                  }`}
                >
                  {/* Round header row */}
                  <div
                    className="flex items-center gap-3 px-4 py-3.5 cursor-pointer group"
                    onClick={() => toggleRound(round)}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 ${
                      passed ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                      failed ? 'bg-red-500/10 text-red-500 dark:text-red-400' :
                      'bg-app-brand-light text-app-brand'
                    }`}>
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-app-text-primary truncate">{round.roundType}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {round.date && (
                          <span className="text-[11px] text-app-text-tertiary">
                            {new Date(round.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                        {round.outcome && (
                          <span className={`text-[11px] font-medium ${
                            passed ? 'text-green-600 dark:text-green-400' :
                            failed ? 'text-red-500 dark:text-red-400' :
                            'text-app-text-secondary'
                          }`}>
                            {round.outcome}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteRoundId(round.id) }}
                        className="p-1.5 rounded-lg text-app-border-subtle hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-150"
                      >
                        <Trash2 size={12} />
                      </button>
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={15} className="text-app-text-tertiary" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Expanded content with AnimatePresence */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="px-4 pb-5 pt-1 border-t border-app-border">
                          {/* Edit form */}
                          <div className="space-y-3 mt-4">
                            <div className="grid sm:grid-cols-2 gap-3">
                              <FloatingInput
                                id={`rt-${round.id}`}
                                type="text"
                                label="Round Type *"
                                value={draftType}
                                onChange={(e) => setDraftType(e.target.value)}
                              />
                              <FloatingInput
                                id={`rd-${round.id}`}
                                type="date"
                                label="Date"
                                value={draftDate}
                                onChange={(e) => setDraftDate(e.target.value)}
                                required={false}
                              />
                            </div>
                            <div>
                              <label className="text-[12px] text-app-text-secondary mb-1.5 block font-medium">Notes</label>
                              <Textarea
                                value={draftNotes}
                                onChange={(e) => setDraftNotes(e.target.value)}
                                placeholder="Notes about this round…"
                                className="rounded-xl border-app-border border min-h-[80px] resize-none text-[14px]"
                              />
                            </div>
                            <FloatingInput
                              id={`ro-${round.id}`}
                              type="text"
                              label="Outcome"
                              value={draftOutcome}
                              onChange={(e) => setDraftOutcome(e.target.value)}
                              required={false}
                            />
                            <div className="flex justify-end">
                              <motion.button
                                onClick={() => handleSaveRound(round.id)}
                                disabled={roundSaving || !draftType}
                                whileTap={{ scale: 0.97 }}
                                className="px-4 h-8 rounded-xl text-[13px] font-semibold text-white bg-app-brand transition-all duration-150 disabled:opacity-50 hover:opacity-90"
                              >
                                {roundSaved ? 'Saved!' : roundSaving ? 'Saving…' : 'Save'}
                              </motion.button>
                            </div>
                          </div>

                          {/* AI Questions */}
                          <div className="mt-5 pt-4 border-t border-app-border">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="text-[13px] font-semibold text-app-text-primary">Interview Questions</p>
                                <p className="text-[11px] text-app-text-tertiary mt-0.5">AI-generated based on job description</p>
                              </div>
                              <motion.button
                                onClick={() => handleGenerateQuestions(round.id)}
                                disabled={generating}
                                whileTap={{ scale: 0.97 }}
                                className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-[12px] font-semibold transition-all duration-150 disabled:opacity-50 bg-[#FEF9E7] text-[#B8860B] dark:bg-[#2A2510] dark:text-[#D4A832] hover:opacity-80"
                              >
                                {generating ? (
                                  <>
                                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                    Generating…
                                  </>
                                ) : (
                                  <>
                                    <Sparkles size={12} />
                                    Generate
                                  </>
                                )}
                              </motion.button>
                            </div>

                            {loadingQs ? (
                              <div className="space-y-2">
                                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-11 rounded-xl" />)}
                              </div>
                            ) : questions.length === 0 ? (
                              <p className="text-[12px] text-app-text-tertiary text-center py-5">
                                Click Generate to create AI-powered questions
                              </p>
                            ) : (
                              <ol className="space-y-2">
                                {questions.map((q, qi) => (
                                  <motion.li
                                    key={q.id}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: qi * 0.04 }}
                                    className="flex gap-3 p-3 rounded-xl bg-app-surface-hover"
                                  >
                                    <span className="w-5 h-5 rounded-full text-[10px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5 bg-app-brand-light text-app-brand">
                                      {qi + 1}
                                    </span>
                                    <p className="text-[13px] text-app-text-primary leading-relaxed">{q.questionText}</p>
                                  </motion.li>
                                ))}
                              </ol>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        open={!!deleteRoundId}
        onOpenChange={(open) => { if (!open) setDeleteRoundId(null) }}
        title="Delete round?"
        description="This will permanently delete the interview round and any generated questions."
        onConfirm={handleDeleteRound}
        loading={deletingRound}
      />

      <Dialog open={roundDialogOpen} onOpenChange={(open) => { setRoundDialogOpen(open); if (!open) resetRoundForm() }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-semibold text-app-text-primary">Add Interview Round</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddRound} className="space-y-4 mt-2">
            <FloatingInput
              id="round-type"
              type="text"
              label="Round Type *"
              value={roundType}
              onChange={(e) => setRoundType(e.target.value)}
            />
            <FloatingInput
              id="round-date"
              type="date"
              label="Date"
              value={roundDate}
              onChange={(e) => setRoundDate(e.target.value)}
              required={false}
            />
            <div>
              <label className="text-[12px] text-app-text-secondary mb-1.5 block font-medium">Notes</label>
              <Textarea
                value={roundNotes}
                onChange={(e) => setRoundNotes(e.target.value)}
                placeholder="Any notes about this round…"
                className="rounded-xl border-app-border border min-h-[80px] resize-none"
              />
            </div>
            <FloatingInput
              id="round-outcome"
              type="text"
              label="Outcome"
              value={roundOutcome}
              onChange={(e) => setRoundOutcome(e.target.value)}
              required={false}
            />
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setRoundDialogOpen(false); resetRoundForm() }}
                className="flex-1 h-10 rounded-xl text-[14px] font-medium text-app-text-secondary hover:bg-app-surface-hover transition-colors"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={addingRound || !roundType}
                whileTap={{ scale: 0.97 }}
                className="flex-1 h-10 rounded-xl text-[14px] font-semibold text-white bg-app-brand transition-all duration-150 disabled:opacity-50 hover:opacity-90"
              >
                {addingRound ? 'Adding…' : 'Add Round'}
              </motion.button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
