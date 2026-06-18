import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default async function Home() {
  const { userId } = await auth();

  const features = [
    {
      title: "Neon Serverless Postgres",
      description: "Powered by Neon's instant branching, autoscaling, and connectionless HTTP querying for lightning-fast speeds.",
    },
    {
      title: "Clerk Authentication",
      description: "Pre-built, beautiful login and sign-up flows with complete user sync to your Postgres database.",
    },
    {
      title: "Stripe Subscriptions",
      description: "Ready-to-go checkout sessions, customer portal redirections, and database-synced subscription webhooks.",
    },
    {
      title: "tRPC End-to-End Type Safety",
      description: "Directly import and use your backend API schemas inside your frontend pages with autocomplete and compile-time validation.",
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-slate-950 text-slate-100 font-sans">
      {/* Navigation Header */}
      <header className="w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              T3 SaaS Template
            </span>
          </div>
          <nav className="flex items-center gap-4">
            {userId ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-500 transition duration-200"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-sm font-semibold text-slate-300 hover:text-white transition cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-500 transition duration-200 cursor-pointer">
                    Get Started
                  </button>
                </SignUpButton>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center flex-1 flex flex-col justify-center">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
          Deploy Your SaaS in{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Minutes
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 sm:text-xl">
          The ultimate boilerplate featuring Next.js App Router, Tailwind CSS, tRPC, Drizzle, Clerk Auth, Stripe Payments, and Neon Serverless Database.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          {userId ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500 transition duration-200 shadow-lg shadow-indigo-500/20"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <SignUpButton mode="modal">
                <button className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500 transition duration-200 shadow-lg shadow-indigo-500/20 cursor-pointer">
                  Get Started for Free
                </button>
              </SignUpButton>
              <Link
                href="#pricing"
                className="rounded-lg border border-slate-800 bg-slate-900/50 px-6 py-3 font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition duration-200"
              >
                View Pricing
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full border-t border-slate-900 bg-slate-950 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center sm:text-4xl bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
            Powering Your Core SaaS Experience
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-900 bg-slate-900/20 p-6 hover:border-slate-800 transition duration-200"
              >
                <h3 className="text-lg font-bold text-indigo-400">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full border-t border-slate-900 bg-slate-900/10 px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-slate-400">Unlock complete access with our simple subscription plans.</p>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 max-w-2xl mx-auto">
            {/* Free Plan */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8 text-left flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold">Hobby</h3>
                <p className="mt-2 text-sm text-slate-400">Explore the basics of your application.</p>
                <p className="mt-4 text-4xl font-extrabold">$0</p>
                <p className="text-xs text-slate-500">Free forever</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2">✓ View latest public posts</li>
                  <li className="flex items-center gap-2">✓ Create up to 1 standard post</li>
                  <li className="flex items-center gap-2">✓ Standard speed</li>
                </ul>
              </div>
              <div className="mt-8">
                {userId ? (
                  <Link
                    href="/dashboard"
                    className="block w-full text-center rounded-lg bg-slate-800 py-3 text-sm font-semibold hover:bg-slate-700 transition duration-200"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <SignUpButton mode="modal">
                    <button className="w-full rounded-lg bg-slate-800 py-3 text-sm font-semibold hover:bg-slate-700 transition duration-200 cursor-pointer">
                      Sign Up Free
                    </button>
                  </SignUpButton>
                )}
              </div>
            </div>

            {/* Pro Plan */}
            <div className="rounded-2xl border-2 border-indigo-500 bg-slate-950 p-8 text-left flex flex-col justify-between relative shadow-xl shadow-indigo-500/10">
              <span className="absolute -top-3 right-8 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                Popular
              </span>
              <div>
                <h3 className="text-xl font-bold">Pro</h3>
                <p className="mt-2 text-sm text-slate-400">Perfect for power users and creators.</p>
                <p className="mt-4 text-4xl font-extrabold">$19</p>
                <p className="text-xs text-slate-500">per month</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2 text-indigo-400">✓ Infinite premium posts</li>
                  <li className="flex items-center gap-2">✓ Early access features</li>
                  <li className="flex items-center gap-2">✓ Priority customer support</li>
                  <li className="flex items-center gap-2">✓ 24/7 Server Uptime</li>
                </ul>
              </div>
              <div className="mt-8">
                {userId ? (
                  <Link
                    href="/dashboard"
                    className="block w-full text-center rounded-lg bg-indigo-600 py-3 text-sm font-semibold hover:bg-indigo-500 transition duration-200"
                  >
                    Subscribe Now
                  </Link>
                ) : (
                  <SignUpButton mode="modal">
                    <button className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold hover:bg-indigo-500 transition duration-200 cursor-pointer">
                      Get Started
                    </button>
                  </SignUpButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} T3 SaaS Template. All rights reserved.</p>
      </footer>
    </main>
  );
}
