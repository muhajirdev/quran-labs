import { createFileRoute } from '@tanstack/react-router'
import {
  Network,
  Search,
  BookOpen,
  ArrowRight
} from 'lucide-react'

export const Route = createFileRoute('/')({ component: LandingPage })

function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-base font-sans selection:bg-brand-orange/20">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-serif italic tracking-tight font-medium text-gray-900">
          SuperQuran.com
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://quran-web.qalam.workers.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-700 border border-brand-orange/30 rounded-md hover:bg-brand-orange/5 transition-colors"
          >
            Explore Web
          </a>
          <a
            href="https://github.com/muhajirdev/quran-labs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-medium text-white bg-brand-orange hover:bg-[#d94d1b] rounded-md transition-colors shadow-sm"
          >
            Open Source
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 text-center max-w-4xl mx-auto">
        {/* Top Pill */}
        <div className="inline-flex items-center justify-center space-x-2 px-4 py-1.5 rounded-full border border-gray-200 bg-white shadow-sm mb-10">
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            QURANIC KNOWLEDGE GRAPH · OFFICIAL DATA
          </span>
        </div>

        {/* Headlines */}
        <h1 className="text-5xl sm:text-7xl font-serif text-gray-900 leading-[1.1] tracking-tight mb-8">
          Explore How The <br />
          <span className="text-brand-orange italic">Quran Connects</span> <br />
          Visually
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
          A visual network of verses, concepts, and classical commentary.
          Building the infrastructure to explore the profound connections within the Quranic tradition.
        </p>

        <a
          href="#"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-medium text-white bg-brand-orange hover:bg-[#d94d1b] rounded-md transition-all shadow-md hover:shadow-lg mb-6"
        >
          Explore Graph <ArrowRight size={18} />
        </a>

        <div className="flex items-center justify-center gap-3 text-xs font-medium text-gray-400 tracking-wide uppercase">
          <span className="line-through text-gray-300">Closed Beta</span>
          <span className="text-brand-orange">Free & Open Source</span>
          <span>·</span>
          <span>Lifetime access</span>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { value: '114', label: 'Surahs' },
            { value: '6,236', label: 'Verses' },
            { value: '90K+', label: 'Words' },
            { value: '∞', label: 'Connections' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-xl p-8 text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] transition-shadow duration-300"
            >
              <div className="text-4xl sm:text-5xl font-serif italic text-gray-900 mb-3">
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-xs font-bold tracking-widest text-gray-400 uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-serif italic text-center text-gray-900 mb-4">
          What You Can Explore
        </h2>
        <p className="text-center text-gray-500 mb-16 text-sm sm:text-base">
          Everything you need to understand the thematic structure of the Quran.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] relative group hover:border-brand-orange/20 transition-colors">
            <Search className="w-6 h-6 text-gray-400 mb-6 group-hover:text-brand-orange transition-colors" />
            <h3 className="text-lg font-bold text-gray-900 mb-3">Instant Search</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Search any concept, verse, or topic. Discover topics connected to Privacy and see Quranic verses discussing them.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] relative group hover:border-brand-orange/20 transition-colors">
            <Network className="w-6 h-6 text-gray-400 mb-6 group-hover:text-brand-orange transition-colors" />
            <h3 className="text-lg font-bold text-gray-900 mb-3">Verse Network</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              See a network of verses about Musa. Explore conceptual connections in the opening chapter and the Throne Verse.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] relative group hover:border-brand-orange/20 transition-colors">
            <BookOpen className="w-6 h-6 text-gray-400 mb-6 group-hover:text-brand-orange transition-colors" />
            <h3 className="text-lg font-bold text-gray-900 mb-3">Classical Commentary</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Integrate profound connections from classical tafsir into your exploration of the Quranic tradition.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center">
        <p className="text-sm text-gray-400">© 2026 SuperQuran Graph. All rights reserved.</p>
        <p className="text-xs text-brand-orange/80 mt-2 font-medium">Built for the Ummah</p>
      </footer>
    </div>
  )
}
