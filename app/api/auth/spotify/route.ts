import { NextRequest, NextResponse } from "next/server";
import { getSpotifyAuthUrl } from "@/app/lib/spotify";

export async function GET(request: NextRequest) {
  try {
    // Generate the Spotify authorization URL
    const authUrl = getSpotifyAuthUrl();

    // Redirect the user to the Spotify authorization page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    // Error in Spotify auth route
    return NextResponse.json(
      { error: "Failed to authenticate with Spotify" },
      { status: 500 }
    );
  }
}
