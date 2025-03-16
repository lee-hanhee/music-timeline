import { NextRequest, NextResponse } from "next/server";
import { updateMemoryNote } from "@/app/lib/supabase";
import { z } from "zod";

// Schema for memory note validation
const memoryNoteSchema = z.object({
  songId: z.string().uuid(),
  memoryNote: z.string().max(200).nullable(),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received memory note update:", body);

    // Validate the request body
    const result = memoryNoteSchema.safeParse(body);
    if (!result.success) {
      console.error("Validation error:", result.error.format());
      return NextResponse.json(
        { error: "Invalid memory note data", details: result.error.format() },
        { status: 400 }
      );
    }

    try {
      const song = await updateMemoryNote(
        result.data.songId,
        result.data.memoryNote
      );
      return NextResponse.json(song);
    } catch (error: any) {
      console.error("Error from updateMemoryNote:", error);
      return NextResponse.json(
        {
          error: "Failed to update memory note",
          message: error.message || "Unknown error",
          details: error,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in PUT /api/songs/memory-note:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
