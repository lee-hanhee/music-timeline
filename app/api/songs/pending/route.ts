// This file is used to count the number of pending songs (unrevealed songs)
// It is used to display the number of pending songs in the timeline

import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

// GET: Count pending songs (unrevealed songs)
export async function GET() {
  try {
    // Count unrevealed songs
    const { count, error } = await supabase
      .from("songs")
      .select("*", { count: "exact", head: true })
      .eq("revealed", false);

    if (error) {
      console.error("Error getting pending songs count:", error);
      return NextResponse.json(
        { count: 0, error: error.message },
        { status: 200 } // Still return 200 to not break the UI
      );
    }

    return NextResponse.json({ count: count || 0 });
  } catch (error: any) {
    console.error("Error getting pending songs count:", {
      message: error.message || "",
    });
    return NextResponse.json(
      { count: 0, error: error.message || "" },
      { status: 200 } // Still return 200 to not break the UI
    );
  }
}
