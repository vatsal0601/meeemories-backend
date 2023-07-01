import { NextResponse } from "next/server";
import { db } from "@/db";
import { memories } from "@/db/schema";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";

export async function GET() {
  const { userId } = auth();

  if (!userId)
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

  try {
    const userMemories = await db.query.memories.findMany({
      where: eq(memories.userId, userId),
      with: {
        media: {
          columns: {
            name: true,
            type: true,
            blurhash: true,
            url: true,
          },
        },
      },
    });
    return NextResponse.json({ data: userMemories }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
