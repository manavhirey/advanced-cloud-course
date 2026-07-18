export interface ManifestItem {
  id: string
  weekId: string
  index: number
  text: string
}

export interface ManifestWeek {
  id: string
  title: string
  file: string
  order: number
  items: ManifestItem[]
  dod: string | null
}

export interface Manifest {
  generatedAt: string
  weeks: ManifestWeek[]
  extras: { file: string; title: string }[]
}

export interface Progress {
  items: Record<string, { done: true; at: string }>
  weeks: Record<string, { dodDone: true; at: string }>
}

export interface Session {
  date: string
  minutes: number
  weekId?: string
  note?: string
}

export interface Sessions {
  sessions: Session[]
}
