import { Suspense } from 'react'
import PosterEditor from './PosterEditor'

export default function PosterPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Chargement du modèle…
      </main>
    }>
      <PosterEditor />
    </Suspense>
  )
}