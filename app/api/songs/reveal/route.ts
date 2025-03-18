/**
 * Song Reveal API Endpoints
 *
 * This file provides two API routes:
 * 1. POST - Reveals all hidden songs (sets their revealed status to true)
 * 2. GET - Gets information about the next scheduled reveal time
 *
 * These endpoints are part of the "Sunday Song Reveal" feature where
 * songs are hidden until Sunday at 12 PM, then automatically revealed.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

/**
 * POST Endpoint: Reveal Hidden Songs
 *
 * This endpoint can be triggered in two ways:
 * 1. Automatically by a scheduled task/cron job at 12 PM every Sunday
 * 2. Manually for testing/administrative purposes
 *
 * The endpoint finds all songs where revealed=false and updates them to revealed=true.
 *
 * @param request - The incoming HTTP request (may contain authentication)
 * @returns JSON response with results or error message
 */
export async function POST(request: NextRequest) {
  try {
    // Check for an authorization key for security
    // This prevents unauthorized users from revealing songs
    const authHeader = request.headers.get("authorization");
    const expectedKey = process.env.REVEAL_SONGS_API_KEY;

    // If an API key is configured, verify the request has the correct key
    if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current date for logging/debugging
    const currentDate = new Date();

    // OPTIONAL FEATURE: Only reveal songs on Sundays
    // This is commented out to allow manual triggering for testing
    // Uncomment to enforce Sunday-only reveals
    // if (currentDate.getDay() !== 0) {  // 0 = Sunday in JavaScript
    //   return NextResponse.json({
    //     message: "Reveal is only allowed on Sundays",
    //     today: currentDate.toISOString()
    //   });
    // }

    // Step 1: Find all songs that haven't been revealed yet
    const { data: unrevealed, error: fetchError } = await supabase
      .from("songs")
      .select("id") // We only need the IDs to count them
      .eq("revealed", false); // Where revealed = false

    // Handle errors from the database query
    if (fetchError) {
      console.error("Error fetching unrevealed songs:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch unrevealed songs" },
        { status: 500 }
      );
    }

    // If no songs need to be revealed, return early with a message
    if (!unrevealed || unrevealed.length === 0) {
      return NextResponse.json({
        message: "No unrevealed songs found",
      });
    }

    // Step 2: Update all unrevealed songs to be revealed
    // This sets revealed=true for all songs where revealed=false
    const { error: updateError } = await supabase
      .from("songs")
      .update({ revealed: true }) // Set revealed to true
      .eq("revealed", false); // For all songs where revealed is false

    // Handle errors from the update operation
    if (updateError) {
      console.error("Error revealing songs:", updateError);
      return NextResponse.json(
        { error: "Failed to reveal songs" },
        { status: 500 }
      );
    }

    // Success! Return information about how many songs were revealed
    return NextResponse.json({
      message: `Successfully revealed ${unrevealed.length} songs`,
      revealedCount: unrevealed.length, // Number of songs that were revealed
      timestamp: currentDate.toISOString(), // When the reveal happened
    });
  } catch (error: any) {
    // Catch any unexpected errors
    console.error("Exception in reveal songs endpoint:", error);
    return NextResponse.json(
      {
        error: "Failed to process reveal request",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET Endpoint: Get Next Reveal Time
 *
 * This endpoint calculates when the next song reveal will happen
 * (next Sunday at 12 PM) and how many songs are waiting to be revealed.
 *
 * This is used by the countdown timer on the frontend.
 *
 * @returns JSON with the next reveal time and pending song count
 */
export async function GET() {
  try {
    // Get the current date and time
    const now = new Date();

    // Create a date object for the next reveal (starting with today)
    const nextSunday = new Date(now);

    // Calculate days until next Sunday
    // (7 - current day) % 7 gives days until Sunday
    // e.g., if today is Tuesday (2), then (7-2)%7 = 5 days until Sunday
    nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7));

    // Special case: If today is already Sunday
    if (now.getDay() === 0) {
      // 0 = Sunday
      // If it's before noon, the reveal is today at noon
      if (now.getHours() < 12) {
        nextSunday.setDate(now.getDate()); // Keep today's date
      }
      // If it's after noon, the reveal is next Sunday
      else {
        nextSunday.setDate(now.getDate() + 7); // Add 7 days
      }
    }

    // Set the time to exactly 12:00:00 PM
    nextSunday.setHours(12, 0, 0, 0);

    // Count how many songs are waiting to be revealed
    const { count, error } = await supabase
      .from("songs")
      .select("*", { count: "exact", head: true }) // Only count, don't fetch data
      .eq("revealed", false); // Where revealed = false

    // Log any errors but don't fail the request
    if (error) {
      console.error("Error counting unrevealed songs:", error);
    }

    // Return the next reveal time and pending song count
    return NextResponse.json({
      nextReveal: nextSunday.toISOString(), // When the next reveal will happen
      pendingRevealCount: count || 0, // How many songs will be revealed
    });
  } catch (error: any) {
    // Handle any unexpected errors
    return NextResponse.json(
      { error: "Failed to get next reveal time" },
      { status: 500 }
    );
  }
}
