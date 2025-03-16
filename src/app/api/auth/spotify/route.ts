import { NextRequest, NextResponse } from "next/server";
import { getSpotifyAuthUrl } from "@/app/lib/spotify";

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are properly set
    if (
      !process.env.SPOTIFY_CLIENT_ID ||
      !process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
    ) {
      console.error("Missing Spotify configuration:", {
        clientId: !!process.env.SPOTIFY_CLIENT_ID,
        redirectUri: !!process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
      });

      return NextResponse.json(
        { error: "Spotify configuration is incomplete" },
        { status: 500 }
      );
    }

    // Generate the Spotify authorization URL
    const authUrl = getSpotifyAuthUrl();
    console.log("Redirecting to Spotify auth URL:", authUrl);

    // Redirect the user to the Spotify authorization page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error in Spotify auth route:", error);
    return NextResponse.json(
      { error: "Failed to authenticate with Spotify", details: String(error) },
      { status: 500 }
    );
  }
}
