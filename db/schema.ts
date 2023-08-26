import { relations, type InferModel } from "drizzle-orm";
import {
  date,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const memories = pgTable("memeries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  description: text("description"),
  publishedAt: date("published_at", { mode: "string" }).defaultNow(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export type Memory = InferModel<typeof memories>;

export const memoriesRelations = relations(memories, ({ many }) => ({
  media: many(media),
}));

export const mediaTypes = pgEnum("media_type", ["image", "video"]);

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  memoryId: integer("memory_id")
    .references(() => memories.id)
    .notNull(),
  type: mediaTypes("media_type").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  key: varchar("key", { length: 256 }).notNull(),
  url: varchar("url", { length: 256 }).notNull(),
  placeholder: text("placeholder"),
});

export const mediaRelations = relations(media, ({ one }) => ({
  memory: one(memories, {
    fields: [media.memoryId],
    references: [memories.id],
  }),
}));

export type Media = InferModel<typeof media>;
