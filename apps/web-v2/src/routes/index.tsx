import { createFileRoute } from '@tanstack/react-router'
import {
  Network,
  Search,
  BookOpen,
  ArrowRight
} from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
import { Route as RootRoute } from './__root'

export const Route = createFileRoute('/')({ component: LandingPage })

const BackgroundGraph = () => (
  <div
    className="absolute inset-0 w-full h-[150%] pointer-events-none z-0 opacity-60 dark:opacity-30 transition-opacity duration-1000"
    style={{
      maskImage: 'radial-gradient(ellipse at top, black 10%, transparent 60%)',
      WebkitMaskImage: 'radial-gradient(ellipse at top, black 10%, transparent 60%)'
    }}
  >
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="graph-pattern" x="0" y="0" width="140" height="140" patternUnits="userSpaceOnUse">
          {/* Nodes */}
          <circle cx="40" cy="40" r="2.5" className="fill-gray-300 dark:fill-gray-700" />
          <circle cx="100" cy="60" r="1.5" className="fill-gray-300 dark:fill-gray-700" />
          <circle cx="60" cy="110" r="3" className="fill-brand-orange/40 dark:fill-[#FF6B35]/40" />
          <circle cx="120" cy="130" r="2" className="fill-gray-300 dark:fill-gray-700" />

          {/* Edges */}
          <path d="M 40 40 L 100 60 L 120 130 L 60 110 Z" className="stroke-gray-200 dark:stroke-gray-800/80" strokeWidth="0.75" fill="none" />
          <path d="M 40 40 L 60 110" className="stroke-brand-orange/30 dark:stroke-[#FF6B35]/30" strokeWidth="1" fill="none" strokeDasharray="4 4" />

          {/* Cross connections spanning outside pattern */}
          <line x1="100" y1="60" x2="180" y2="40" className="stroke-gray-200 dark:stroke-gray-800/80" strokeWidth="0.5" />
          <line x1="60" y1="110" x2="-20" y2="120" className="stroke-gray-200 dark:stroke-gray-800/80" strokeWidth="0.5" />
          <line x1="40" y1="40" x2="-40" y2="-20" className="stroke-gray-200 dark:stroke-gray-800/80" strokeWidth="0.5" />
          <line x1="120" y1="130" x2="160" y2="200" className="stroke-gray-200 dark:stroke-gray-800/80" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#graph-pattern)" />
    </svg>
  </div>
)

