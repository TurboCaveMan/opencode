import { index, pgTableCreator, timestamp, varchar, integer, text } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `t3-saas-template_${name}`);

// Users table to sync with Clerk and manage Stripe customer profiles & subscriptions
export const users = createTable(
  "user",
  {
    id: varchar("id", { length: 256 }).primaryKey(), // Matches Clerk's User ID (e.g. user_2...)
    email: varchar("email", { length: 256 }).notNull(),
    name: varchar("name", { length: 256 }),
    imageUrl: varchar("image_url", { length: 1024 }),
    
    // Stripe integrations
    stripeCustomerId: varchar("stripe_customer_id", { length: 256 }).unique(),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 256 }),
    stripePriceId: varchar("stripe_price_id", { length: 256 }),
    stripeCurrentPeriodEnd: timestamp("stripe_current_period_end", { withTimezone: true }),
    
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => new Date()),
  }
);

// Sample posts model, linked to the verified user profile
export const posts = createTable(
  "post",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    title: varchar("title", { length: 256 }).notNull(),
    content: text("content"),
    userId: varchar("user_id", { length: 256 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => new Date()),
  },
  (t) => [index("user_id_idx").on(t.userId)]
);
