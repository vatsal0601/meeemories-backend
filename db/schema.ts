import { relations, sql, type InferModel } from "drizzle-orm";
import {
  datetime,
  int,
  mysqlEnum,
  mysqlTable,
  serial,
  text,
  varchar,
} from "drizzle-orm/mysql-core";

export const memories = mysqlTable("memeries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  description: text("description"),
  publishedAt: datetime("published_at", { mode: "string", fsp: 3 }).default(
    sql`CURRENT_TIMESTAMP(3)`
  ),
  createdAt: datetime("created_at", { mode: "string", fsp: 3 }).default(
    sql`CURRENT_TIMESTAMP(3)`
  ),
  updatedAt: datetime("updated_at", { mode: "string", fsp: 3 }).default(
    sql`CURRENT_TIMESTAMP(3)`
  ),
});

export type Memory = InferModel<typeof memories>;

export const memoriesRelations = relations(memories, ({ many }) => ({
  media: many(media),
}));

export const media = mysqlTable("media", {
  id: serial("id").primaryKey(),
  memoryId: int("memory_id").notNull(),
  type: mysqlEnum("media_type", ["image", "video"]).notNull(),
  name: varchar("name", { length: 256 }).notNull(),
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
