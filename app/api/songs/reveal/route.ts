import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

// This endpoint can be called by a cron job set to run at 12 PM every Sunday
// or manually triggered for testing
export async function POST(request: NextRequest) {
  try {
    // Check for an authorization key for security
    // This is a simple implementation - in production, use proper auth
    const authHeader = request.headers.get("authorization");
    const expectedKey = process.env.REVEAL_SONGS_API_KEY;

    // Simple security check - in production, use a more robust solution
    if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current date
    const currentDate = new Date();

    // Optional: Only proceed if it's Sunday (0 is Sunday in JS)
    // Remove this check if you want to allow manual triggering any day
    // if (currentDate.getDay() !== 0) {
    //   return NextResponse.json({
    //     message: "Reveal is only allowed on Sundays",
    //     today: currentDate.toISOString()
    //   });
    // }

    // Get all unrevealed songs
    const { data: unrevealed, error: fetchError } = await supabase
      .from("songs")
      .select("id")
      .eq("revealed", false);

    if (fetchError) {
      console.error("Error fetching unrevealed songs:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch unrevealed songs" },
        { status: 500 }
      );
    }

    // If there are no unrevealed songs, return early
    if (!unrevealed || unrevealed.length === 0) {
      return NextResponse.json({
        message: "No unrevealed songs found",
      });
    }

    // Update all unrevealed songs to be revealed
    const { error: updateError } = await supabase
      .from("songs")
      .update({ revealed: true })
      .eq("revealed", false);

    if (updateError) {
      console.error("Error revealing songs:", updateError);
      return NextResponse.json(
        { error: "Failed to reveal songs" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Successfully revealed ${unrevealed.length} songs`,
      revealedCount: unrevealed.length,
      timestamp: currentDate.toISOString(),
    });
  } catch (error: any) {
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

// Provide a GET endpoint for checking next reveal time
export async function GET() {
  try {
    // Get the current date
    const now = new Date();

    // Find the next Sunday at 12 PM
    const nextSunday = new Date(now);

    // Move to next Sunday (0 is Sunday in JS)
    nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7));

    // If today is Sunday and it's before 12 PM, use today
    if (now.getDay() === 0 && now.getHours() < 12) {
      nextSunday.setDate(now.getDate());
    }
    // If today is Sunday and it's after 12 PM, use next Sunday
    else if (now.getDay() === 0 && now.getHours() >= 12) {
      nextSunday.setDate(now.getDate() + 7);
    }

    // Set to 12 PM
    nextSunday.setHours(12, 0, 0, 0);

    // Get unrevealed song count
    const { count, error } = await supabase
      .from("songs")
      .select("*", { count: "exact", head: true })
      .eq("revealed", false);

    if (error) {
      console.error("Error counting unrevealed songs:", error);
    }

    return NextResponse.json({
      nextReveal: nextSunday.toISOString(),
      pendingRevealCount: count || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to get next reveal time" },
      { status: 500 }
    );
  }
}
