// This file is used to search for songs on Spotify.

import { NextRequest, NextResponse } from "next/server";
import { searchSpotify } from "@/app/lib/spotify";
import { SpotifySong } from "@/app/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    // request.nextUrl: object containing the URL of the request.
    // searchParams: object containing all the query parameters in the URL.

    const query = searchParams.get("query"); // .get("query"): get the query parameter from the URL.

    if (!query) { // if the query is not provided
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    let results: { spotify: SpotifySong[] } = { spotify: [] }; // object containing the results of the search.
    // Search Spotify
    const spotifyResults = await searchSpotify(query);
    results.spotify = spotifyResults;

    return NextResponse.json(results); // return the results of the search.
  } 
  catch (error) { // error in GET /api/songs/search
    return NextResponse.json(
      { error: "Failed to search songs" },
      { status: 500 }
    );
  }
}
