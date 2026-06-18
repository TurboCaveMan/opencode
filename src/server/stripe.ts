import Stripe from "stripe";
import { env } from "~/env";

// Initialize Stripe server-side client with types
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
});
