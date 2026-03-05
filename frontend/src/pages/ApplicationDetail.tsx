import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
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
import { ArrowLeft, Plus, Trash2, ChevronRight, Calendar, Layers } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'

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

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  APPLIED: 'bg-blue-100 text-blue-700',
  INTERVIEWING: 'bg-purple-100 text-purple-700',
  OFFER: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  ACCEPTED: 'bg-emerald-100 text-emerald-700',
}

const STATUS_OPTIONS: ApplicationStatus[] = [
  'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED', 'ACCEPTED',
]

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [app, setApp] = useState<Application | null>(null)
  const [rounds, setRounds] = useState<InterviewRound[]>([])
  const [loading, setLoading] = useState(true)

  // Edit form
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
      setDeleteRoundId(null)
    } finally {
      setDeletingRound(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-4 w-32 mb-6" />
        <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6 mb-6">
          <Skeleton className="h-5 w-44 mb-5" />
          <div className="space-y-4">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6">
          <div className="flex items-center justify-between mb-5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!app) return null

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-[#888] hover:text-[#5184b4] transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        All Applications
      </Link>

      {/* Application form */}
      <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6 mb-6">
        <h1 className="text-lg font-semibold text-[#1a1a1a] mb-5">Application Details</h1>
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
            <label className="text-xs text-[#888] mb-1.5 block">Status</label>
            <Select value={status} onValueChange={(v) => setStatus(v as ApplicationStatus)}>
              <SelectTrigger className="rounded-xl border-[#f0f0f0] border-2 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[s]}`}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-[#888] mb-1.5 block">Job Description</label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description…"
              className="rounded-xl border-[#f0f0f0] border-2 min-h-[120px] resize-none"
            />
          </div>
          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={saving || !company || !role}
              className="rounded-xl px-6"
              style={{ backgroundColor: '#5184b4' }}
            >
              {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>

      {/* Rounds section */}
      <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[#1a1a1a]">Interview Rounds</h2>
          <Button
            onClick={() => setRoundDialogOpen(true)}
            size="sm"
            className="gap-1.5 rounded-xl h-9"
            style={{ backgroundColor: '#5184b4' }}
          >
            <Plus size={14} />
            Add Round
          </Button>
        </div>

        {rounds.length === 0 ? (
          <div className="text-center py-10">
            <Layers size={30} className="mx-auto text-[#d0d0d0] mb-2" />
            <p className="text-sm text-[#aaa]">No rounds yet. Add your first interview round.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rounds.map((round) => (
              <div
                key={round.id}
                onClick={() => navigate(`/round/${round.id}`)}
                className="flex items-center justify-between p-4 rounded-xl border border-[#f0f0f0] cursor-pointer hover:border-[#5184b4]/30 hover:bg-[#fafafa] transition-all duration-150 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#1a1a1a] text-sm">{round.roundType}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {round.date && (
                      <span className="flex items-center gap-1 text-xs text-[#aaa]">
                        <Calendar size={10} />
                        {new Date(round.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                    {round.outcome && (
                      <span className="text-xs text-[#888]">{round.outcome}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteRoundId(round.id) }}
                    className="p-1.5 rounded-lg text-[#ccc] hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-150"
                  >
                    <Trash2 size={13} />
                  </button>
                  <ChevronRight size={15} className="text-[#ccc] group-hover:text-[#5184b4] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete round confirm dialog */}
      <DeleteConfirmDialog
        open={!!deleteRoundId}
        onOpenChange={(open) => { if (!open) setDeleteRoundId(null) }}
        title="Delete round?"
        description="This will permanently delete the interview round and any generated questions."
        onConfirm={handleDeleteRound}
        loading={deletingRound}
      />

      {/* Add Round dialog */}
      <Dialog open={roundDialogOpen} onOpenChange={(open) => { setRoundDialogOpen(open); if (!open) resetRoundForm() }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1a1a1a]">Add Interview Round</DialogTitle>
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
              <label className="text-xs text-[#888] mb-1.5 block">Notes</label>
              <Textarea
                value={roundNotes}
                onChange={(e) => setRoundNotes(e.target.value)}
                placeholder="Any notes about this round…"
                className="rounded-xl border-[#f0f0f0] border-2 min-h-[80px] resize-none"
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
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setRoundDialogOpen(false); resetRoundForm() }}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addingRound || !roundType}
                className="flex-1 rounded-xl"
                style={{ backgroundColor: '#5184b4' }}
              >
                {addingRound ? 'Adding…' : 'Add Round'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
