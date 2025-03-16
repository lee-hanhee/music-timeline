import { NextRequest, NextResponse } from "next/server";
import { addSong, getSongs } from "@/app/lib/supabase";
import { z } from "zod";

// Schema for song validation
const songSchema = z.object({
  name: z.string().min(1),
  artist: z.string().min(1),
  album: z.string().min(1),
  coverUrl: z.string().url(),
  previewUrl: z.string().url().optional(),
  addedBy: z.enum(["Kate", "Victor", "Hanhee"]),
  platform: z.enum(["Apple Music", "Spotify"]),
  appleMusicId: z.string().optional(),
  spotifyId: z.string().optional(),
  appleMusicUrl: z.string().url().optional(),
  spotifyUrl: z.string().url().optional(),
});

export async function GET() {
  try {
    const songs = await getSongs();
    return NextResponse.json(songs);
  } catch (error) {
    console.error("Error in GET /api/songs:", error);
    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received song data:", body);

    // Validate the request body
    const result = songSchema.safeParse(body);
    if (!result.success) {
      console.error("Validation error:", result.error.format());
      return NextResponse.json(
        { error: "Invalid song data", details: result.error.format() },
        { status: 400 }
      );
    }

    try {
      const song = await addSong(result.data);
      return NextResponse.json(song, { status: 201 });
    } catch (error: any) {
      console.error("Error from addSong:", error);
      return NextResponse.json(
        {
          error: "Failed to add song to database",
          message: error.message || "Unknown error",
          details: error,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in POST /api/songs:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
