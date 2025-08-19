import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Error reports table
export const errors = pgTable("errors", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  priority: varchar("priority", { length: 50 }).notNull().default("보통"),
  system: varchar("system", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("접수됨"),
  browser: varchar("browser", { length: 255 }),
  os: varchar("os", { length: 255 }),
  attachments: text("attachments").array(),
  reporterId: varchar("reporter_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertErrorSchema = createInsertSchema(errors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateErrorSchema = insertErrorSchema.partial();

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertError = z.infer<typeof insertErrorSchema>;
export type UpdateError = z.infer<typeof updateErrorSchema>;
export type Error = typeof errors.$inferSelect;

// Type interfaces for API responses
export interface ErrorStatsResponse {
  newErrors: number;
  inProgress: number;
  completed: number;
  onHold: number;
}

export interface ErrorListResponse {
  errors: Error[];
  total: number;
}

export interface WeeklyStatsResponse {
  week: string;
  errors: number;
  resolved: number;
}

export interface CategoryStatsResponse {
  category: string;
  count: number;
}
