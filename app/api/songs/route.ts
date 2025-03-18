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
  platform: z.enum(["Spotify"]),
  spotifyId: z.string().optional(),
  spotifyUrl: z.string().url().optional(),
  revealed: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const includeUnrevealed = searchParams.get("includeUnrevealed") === "true";

    // Pass parameters to getSongs
    const songs = await getSongs(startDate, endDate, includeUnrevealed);
    return NextResponse.json(songs);
  } catch (error) {
    // Error in GET /api/songs
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

    // Validate the request body
    const result = songSchema.safeParse(body);
    if (!result.success) {
      // Validation error
      return NextResponse.json(
        { error: "Invalid song data", details: result.error.format() },
        { status: 400 }
      );
    }

    try {
      const song = await addSong(result.data);
      return NextResponse.json(song, { status: 201 });
    } catch (error: any) {
      // Error from addSong
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
    // Error in POST /api/songs
    return NextResponse.json(
      {
        error: "Failed to process request",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
