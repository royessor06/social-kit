import Link from 'next/link'

export default function LegalNoticesPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-emerald-400">← SOCIAL KIT</Link>
        <h1 className="mt-8 text-3xl font-bold">Mentions légales</h1>
        <p className="mt-5 leading-7 text-slate-400">
          Les informations légales de l’éditeur et de l’hébergeur seront ajoutées
          avant la mise en production du service.
        </p>
      </article>
    </main>
  )
}
