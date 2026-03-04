import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FloatingInput } from '@/components/ui/FloatingInput'
import { ArrowLeft, Sparkles, MessageSquare } from 'lucide-react'

interface Application {
  id: string
  company: string
  role: string
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
  application: Application
  questions: GeneratedQuestion[]
}

export default function RoundDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [round, setRound] = useState<InterviewRound | null>(null)
  const [loading, setLoading] = useState(true)

  const [roundType, setRoundType] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [outcome, setOutcome] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [generating, setGenerating] = useState(false)
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([])

  useEffect(() => {
    if (!id) return
    api.get<InterviewRound>(`/rounds/${id}`)
      .then((res) => {
        const r = res.data
        setRound(r)
        setRoundType(r.roundType)
        setDate(r.date ? r.date.slice(0, 10) : '')
        setNotes(r.notes ?? '')
        setOutcome(r.outcome ?? '')
        setQuestions(r.questions)
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setSaving(true)
    try {
      const res = await api.patch<InterviewRound>(`/rounds/${id}`, {
        roundType,
        date: date || undefined,
        notes: notes || undefined,
        outcome: outcome || undefined,
      })
      setRound((prev) => prev ? { ...prev, ...res.data } : prev)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  async function handleGenerate() {
    if (!id) return
    setGenerating(true)
    try {
      const res = await api.post<GeneratedQuestion[]>(`/rounds/${id}/generate-questions`)
      setQuestions(res.data)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-[#5184b4] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!round) return null

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <Link
        to={`/app/${round.applicationId}`}
        className="inline-flex items-center gap-1.5 text-sm text-[#888] hover:text-[#5184b4] transition-colors mb-1"
      >
        <ArrowLeft size={14} />
        {round.application.company} — {round.application.role}
      </Link>

      <h1 className="text-2xl font-semibold text-[#1a1a1a] mb-6">{round.roundType}</h1>

      {/* Round form */}
      <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6 mb-6">
        <h2 className="text-base font-semibold text-[#1a1a1a] mb-5">Round Details</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <FloatingInput
            id="round-type"
            type="text"
            label="Round Type *"
            value={roundType}
            onChange={(e) => setRoundType(e.target.value)}
          />
          <FloatingInput
            id="date"
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required={false}
          />
          <div>
            <label className="text-xs text-[#888] mb-1.5 block">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes about this round…"
              className="rounded-xl border-[#f0f0f0] border-2 min-h-[100px] resize-none"
            />
          </div>
          <FloatingInput
            id="outcome"
            type="text"
            label="Outcome"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            required={false}
          />
          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={saving || !roundType}
              className="rounded-xl px-6"
              style={{ backgroundColor: '#5184b4' }}
            >
              {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>

      {/* AI Questions */}
      <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-[#1a1a1a]">Interview Questions</h2>
            <p className="text-xs text-[#aaa] mt-0.5">AI-generated based on the job description and round type</p>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            size="sm"
            className="gap-1.5 rounded-xl h-9"
            style={{ backgroundColor: '#5184b4' }}
          >
            {generating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Generate
              </>
            )}
          </Button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-10">
            <MessageSquare size={30} className="mx-auto text-[#d0d0d0] mb-2" />
            <p className="text-sm text-[#aaa]">No questions yet. Click "Generate" to create AI-powered questions.</p>
          </div>
        ) : (
          <ol className="space-y-3">
            {questions.map((q, i) => (
              <li
                key={q.id}
                className="flex gap-3 p-4 rounded-xl bg-[#f8fafc] border border-[#eef2f7]"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#5184b4]/10 text-[#5184b4] text-xs font-semibold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-[#333] leading-relaxed">{q.questionText}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
