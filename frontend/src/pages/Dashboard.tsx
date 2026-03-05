import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { Plus, Trash2, Briefcase, Calendar } from 'lucide-react'
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

function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}

export default function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-7 w-36 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-16" />
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a1a1a]">Applications</h1>
          <p className="text-sm text-[#888] mt-0.5">
            {applications.length === 0 ? 'No applications yet' : `${applications.length} application${applications.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="gap-2 rounded-xl h-10"
          style={{ backgroundColor: '#5184b4' }}
        >
          <Plus size={16} />
          New Application
        </Button>
      </div>

      {/* Empty state */}
      {applications.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#f0f0f0]">
          <Briefcase size={36} className="mx-auto text-[#d0d0d0] mb-3" />
          <p className="text-[#555] font-medium">No applications yet</p>
          <p className="text-sm text-[#aaa] mt-1">Click "New Application" to get started</p>
        </div>
      )}

      {/* Application grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {applications.map((app) => (
          <div
            key={app.id}
            onClick={() => navigate(`/app/${app.id}`)}
            className="bg-white rounded-2xl border border-[#f0f0f0] p-5 cursor-pointer hover:border-[#5184b4]/30 hover:shadow-md transition-all duration-200 group relative"
          >
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteId(app.id) }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#ccc] hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-150"
            >
              <Trash2 size={14} />
            </button>
            <div className="pr-6">
              <p className="font-semibold text-[#1a1a1a] truncate">{app.company}</p>
              <p className="text-sm text-[#666] mt-0.5 truncate">{app.role}</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <StatusBadge status={app.status} />
              <span className="flex items-center gap-1 text-xs text-[#bbb]">
                <Calendar size={11} />
                {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirm dialog */}
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Delete application?"
        description="This will permanently delete the application and all its interview rounds and questions."
        onConfirm={handleDelete}
        loading={deleting}
      />

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1a1a1a]">New Application</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
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
              <label className="text-xs text-[#888] mb-1.5 block">Status</label>
              <Select value={status} onValueChange={(v) => setStatus(v as ApplicationStatus)}>
                <SelectTrigger className="rounded-xl border-[#f0f0f0] border-2 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
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
                className="rounded-xl border-[#f0f0f0] border-2 min-h-[100px] resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setDialogOpen(false); resetForm() }}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !company || !role}
                className="flex-1 rounded-xl"
                style={{ backgroundColor: '#5184b4' }}
              >
                {saving ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
