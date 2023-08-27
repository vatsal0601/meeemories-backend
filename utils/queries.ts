import { db } from "@/db";
import { media, memories, type Media } from "@/db/schema";
import { eq, placeholder } from "drizzle-orm";

interface SaveMemory {
  userId: string;
  description?: string;
  publishedAt?: string;
}

export const userMemories = db.query.memories
  .findMany({
    where: eq(memories.userId, placeholder("userId")),
    orderBy: memories.publishedAt,
    with: {
      media: {
        columns: {
          id: true,
          name: true,
          type: true,
          placeholder: true,
          url: true,
        },
      },
    },
  })
  .prepare("userMemories");

export const saveMemory = async (data: SaveMemory) =>
  db.insert(memories).values(data).returning({
    id: memories.id,
  });

export const saveMedia = async (data: Omit<Media, "id">[]) =>
  db.insert(media).values(data);
