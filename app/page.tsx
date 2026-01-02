import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  ShieldCheck,
  Zap
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black">
              <span className="text-xl font-bold text-white">T</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">TodoApp</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-black transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white shadow-lg hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 pt-32">
        <section className="px-6 py-20 lg:py-32">
          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-600 animate-in fade-in slide-in-from-bottom-3 duration-700">
              <span className="flex h-2 w-2 rounded-full bg-green-500" />
              Now in professional beta
            </div>
            <h1 className="mt-8 text-5xl font-extrabold tracking-tight text-black sm:text-7xl lg:text-8xl animate-in fade-in slide-in-from-bottom-5 duration-1000 fill-mode-both">
              Master your day, <br className="hidden sm:block" />
              control it with <span className="text-zinc-400 font-medium italic">TodoApp</span>.
            </h1>
            <p className="mx-auto mt-10 max-w-2xl text-lg leading-8 text-zinc-600 sm:text-xl animate-in fade-in slide-in-from-bottom-7 duration-1000 fill-mode-both">
              A high-performance task management system designed for speed, clarity, and focus. Built with Next.js and Prisma for the modern professional.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-both">
              <Link
                href="/login"
                className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-black px-8 text-lg font-semibold text-white shadow-2xl hover:opacity-90 transition-all sm:w-auto"
              >
                Sign In
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/register"
                className="flex h-14 w-full items-center justify-center rounded-full border border-zinc-200 bg-white px-8 text-lg font-semibold text-black hover:bg-zinc-50 transition-all sm:w-auto"
              >
                Create Account
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-zinc-50/50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-3">
              {[
                {
                  title: "Lightning Fast",
                  description: "Experience zero-lag task manipulation with our optimized Next.js bridge.",
                  icon: Zap,
                },
                {
                  title: "Secure & Reliable",
                  description: "Your data is safe with enterprise-grade encryption and Prisma-backed stability.",
                  icon: ShieldCheck,
                },
                {
                  title: "Intuitive Design",
                  description: "Our signature White Theme keeps your focus on what matters most—your work.",
                  icon: LayoutDashboard,
                },
              ].map((feature, i) => (
                <div key={i} className="group relative rounded-3xl border bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 group-hover:bg-black group-hover:text-white transition-colors">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold">{feature.title}</h3>
                  <p className="mt-4 text-zinc-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Ready to boost your productivity?
            </h2>
            <p className="mt-6 text-lg text-zinc-600">
              Join thousands of users who have streamlined their workflow with TodoApp.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="rounded-full bg-black px-10 py-4 text-lg font-bold text-white shadow-xl hover:opacity-90 transition-opacity"
              >
                Sign Up Now
              </Link>
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                No credit card required
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-zinc-500">
          <p>© 2026 TodoApp. Built with Advanced Web Technology.</p>
        </div>
      </footer>
    </div>
  );
}
