import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { media, memories, type Media } from "@/db/schema";
import { generatePlaceholder, handleUpload } from "@/utils/media";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import groupBy from "lodash/groupBy";
import includes from "lodash/includes";
import size from "lodash/size";

const getMediaType = (type: string) => {
  if (includes(type, "image")) return "image";
  if (includes(type, "video")) return "video";
  return "unknown";
};

export const GET = async () => {
  const { userId } = auth();

  if (!userId)
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

  try {
    const userMemories = await db
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
      .where(eq(memories.userId, userId))
      .leftJoin(media, eq(memories.id, media.memoryId))
      .orderBy(memories.publishedAt);

    return NextResponse.json(
      {
        data: groupBy(userMemories, (memory) => memory.publishedAt),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const POST = async (request: NextRequest, response: NextResponse) => {
  const { userId } = auth();

  if (!userId)
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

  const body = await request.formData();
  const description: string | null = body.get(
    "description"
  ) as unknown as string;
  const publishedAt: string | null = body.get(
    "publishedAt"
  ) as unknown as string;
  const medias: File[] | null = body.getAll("media") as unknown as File[];

  const memoryReturned = await db
    .insert(memories)
    .values({ userId, description, publishedAt })
    .returning({
      id: memories.id,
      description: memories.description,
      publishedAt: memories.publishedAt,
    });

  const memory = memoryReturned[0];
  const mediaToSave: Omit<Media, "id">[] = [];
  let mediaReturned: Omit<Omit<Media, "memoryId">, "key">[] = [];

  if (size(medias) > 0) {
    for (const media of medias) {
      const size = media.size;
      const mediaType = getMediaType(media.type);
      if (size === 0 || mediaType === "unknown") break;
      const bytes = await media.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = await generatePlaceholder(buffer);
      const { url, key } = await handleUpload(userId, media.name, buffer);

      mediaToSave.push({
        memoryId: memory.id,
        name: `${userId}_${media.name}`,
        type: mediaType,
        placeholder: base64,
        url,
        key,
      });
    }

    mediaReturned = await db.insert(media).values(mediaToSave).returning({
      id: media.id,
      name: media.name,
      type: media.type,
      placeholder: media.placeholder,
      url: media.url,
    });
  }

  return NextResponse.json(
    {
      data: {
        id: memory.id,
        description: memory.description,
        publishedAt: memory.publishedAt,
        media: mediaReturned,
      },
    },
    { status: 200 }
  );
};
