import { NextRequest, NextResponse } from "next/server";
import { addTrackToPlaylist } from "@/app/lib/spotify";
import { cookies } from "next/headers";
import { z } from "zod";

// Schema for request validation
const addToPlaylistSchema = z.object({
  playlistId: z.string(),
  trackId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    // Get the access token from cookies
    const cookieStore = cookies();
    const accessToken = cookieStore.get("spotify_access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Not authenticated with Spotify" },
        { status: 401 }
      );
    }

    // Validate the request body
    const body = await request.json();
    const result = addToPlaylistSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.format() },
        { status: 400 }
      );
    }

    // Add the track to the playlist
    const success = await addTrackToPlaylist(
      accessToken,
      result.data.playlistId,
      result.data.trackId
    );

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to add track to playlist" },
        { status: 500 }
      );
    }
  } catch (error) {
    // Error in POST /api/spotify/playlists/add
    return NextResponse.json(
      { error: "Failed to add track to playlist" },
      { status: 500 }
    );
  }
}
