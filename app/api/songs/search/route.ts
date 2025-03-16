import { NextRequest, NextResponse } from "next/server";
import { searchAppleMusic } from "@/app/lib/apple-music";
import { searchSpotify } from "@/app/lib/spotify";
import { AppleMusicSong, SpotifySong } from "@/app/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");
    const platform = searchParams.get("platform");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    let results: { appleMusic?: AppleMusicSong[]; spotify?: SpotifySong[] } =
      {};

    // Search based on platform or both if not specified
    if (!platform || platform === "apple") {
      const appleMusicResults = await searchAppleMusic(query);
      results.appleMusic = appleMusicResults;
    }

    if (!platform || platform === "spotify") {
      const spotifyResults = await searchSpotify(query);
      results.spotify = spotifyResults;
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in GET /api/songs/search:", error);
    return NextResponse.json(
      { error: "Failed to search songs" },
      { status: 500 }
    );
  }
}
