/* API Routes for Songs
 
  This file handles HTTP requests for fetching and creating songs.

  It provides two main endpoints:
  - GET: Retrieves songs from the database with optional date filters
  - POST: Creates a new song in the database after validating the data
*/

import { NextRequest, NextResponse } from "next/server";
import { addSong, getSongs } from "@/app/lib/supabase";
import { z } from "zod";

// Schema for song validation
// This defines the required structure and rules for song data
// Any data that doesn't match this schema will be rejected
const songSchema = z.object({
  name: z.string().min(1), // Song name (required, at least 1 character)
  artist: z.string().min(1), // Artist name (required, at least 1 character)
  album: z.string().min(1), // Album name (required, at least 1 character)
  coverUrl: z.string().url(), // Album cover image URL (required, must be valid URL)
  previewUrl: z.string().url().optional(), // Song preview URL (optional, but must be valid URL if provided)
  addedBy: z.enum(["Kate", "Victor", "Hanhee"]), // Who added the song (must be one of these three people)
  platform: z.enum(["Spotify"]), // Music platform (currently only Spotify is supported)
  spotifyId: z.string().optional(), // Spotify ID (optional)
  spotifyUrl: z.string().url().optional(), // Spotify URL (optional, but must be valid URL if provided)
  revealed: z.boolean().default(false), // Whether the song is revealed (defaults to hidden/false)
});

/**
 * GET function - Fetches songs from the database
 *
 * This function handles GET requests to /api/songs
 * It can filter songs by date range and whether they're revealed
 *
 * @param request - The incoming HTTP request with optional query parameters
 * @returns JSON response with an array of songs
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters from the URL
    // Example: /api/songs?startDate=2023-01-01&endDate=2023-12-31&includeUnrevealed=true
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const includeUnrevealed = searchParams.get("includeUnrevealed") === "true";

    // Pass parameters to getSongs function in the Supabase library
    const songs = await getSongs(startDate, endDate, includeUnrevealed);

    // Return the songs as JSON response
    return NextResponse.json(songs);
  } catch (error) {
    // If anything goes wrong, log the error and return a 500 status code
    console.error("Error in GET /api/songs:", error);
    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 }
    );
  }
}

/**
 * POST function - Creates a new song in the database
 *
 * This function handles POST requests to /api/songs
 * It validates the song data before saving it to the database
 *
 * @param request - The incoming HTTP request with the song data in JSON format
 * @returns JSON response with the created song or error details
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body as JSON
    const body = await request.json();

    // Validate the song data against our schema
    // This ensures all required fields are present and valid
    const result = songSchema.safeParse(body);
    if (!result.success) {
      // If validation fails, return a 400 Bad Request with details about what's wrong
      return NextResponse.json(
        { error: "Invalid song data", details: result.error.format() },
        { status: 400 }
      );
    }

    try {
      // Add the validated song to the database
      // Using type assertion to tell TypeScript that the data matches the required type
      const song = await addSong(
        result.data as {
          name: string;
          artist: string;
          album: string;
          coverUrl: string;
          previewUrl?: string;
          addedBy: string;
          platform: string;
          spotifyId?: string;
          spotifyUrl?: string;
          revealed?: boolean;
        }
      );

      // Return the created song with a 201 Created status
      return NextResponse.json(song, { status: 201 });
    } catch (error: any) {
      // If the database operation fails, return a 500 Internal Server Error
      return NextResponse.json(
        {
          error: "Failed to add song to database",
          message: error.message || "Unknown error",
          details: error,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    // If JSON parsing or any other operation fails, return a 500 Internal Server Error
    return NextResponse.json(
      {
        error: "Failed to process request",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
