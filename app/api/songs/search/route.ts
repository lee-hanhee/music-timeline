import { NextRequest, NextResponse } from "next/server";
import { searchSpotify } from "@/app/lib/spotify";
import { SpotifySong } from "@/app/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    let results: { spotify: SpotifySong[] } = { spotify: [] };

    // Search Spotify
    const spotifyResults = await searchSpotify(query);
    results.spotify = spotifyResults;

    return NextResponse.json(results);
  } catch (error) {
    // Error in GET /api/songs/search
    return NextResponse.json(
      { error: "Failed to search songs" },
      { status: 500 }
    );
  }
}
