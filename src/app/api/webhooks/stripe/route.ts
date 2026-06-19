import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { stripe } from "~/server/stripe";
import { env } from "~/env";

// Safely parses a Stripe Unix timestamp into a valid JavaScript Date, or returns null if invalid
function parseStripeDate(timestamp: any): Date | null {
  if (!timestamp) return null;
  const num = Number(timestamp);
  if (isNaN(num)) return null;
  const date = new Date(num * 1000);
  return isNaN(date.getTime()) ? null : date;
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new Response(
      "Missing STRIPE_WEBHOOK_SECRET. Webhooks cannot be validated.",
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const signature = headerPayload.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`Stripe Webhook Signature Verification Failed: ${errorMessage}`);
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  const eventType = event.type;
  console.log(`Received Stripe Webhook: ${eventType}`);

  try {
    // 1. Checkout session completed
    if (eventType === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;
      const clerkUserId = session.metadata?.clerkUserId;

      if (!subscriptionId) {
        return new Response("Stripe Checkout Session complete with no subscription", { status: 200 });
      }

      // Fetch latest subscription info from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = (subscription as any).items.data[0]?.price.id;
      const rawCurrentPeriodEnd = (subscription as any).current_period_end;
      const currentPeriodEnd = parseStripeDate(rawCurrentPeriodEnd);

      console.log(`[Stripe Webhook] Processing checkout.session.completed:`, {
        clerkUserId,
        customerId,
        subscriptionId,
        priceId,
        rawCurrentPeriodEnd,
        parsedDate: currentPeriodEnd ? currentPeriodEnd.toISOString() : null,
      });

      // Find user by Clerk ID first (passed via checkout metadata), otherwise fallback to customer ID
      if (clerkUserId) {
        await db
          .update(users)
          .set({
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: currentPeriodEnd,
          })
          .where(eq(users.id, clerkUserId));
      } else {
        await db
          .update(users)
          .set({
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: currentPeriodEnd,
          })
          .where(eq(users.stripeCustomerId, customerId));
      }
    }

    // 2. Subscription updated (e.g. plan changed, renewed, or payment failed)
    if (eventType === "customer.subscription.updated") {
      const subscription = event.data.object as any;
      const customerId = subscription.customer as string;
      const priceId = subscription.items.data[0]?.price.id;
      const rawCurrentPeriodEnd = subscription.current_period_end;
      const currentPeriodEnd = parseStripeDate(rawCurrentPeriodEnd);

      console.log(`[Stripe Webhook] Processing customer.subscription.updated:`, {
        customerId,
        subscriptionId: subscription.id,
        priceId,
        rawCurrentPeriodEnd,
        parsedDate: currentPeriodEnd ? currentPeriodEnd.toISOString() : null,
      });

      await db
        .update(users)
        .set({
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          stripeCurrentPeriodEnd: currentPeriodEnd,
        })
        .where(eq(users.stripeCustomerId, customerId));
    }

    // 3. Subscription deleted (canceled or expired)
    if (eventType === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await db
        .update(users)
        .set({
          stripeSubscriptionId: null,
          stripePriceId: null,
          stripeCurrentPeriodEnd: null,
        })
        .where(eq(users.stripeCustomerId, customerId));
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown database error";
    console.error(`Error processing Stripe database update: ${errorMsg}`);
    return new Response(`Database update error: ${errorMsg}`, { status: 500 });
  }

  return new Response("Stripe webhook processed successfully", { status: 200 });
}
