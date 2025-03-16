import { NextRequest, NextResponse } from "next/server";
import { getUserPlaylists } from "@/app/lib/spotify";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
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

    // Get the user's playlists
    const playlists = await getUserPlaylists(accessToken);

    return NextResponse.json(playlists);
  } catch (error) {
    console.error("Error in GET /api/spotify/playlists:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlists" },
      { status: 500 }
    );
  }
}
