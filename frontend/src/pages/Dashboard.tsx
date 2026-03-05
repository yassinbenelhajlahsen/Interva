import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { Plus, Briefcase, ChevronRight, Trash2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import { motion } from 'motion/react'

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
  roundType: string
  outcome?: string
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; cls: string }> = {
  APPLIED:      { label: 'Applied',      cls: 'bg-[#EBF2FA] text-[#5184b4] dark:bg-[#1A2A3A] dark:text-[#6BA3D6]' },
  INTERVIEWING: { label: 'Interviewing', cls: 'bg-[#FEF9E7] text-[#B8860B] dark:bg-[#2A2510] dark:text-[#D4A832]' },
  OFFER:        { label: 'Offer',        cls: 'bg-[#EDFAEB] text-[#1E8A3A] dark:bg-[#0F2A15] dark:text-[#4ADE80]' },
  REJECTED:     { label: 'Rejected',     cls: 'bg-[#FAEBEB] text-[#DC3545] dark:bg-[#2A0F0F] dark:text-[#F87171]' },
  ACCEPTED:     { label: 'Accepted',     cls: 'bg-[#EDFAEB] text-[#166534] dark:bg-[#0F2A15] dark:text-[#4ADE80]' },
}

const STATUS_OPTIONS: ApplicationStatus[] = ['APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED', 'ACCEPTED']

function RoundPipeline({ rounds }: { rounds?: InterviewRound[] }) {
  if (!rounds) {
    return (
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-1">
            {i > 0 && <div className="w-4 h-px bg-app-border" />}
            <div className="w-7 h-7 rounded-full bg-app-surface-secondary animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (rounds.length === 0) {
    return <span className="text-[12px] text-app-text-tertiary">No rounds yet</span>
  }

  return (
    <div className="flex items-center">
      {rounds.map((round, i) => {
        const o = round.outcome?.toLowerCase() ?? ''
        const passed = o.includes('pass') || o.includes('advance') || o.includes('moved') || o.includes('hired')
        const failed = o.includes('fail') || o.includes('reject') || o.includes('no ')
        return (
          <div key={round.id} className="flex items-center">
            {i > 0 && <div className="w-5 h-px bg-app-border-subtle" />}
            <div className="flex flex-col items-center gap-0.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                passed ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                failed ? 'bg-red-500/10 text-red-500 dark:text-red-400' :
                'bg-app-brand-light text-app-brand'
              }`}>
                {i + 1}
              </div>
              <span className="text-[9px] text-app-text-tertiary max-w-[52px] truncate text-center leading-tight">
                {round.roundType}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [roundsMap, setRoundsMap] = useState<Record<string, InterviewRound[]>>({})

  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState<ApplicationStatus>('APPLIED')
  const [jobDescription, setJobDescription] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    api.get<Application[]>('/applications')
      .then((res) => setApplications(res.data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (applications.length === 0) return
    Promise.all(
      applications.map((app) =>
        api.get<InterviewRound[]>(`/applications/${app.id}/rounds`)
          .then((res) => [app.id, res.data] as const)
          .catch(() => [app.id, []] as const)
      )
    ).then((results) => {
      const map: Record<string, InterviewRound[]> = {}
      results.forEach(([id, rounds]) => { map[id] = rounds as InterviewRound[] })
      setRoundsMap(map)
    })
  }, [applications])

  function resetForm() {
    setCompany('')
    setRole('')
    setStatus('APPLIED')
    setJobDescription('')
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.post<Application>('/applications', {
        company,
        role,
        status,
        jobDescription: jobDescription || undefined,
      })
      setApplications((prev) => [res.data, ...prev])
      setDialogOpen(false)
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.delete(`/applications/${deleteId}`)
      setApplications((prev) => prev.filter((a) => a.id !== deleteId))
      setDeleteId(null)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-36 mb-1.5" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-app-surface rounded-2xl px-6 py-4 flex items-center gap-5" style={{ boxShadow: 'var(--card-shadow)' }}>
              <div className="flex-1">
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-3.5 w-28" />
              </div>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((j) => (
                  <div key={j} className="flex items-center gap-1.5">
                    {j > 0 && <div className="w-4 h-px bg-app-border" />}
                    <Skeleton className="w-7 h-7 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-app-text-primary tracking-tight">Applications</h1>
          <p className="text-[13px] text-app-text-secondary mt-0.5">
            {applications.length === 0
              ? 'No applications yet'
              : `${applications.length} application${applications.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <motion.button
          onClick={() => setDialogOpen(true)}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-semibold text-white bg-app-brand transition-all duration-150 hover:opacity-90"
        >
          <Plus size={15} strokeWidth={2.5} />
          New Application
        </motion.button>
      </div>

      {/* Empty state */}
      {applications.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-24 bg-app-surface rounded-2xl"
          style={{ boxShadow: 'var(--card-shadow)' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-app-surface-hover flex items-center justify-center mx-auto mb-4">
            <Briefcase size={22} className="text-app-text-tertiary" />
          </div>
          <p className="text-app-text-primary font-medium text-[14px]">No applications yet</p>
          <p className="text-[12px] text-app-text-tertiary mt-1">Add your first application to get started</p>
        </motion.div>
      )}

      {/* Application list */}
      <div className="space-y-2">
        {applications.map((app, index) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4), ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -1 }}
            onClick={() => navigate(`/app/${app.id}`)}
            className="bg-app-surface rounded-2xl px-6 py-4 cursor-pointer transition-all duration-200 group flex items-center gap-4"
            style={{ boxShadow: 'var(--card-shadow)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--card-shadow-hover)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--card-shadow)' }}
          >
            {/* App info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-1">
                <p className="font-semibold text-app-text-primary text-[15px] truncate">{app.company}</p>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_CONFIG[app.status].cls}`}>
                  {STATUS_CONFIG[app.status].label}
                </span>
              </div>
              <p className="text-[13px] text-app-text-secondary truncate">{app.role}</p>
            </div>

            {/* Round pipeline */}
            <div
              className="flex-shrink-0 hidden md:block py-1"
              onClick={(e) => e.stopPropagation()}
            >
              <RoundPipeline rounds={roundsMap[app.id]} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteId(app.id) }}
                className="p-1.5 rounded-lg text-app-border-subtle hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-150"
              >
                <Trash2 size={13} />
              </button>
              <ChevronRight size={16} className="text-app-border-subtle group-hover:text-app-brand transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Delete application?"
        description="This will permanently delete the application and all its interview rounds and questions."
        onConfirm={handleDelete}
        loading={deleting}
      />

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
        <DialogContent className="sm:max-w-md rounded-2xl flex flex-col max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-semibold text-app-text-primary">New Application</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col flex-1 min-h-0 mt-2">
            <div className="space-y-4 overflow-y-auto flex-1 min-h-0 pr-0.5">
              <FloatingInput
                id="new-company"
                type="text"
                label="Company *"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
              <FloatingInput
                id="new-role"
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
                      <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
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
                  className="rounded-xl border-app-border border min-h-[100px] resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => { setDialogOpen(false); resetForm() }}
                className="flex-1 h-10 rounded-xl text-[14px] font-medium text-app-text-secondary hover:bg-app-surface-hover transition-colors"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={saving || !company || !role}
                whileTap={{ scale: 0.97 }}
                className="flex-1 h-10 rounded-xl text-[14px] font-semibold text-white bg-app-brand transition-all duration-150 disabled:opacity-50"
              >
                {saving ? 'Creating…' : 'Create'}
              </motion.button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
