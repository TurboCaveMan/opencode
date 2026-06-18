"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { env } from "~/env";

import { api } from "~/trpc/react";
import { PostManager } from "~/app/_components/post";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [stripeLoading, setStripeLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Queries
  const { data: status, isLoading: statusLoading } = api.billing.getSubscriptionStatus.useQuery(
    undefined,
    {
      enabled: !!isLoaded && !!user,
    }
  );

  // Mutations
  const createCheckout = api.billing.createCheckoutSession.useMutation({
    onSuccess: (res) => {
      window.location.href = res.url;
    },
    onError: (err) => {
      setStripeLoading(false);
      setErrorMsg(err.message || "Failed to initiate Stripe Checkout.");
    },
  });

  const createPortal = api.billing.createPortalSession.useMutation({
    onSuccess: (res) => {
      window.location.href = res.url;
    },
    onError: (err) => {
      setStripeLoading(false);
      setErrorMsg(err.message || "Failed to open Stripe Billing Portal.");
    },
  });

  const handleUpgrade = async () => {
    setStripeLoading(true);
    setErrorMsg("");
    // Use centrally configured Stripe Price ID from env, falling back to dummy default
    const priceId = env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? "price_1Otest_your_stripe_price_id_here";
    createCheckout.mutate({ priceId });
  };

  const handleManageBilling = async () => {
    setStripeLoading(true);
    setErrorMsg("");
    createPortal.mutate();
  };

  const isPremium = !!status?.isActive;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Navigation */}
      <header className="w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              T3 SaaS Template
            </Link>
            <span className="h-4 w-px bg-slate-850" />
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">
              Protected Area
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 hidden sm:inline">Signed in as {user?.emailAddresses[0]?.emailAddress}</span>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <div className="mx-auto max-w-6xl px-6 pt-12">
        {/* Profile Card & Billing Controller */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-10">
          <div className="md:col-span-2 rounded-2xl border border-slate-900 bg-slate-900/10 p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">User Dashboard</span>
              <h1 className="text-3xl font-extrabold mt-1 text-slate-100">
                Welcome back, {user?.firstName ?? "Explorer"}! 👋
              </h1>
              <p className="mt-2 text-sm text-slate-400 max-w-xl">
                This dashboard connects your Clerk user identity to your Neon database via serverless HTTP queries and Stripe webhook sync.
              </p>
            </div>
            
            {errorMsg && (
              <p className="text-xs text-rose-400 mt-4 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                {errorMsg}
              </p>
            )}
          </div>

          {/* Billing Info Panel */}
          <div className="rounded-2xl border border-indigo-900/40 bg-indigo-950/10 p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 blur-xl rounded-full" />
            <div>
              <span className="text-xs text-indigo-400 uppercase tracking-wider font-bold">Billing Status</span>
              {statusLoading ? (
                <div className="mt-4 space-y-2 animate-pulse">
                  <div className="h-6 bg-slate-800 rounded w-1/2" />
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                </div>
              ) : (
                <div className="mt-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${isPremium ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                    <h3 className="text-2xl font-bold">
                      {isPremium ? "Pro Tier Plan" : "Hobby Tier Plan"}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-2.5">
                    {isPremium
                      ? `Your subscription renews on ${new Date(status.stripeCurrentPeriodEnd!).toLocaleDateString()}`
                      : "Create unlimited entries by subscribing to our Pro tier."}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6">
              {!statusLoading && (
                isPremium ? (
                  <button
                    onClick={handleManageBilling}
                    disabled={stripeLoading}
                    className="w-full text-center rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-750 transition duration-200 py-2.5 text-sm font-semibold cursor-pointer"
                  >
                    {stripeLoading ? "Loading Portal..." : "Manage Subscription"}
                  </button>
                ) : (
                  <button
                    onClick={handleUpgrade}
                    disabled={stripeLoading}
                    className="w-full text-center rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition duration-200 py-2.5 text-sm font-bold cursor-pointer shadow-lg shadow-indigo-500/15"
                  >
                    {stripeLoading ? "Processing Stripe..." : "Upgrade to Pro ($19/mo)"}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Database Playground Divider */}
        <div className="h-px bg-slate-900 my-8 w-full" />

        {/* Live database syncing post manager */}
        <PostManager isPremium={isPremium} />
      </div>
    </main>
  );
}
