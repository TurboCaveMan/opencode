import { Webhook } from "svix";
import { headers } from "next/headers";
import { type WebhookEvent } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { env } from "~/env";

export async function POST(req: Request) {
  // 1. Retrieve the Clerk Webhook Secret from env
  const WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new Response(
      "Missing CLERK_WEBHOOK_SECRET. Webhooks cannot be validated.",
      { status: 500 }
    );
  }

  // 2. Fetch headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    });
  }

  // 3. Get the raw request body
  const payload = await req.json() as Record<string, unknown>;
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // 4. Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Verification failed", {
      status: 400,
    });
  }

  // 5. Handle the webhook event types
  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // Retrieve primary email
    const email = email_addresses?.[0]?.email_address;
    if (!email) {
      return new Response("Error: No email address provided", { status: 400 });
    }

    const name = `${first_name ?? ""} ${last_name ?? ""}`.trim() || null;

    if (eventType === "user.created") {
      await db.insert(users).values({
        id,
        email,
        name,
        imageUrl: image_url ?? null,
      }).onConflictDoUpdate({
        target: users.id,
        set: { email, name, imageUrl: image_url ?? null },
      });
    } else {
      await db
        .update(users)
        .set({
          email,
          name,
          imageUrl: image_url ?? null,
        })
        .where(eq(users.id, id));
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      await db.delete(users).where(eq(users.id, id));
    }
  }

  return new Response("Clerk webhook processed successfully", { status: 200 });
}
