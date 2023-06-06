import {
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
});

export const media = mysqlTable("media", {
  id: serial("id").primaryKey(),
  memoryId: int("memory_id").notNull(),
  type: mysqlEnum("media_type", ["image", "video"]).notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  url: varchar("url", { length: 256 }).notNull(),
  blurhash: varchar("blurhash", { length: 256 }),
});
