import { NextRequest, NextResponse } from "next/server";
import { getSpotifyAuthUrl } from "@/app/lib/spotify";

export async function GET(request: NextRequest) {
  try {
    console.log("Spotify auth route called, request URL:", request.url);

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

    // Try to ensure the redirect works by setting headers
    const response = NextResponse.redirect(authUrl);
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("Pragma", "no-cache");

    console.log(
      "Sending redirect response with headers:",
      Object.fromEntries(response.headers.entries())
    );

    return response;
  } catch (error) {
    console.error("Error in Spotify auth route:", error);
    return NextResponse.json(
      { error: "Failed to authenticate with Spotify", details: String(error) },
      { status: 500 }
    );
  }
}
