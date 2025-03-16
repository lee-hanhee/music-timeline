import { NextRequest, NextResponse } from "next/server";
import { updateSong, deleteSong } from "@/app/lib/supabase";
import { z } from "zod";

// Schema for song update validation
const songUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  artist: z.string().min(1).optional(),
  album: z.string().min(1).optional(),
  coverUrl: z.string().url().optional(),
  previewUrl: z.string().url().optional(),
  addedBy: z.enum(["Kate", "Victor", "Hanhee"]).optional(),
  platform: z.enum(["Spotify"]).optional(),
  spotifyId: z.string().optional(),
  spotifyUrl: z.string().url().optional(),
});

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const songId = context.params.id;
    const body = await request.json();

    // Validate the request body
    const result = songUpdateSchema.safeParse(body);
    if (!result.success) {
      // Validation error
      return NextResponse.json(
        { error: "Invalid song data", details: result.error.format() },
        { status: 400 }
      );
    }

    try {
      const song = await updateSong(songId, result.data);
      if (!song) {
        return NextResponse.json({ error: "Song not found" }, { status: 404 });
      }
      return NextResponse.json(song);
    } catch (error: any) {
      // Error from updateSong
      return NextResponse.json(
        {
          error: "Failed to update song in database",
          message: error.message || "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    // Error in PUT /api/songs/[id]
    return NextResponse.json(
      {
        error: "Failed to process request",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const songId = context.params.id;

    try {
      const success = await deleteSong(songId);
      if (!success) {
        return NextResponse.json(
          { error: "Failed to delete song" },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true });
    } catch (error: any) {
      // Error from deleteSong
      return NextResponse.json(
        {
          error: "Failed to delete song from database",
          message: error.message || "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    // Error in DELETE /api/songs/[id]
    return NextResponse.json(
      {
        error: "Failed to process request",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
