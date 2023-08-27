import { NextResponse, type NextRequest } from "next/server";
import { type Media } from "@/db/schema";
import { generatePlaceholder, handleUpload } from "@/utils/media";
import { saveMedia, saveMemory, userMemories } from "@/utils/queries";
import { auth } from "@clerk/nextjs";
import groupBy from "lodash/groupBy";
import includes from "lodash/includes";
import isEmpty from "lodash/isEmpty";
import size from "lodash/size";

const getMediaType = (type: string) => {
  if (includes(type, "image")) return "image";
  if (includes(type, "video")) return "video";
  return "unknown";
};

const getMediaToSave = async (
  userId: string,
  memoryId: number,
  medias: File[]
) => {
  const mediaToSave: Omit<Media, "id">[] = [];

  for (const media of medias) {
    try {
      const size = media.size / 1e6; // in MB
      const mediaType = getMediaType(media.type);
      let base64 = null;

      if (
        size === 0 ||
        mediaType === "unknown" ||
        (size > 5 && mediaType === "image") ||
        (size > 50 && mediaType === "video")
      )
        continue;

      const bytes = await media.arrayBuffer();
      const buffer = Buffer.from(bytes);
      if (mediaType === "image") base64 = await generatePlaceholder(buffer);
      const { url, key } = await handleUpload(userId, media.name, buffer);
      if (isEmpty(url) || isEmpty(key)) continue;

      mediaToSave.push({
        memoryId,
        name: `${userId}_${media.name}`,
        type: mediaType,
        placeholder: base64,
        url,
        key,
      });
    } catch (error) {
      console.error("error while executing `getMediaToSave`: ", error);
    }
  }

  return mediaToSave;
};

export const GET = async () => {
  const { userId } = auth();

  if (!userId)
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

  try {
    const memories = await userMemories.execute({ userId });

    return NextResponse.json(
      {
        data: groupBy(memories, (memory) => memory.publishedAt),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("error while executing `GET`: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const POST = async (request: NextRequest) => {
  const { userId } = auth();

  if (!userId)
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

  try {
    const body = await request.formData();
    const description: string | null = body.get(
      "description"
    ) as unknown as string;
    const publishedAt: string | null = body.get(
      "publishedAt"
    ) as unknown as string;
    const medias: File[] | null = body.getAll("media") as unknown as File[];

    const memoriesReturned = await saveMemory({
      userId,
      description: !isEmpty(description) ? description : undefined,
      publishedAt: !isEmpty(publishedAt) ? publishedAt : undefined,
    });
    const { id } = memoriesReturned[0];

    if (size(medias) > 0) {
      const mediaToSave = await getMediaToSave(userId, id, medias);
      if (size(mediaToSave) > 0) await saveMedia(mediaToSave);
    }

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    console.error("error while executing `POST`: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
