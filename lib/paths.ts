import path from 'node:path'

export const dataDir = () => process.env.DATA_DIR ?? path.join(process.cwd(), 'data')
export const contentDir = () => process.env.CONTENT_DIR ?? path.join(process.cwd(), 'content')
export const manifestPath = () => path.join(dataDir(), 'manifest.json')
export const progressPath = () => path.join(dataDir(), 'progress.json')
export const sessionsPath = () => path.join(dataDir(), 'sessions.json')