function LandingPage() {
  const { themeCookie } = RootRoute.useLoaderData()

  return (
    <div className="min-h-screen bg-bg-base dark:bg-slate-950 font-sans selection:bg-brand-orange/20 transition-colors duration-500 overflow-hidden relative">
      <BackgroundGraph />

      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative z-10">
        <div className="text-2xl font-serif italic tracking-tight font-medium text-gray-900 dark:text-gray-100 transition-colors">
          SuperQuran.com
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle currentTheme={themeCookie} />
          <a
            href="https://quran-web.qalam.workers.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-brand-orange/30 dark:border-brand-orange/20 rounded-md hover:bg-brand-orange/5 dark:hover:bg-brand-orange/10 transition-colors"
          >
            Explore Web
          </a>
          <a
            href="https://github.com/muhajirdev/quran-labs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-medium text-white bg-brand-orange hover:bg-[#d94d1b] dark:bg-[#FF6B35] dark:hover:bg-[#ff8457] rounded-md shadow-[0_0_15px_-3px_rgba(236,91,36,0.3)] dark:shadow-[0_0_20px_-3px_rgba(255,107,53,0.4)] transition-all"
          >
            Open Source
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 text-center max-w-4xl mx-auto z-10">
        {/* Glow Effects (Dark Mode only) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-orange/20 dark:bg-brand-orange/10 rounded-full blur-[120px] -z-10 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-1000"></div>
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/10 dark:bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-1000"></div>

        {/* Top Pill */}
        <div className="inline-flex items-center justify-center space-x-2 px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm mb-10 transition-colors">
          <span className="text-[10px] font-bold tracking-widest text-gray-600 dark:text-gray-400 uppercase">
            QURANIC KNOWLEDGE GRAPH · OFFICIAL DATA
          </span>
        </div>

        {/* Headlines */}
        <h1 className="text-5xl sm:text-7xl font-serif text-gray-900 dark:text-white leading-[1.1] tracking-tighter mb-8 transition-colors">
          Explore How The <br />
          <span className="bg-gradient-to-r from-brand-orange to-[#d94d1b] dark:from-[#FF6B35] dark:to-[#ff8457] bg-clip-text text-transparent italic pr-2 drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(255,107,53,0.3)]">Quran Connects</span> <br />
          Visually
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 font-light max-w-2xl mx-auto mb-10 leading-relaxed transition-colors">
          A visual network of verses, concepts, and classical commentary.
          Building the infrastructure to explore the profound connections within the Quranic tradition.
        </p>

        <a
          href="#"
          className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-medium text-white bg-brand-orange hover:bg-[#d94d1b] dark:bg-[#FF6B35] dark:hover:bg-[#ff8457] rounded-md transition-all hover:shadow-[0_8px_25px_-5px_rgba(236,91,36,0.4)] dark:hover:shadow-[0_8px_30px_-5px_rgba(255,107,53,0.5)] hover:-translate-y-0.5 mb-6"
        >
          Explore Graph <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </a>

        <div className="flex items-center justify-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-500 tracking-wide uppercase transition-colors">
          <span className="line-through opacity-70">Closed Beta</span>
          <span className="text-brand-orange dark:text-[#FF6B35]">Free & Open Source</span>
          <span className="opacity-50">·</span>
          <span>Lifetime access</span>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6 max-w-5xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { value: '114', label: 'Surahs' },
            { value: '6,236', label: 'Verses' },
            { value: '90K+', label: 'Words' },
            { value: '∞', label: 'Connections' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-sm border border-gray-100 dark:border-white/5 rounded-xl p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] dark:hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-4xl sm:text-5xl font-serif italic text-gray-900 dark:text-white mb-3 tracking-tight transition-colors">
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-xs font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase transition-colors">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto relative z-10">
        <h2 className="text-3xl sm:text-4xl font-serif italic text-center text-gray-900 dark:text-white mb-4 tracking-tight transition-colors">
          What You Can Explore
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-16 text-sm sm:text-base transition-colors">
          Everything you need to understand the thematic structure of the Quran.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-sm border border-gray-100 dark:border-white/5 rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] relative group hover:border-brand-orange/30 dark:hover:border-brand-orange/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
            <Search className="w-6 h-6 text-gray-400 dark:text-gray-500 mb-6 group-hover:text-brand-orange dark:group-hover:text-[#FF6B35] transition-colors" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 transition-colors">Instant Search</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">
              Search any concept, verse, or topic. Discover topics connected to Privacy and see Quranic verses discussing them.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-sm border border-gray-100 dark:border-white/5 rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] relative group hover:border-brand-orange/30 dark:hover:border-brand-orange/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
            <Network className="w-6 h-6 text-gray-400 dark:text-gray-500 mb-6 group-hover:text-brand-orange dark:group-hover:text-[#FF6B35] transition-colors opacity-80" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 transition-colors">Verse Network</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">
              See a network of verses about Musa. Explore conceptual connections in the opening chapter and the Throne Verse.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-sm border border-gray-100 dark:border-white/5 rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] relative group hover:border-brand-orange/30 dark:hover:border-brand-orange/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
            <BookOpen className="w-6 h-6 text-gray-400 dark:text-gray-500 mb-6 group-hover:text-brand-orange dark:group-hover:text-[#FF6B35] transition-colors opacity-80" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 transition-colors">Classical Commentary</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">
              Integrate profound connections from classical tafsir into your exploration of the Quranic tradition.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center relative z-10">
        <p className="text-sm text-gray-400 dark:text-gray-500 transition-colors">© 2026 SuperQuran Graph. All rights reserved.</p>
        <p className="text-xs text-brand-orange/80 dark:text-brand-orange/60 mt-2 font-medium transition-colors">Built for the Ummah</p>
      </footer>
    </div>
  )
}
