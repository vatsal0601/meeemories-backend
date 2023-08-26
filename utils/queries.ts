import { db } from "@/db";
import { media, memories, type Media } from "@/db/schema";
import { eq, placeholder } from "drizzle-orm";

interface SaveMemory {
  userId: string;
  description?: string;
  publishedAt?: string;
}

export const userMemories = db
  .select({
    id: memories.id,
    description: memories.description,
    publishedAt: memories.publishedAt,
    media: {
      name: media.name,
      type: media.type,
      placeholder: media.placeholder,
      url: media.url,
    },
  })
  .from(memories)
  .where(eq(memories.userId, placeholder("userId")))
  .leftJoin(media, eq(memories.id, media.memoryId))
  .orderBy(memories.publishedAt)
  .prepare("userMemories");

export const saveMemory = async (data: SaveMemory) =>
  db.insert(memories).values(data).returning({
    id: memories.id,
  });

export const saveMedia = async (data: Omit<Media, "id">[]) =>
  db.insert(media).values(data);
