import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Logo } from '../components/Logo.jsx'
import { Button } from '../components/Button.jsx'
import { Card } from '../components/Card.jsx'

function LandingHeader() {
  const { isAuthenticated } = useAuth()
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
      <Link to="/" className="flex items-center gap-2">
        <Logo compact />
      </Link>
      <nav className="flex items-center gap-4">
        {isAuthenticated ? (
          <Link to="/home">
            <Button variant="primary">Play Now</Button>
          </Link>
        ) : (
          <>
            <Link to="/login" className="text-white/90 hover:text-white font-medium transition-colors">
              Login
            </Link>
            <Link to="/login">
              <Button variant="primary">Register</Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}

function Hero() {
  const { isAuthenticated } = useAuth()
  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute top-1/4 right-0 w-1/2 h-1/2 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="relative max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
          Play Chess Online
        </h1>
        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Challenge players worldwide in real-time
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link to="/home">
              <Button variant="primary" className="px-8 py-4 text-lg rounded-xl shadow-emerald-500/30 border border-emerald-400/50">
                Play Online
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="primary" className="px-8 py-4 text-lg rounded-xl shadow-emerald-500/30 border border-emerald-400/50">
                  Play Online
                </Button>
              </Link>
              <Link to="/local">
                <Button variant="secondary" className="px-8 py-4 text-lg rounded-xl border border-emerald-400/60">
                  Play Locally
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-700/30 rounded-full blur-3xl -z-10" />
    </section>
  )
}

const FEATURES = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Fast matchmaking',
    desc: 'Find an opponent in seconds. No waiting, just chess.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1 12a11 11 0 1022 0 11 11 0 00-22 0z" />
      </svg>
    ),
    title: 'Real-time online games',
    desc: 'Seamless gameplay with low latency. Experience live chess.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Secure & fair play',
    desc: 'Robust anti-cheat measures ensure a clean gaming environment.',
  },
]

function Features() {
  return (
    <section className="py-20 px-6">
      <h2 className="text-3xl font-bold text-white text-center mb-12">Features</h2>
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
        {FEATURES.map((f) => (
          <Card key={f.title} className="p-6 border-emerald-500/20">
            <div className="text-emerald-400 mb-4">{f.icon}</div>
            <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
            <p className="text-white/70 text-sm">{f.desc}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}

const STEPS = [
  {
    step: 1,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: 'Create an account',
    desc: 'Sign up in minutes to get started.',
  },
  {
    step: 2,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'Find a match',
    desc: 'Choose your time control and start searching.',
  },
  {
    step: 3,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    title: 'Play and improve',
    desc: 'Enjoy the game, analyze your moves, and boost your rating.',
  },
]

function HowItWorks() {
  return (
    <section className="py-20 px-6">
      <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
        {STEPS.map((s) => (
          <Card key={s.step} className="p-6 border-emerald-500/20 relative">
            <div className="absolute -top-3 left-6 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
              {s.step}
            </div>
            <div className="text-emerald-400 mb-4 mt-2">{s.icon}</div>
            <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
            <p className="text-white/70 text-sm">{s.desc}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-6">Ready to play?</h2>
        <Link to="/login">
          <Button variant="primary" className="px-10 py-4 text-lg rounded-xl shadow-emerald-500/30 border border-emerald-400/50">
            Get Started Free
          </Button>
        </Link>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-white/5">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
        <a href="#about" className="hover:text-white transition-colors">About</a>
        <a href="#github" className="hover:text-white transition-colors">GitHub</a>
        <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
        <a href="#terms" className="hover:text-white transition-colors">Terms</a>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      <LandingHeader />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
        <Footer />
      </main>
    </div>
  )
}
