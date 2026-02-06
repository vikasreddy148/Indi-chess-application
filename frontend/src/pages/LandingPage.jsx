import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Logo } from '../components/Logo.jsx'
import { Button } from '../components/Button.jsx'

function Nav() {
  const { isAuthenticated } = useAuth()
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <Logo compact />
        </Link>
        <div className="flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block transition-colors">
            How it works
          </a>
          {isAuthenticated ? (
            <Link to="/home">
              <Button variant="primary" size="sm">Play Now</Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Sign in
              </Link>
              <Link to="/login">
                <Button variant="primary" size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  const { isAuthenticated } = useAuth()
  return (
    <section className="relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] -translate-y-1/2 translate-x-1/3 bg-indigo-100 rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50" />
      <div className="relative max-w-6xl mx-auto px-6 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              The modern way to
              <span className="text-indigo-600"> play chess</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-xl leading-relaxed">
              Real-time matchmaking, fair play, and a beautiful experience. Challenge players worldwide in seconds.
            </p>
            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link to="/home">
                  <Button variant="primary" size="xl">Play online</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="primary" size="xl">Start playing free</Button>
                  </Link>
                  <Link to="/local">
                    <Button variant="outline" size="xl">Play locally</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <div className="w-full max-w-sm aspect-square rounded-3xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-1 shadow-2xl shadow-indigo-500/20">
              <div className="w-full h-full rounded-[22px] bg-white/10 backdrop-blur flex items-center justify-center">
                <span className="text-[120px] opacity-90">♞</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stats() {
  const stats = [
    { value: '10k+', label: 'Games played' },
    { value: '50+', label: 'Countries' },
    { value: '&lt;2s', label: 'Matchmaking' },
  ]
  return (
    <section className="border-y border-slate-200/80 bg-white/50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-3 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-slate-900">{s.value}</div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    {
      title: 'Lightning fast matchmaking',
      desc: 'Find an opponent in under 2 seconds. No queues, no waiting—just chess.',
      icon: '⚡',
    },
    {
      title: 'Real-time gameplay',
      desc: 'Seamless WebSocket connection. Every move syncs instantly.',
      icon: '🌐',
    },
    {
      title: 'Fair play guaranteed',
      desc: 'Anti-cheat measures and transparent rating system.',
      icon: '✓',
    },
  ]
  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
            Built for serious players
          </h2>
          <p className="text-xl text-slate-600 mt-4 max-w-2xl mx-auto">
            Everything you need for competitive online chess
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-slate-300/80 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl mb-6 group-hover:bg-indigo-100 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{f.title}</h3>
              <p className="text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { num: '01', title: 'Create account', desc: 'Sign up in 30 seconds. No credit card required.' },
    { num: '02', title: 'Pick time control', desc: 'Choose Rapid, Blitz, or Classical.' },
    { num: '03', title: 'Play & improve', desc: 'Match with opponents and climb the ranks.' },
  ]
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
            Three steps to your first game
          </h2>
          <p className="text-xl text-slate-600 mt-4 max-w-2xl mx-auto">
            Get from signup to checkmate in minutes
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-12 relative">
          {steps.map((s, i) => (
            <div key={s.num} className="relative">
              <div className="text-6xl font-extrabold text-indigo-100 mb-4">{s.num}</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{s.title}</h3>
              <p className="text-slate-600">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-slate-200 -translate-x-1/2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="rounded-3xl bg-indigo-600 px-8 py-16 lg:py-20">
          <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
            Ready to play?
          </h2>
          <p className="text-indigo-100 mt-4 text-lg">
            Join thousands of players. Free forever.
          </p>
          <div className="mt-8">
            <Link to="/login">
              <button className="h-14 px-10 rounded-2xl bg-white text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors">
                Get started free
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="font-semibold text-slate-900 mb-4">Product</div>
            <div className="space-y-3">
              <a href="#features" className="block text-sm text-slate-500 hover:text-slate-900">Features</a>
              <Link to="/local" className="block text-sm text-slate-500 hover:text-slate-900">Local play</Link>
            </div>
          </div>
          <div>
            <div className="font-semibold text-slate-900 mb-4">Company</div>
            <div className="space-y-3">
              <a href="#about" className="block text-sm text-slate-500 hover:text-slate-900">About</a>
              <a href="#contact" className="block text-sm text-slate-500 hover:text-slate-900">Contact</a>
            </div>
          </div>
          <div>
            <div className="font-semibold text-slate-900 mb-4">Legal</div>
            <div className="space-y-3">
              <a href="#privacy" className="block text-sm text-slate-500 hover:text-slate-900">Privacy</a>
              <a href="#terms" className="block text-sm text-slate-500 hover:text-slate-900">Terms</a>
            </div>
          </div>
          <div>
            <Logo compact />
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} IndiChess. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <CTA />
        <Footer />
      </main>
    </div>
  )
}
