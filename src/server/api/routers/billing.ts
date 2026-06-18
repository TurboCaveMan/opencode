import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";
import { stripe } from "~/server/stripe";
import { env } from "~/env";

export const billingRouter = createTRPCRouter({
  // Query current user's subscription and billing status
  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.userId),
    });

    if (!user) {
      return {
        isActive: false,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
        stripeCustomerId: null,
      };
    }

    const isActive =
      !!user.stripeSubscriptionId &&
      !!user.stripeCurrentPeriodEnd &&
      new Date(user.stripeCurrentPeriodEnd).getTime() > Date.now();

    return {
      isActive,
      stripePriceId: user.stripePriceId ?? null,
      stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd ?? null,
      stripeCustomerId: user.stripeCustomerId ?? null,
    };
  }),

  // Generate a Stripe Checkout Session URL for a subscription purchase
  createCheckoutSession: protectedProcedure
    .input(z.object({ priceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 1. Fetch user from DB
      let dbUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.session.userId),
      });

      // If user isn't synchronized yet, throw error or sync from Clerk on the fly
      if (!dbUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not synced yet. Please try again in a moment.",
        });
      }

      let stripeCustomerId = dbUser.stripeCustomerId;

      // 2. Create Stripe Customer if not exists
      if (!stripeCustomerId) {
        const stripeCustomer = await stripe.customers.create({
          email: dbUser.email,
          name: dbUser.name ?? undefined,
          metadata: {
            clerkUserId: ctx.session.userId,
          },
        });

        stripeCustomerId = stripeCustomer.id;

        // Update DB with Customer ID
        await ctx.db
          .update(users)
          .set({ stripeCustomerId })
          .where(eq(users.id, ctx.session.userId));
      }

      const appUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

      // 3. Create Checkout Session
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price: input.priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${appUrl}/dashboard?billing_success=true`,
        cancel_url: `${appUrl}/pricing?billing_canceled=true`,
        metadata: {
          clerkUserId: ctx.session.userId,
        },
      });

      if (!session.url) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate Stripe checkout session URL",
        });
      }

      return { url: session.url };
    }),

  // Generate a Stripe Customer Billing Portal Session URL for self-service subscription management
  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const dbUser = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.userId),
    });

    if (!dbUser || !dbUser.stripeCustomerId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You do not have a billing profile set up yet. Please subscribe first.",
      });
    }

    const appUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${appUrl}/dashboard`,
    });

    return { url: session.url };
  }),
});
