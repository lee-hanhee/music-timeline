import { NextRequest, NextResponse } from "next/server";
import { getSpotifyAccessToken } from "@/app/lib/spotify";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Get the authorization code from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      console.error("Spotify auth error:", error);
      return NextResponse.redirect(new URL("/?auth=error", request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL("/?auth=missing-code", request.url));
    }

    // Exchange the code for an access token
    const tokenResponse = await getSpotifyAccessToken(code);

    // Store the tokens in cookies (in a real app, you'd want to use a more secure method)
    const cookieStore = cookies();
    cookieStore.set("spotify_access_token", tokenResponse.access_token, {
      maxAge: tokenResponse.expires_in,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    cookieStore.set("spotify_refresh_token", tokenResponse.refresh_token, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // Redirect back to the app
    return NextResponse.redirect(new URL("/?auth=success", request.url));
  } catch (error) {
    console.error("Error in Spotify callback route:", error);
    return NextResponse.redirect(new URL("/?auth=error", request.url));
  }
}
