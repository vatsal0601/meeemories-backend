import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { media, memories } from "@/db/schema";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import groupBy from "lodash/groupBy";
import size from "lodash/size";
import { getPlaiceholder } from "plaiceholder";
import { z } from "zod";

const MemoryPostSchema = z.object({
  description: z.string().optional(),
  media: z.array(
    z.object({
      type: z.enum(["image", "video"]),
      width: z.number(),
      height: z.number(),
    })
  ),
});

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
        data: groupBy(userMemories, (item) => {
          if (!item.publishedAt) return "no-date";
          const date = new Date(item.publishedAt);
          return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        }),
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

  console.log("data", description, publishedAt, size(medias));

  if (size(medias) > 0) {
    for (const index in medias) {
      console.log(`media - ${index}`);
      console.log(medias[index]);
      const bytes = await medias[index].arrayBuffer();
      const buffer = Buffer.from(bytes);
      const { base64 } = await getPlaiceholder(buffer, {
        autoOrient: true,
        size: 16,
      });
      console.log(base64);
    }
  }

  return NextResponse.json({ data: "POST success" }, { status: 200 });
};
