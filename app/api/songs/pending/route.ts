// This file is used to count the number of pending songs (unrevealed songs)
// It is used to display the number of pending songs in the timeline

import { NextResponse } from "next/server"; // construct HTTP responses that will be returned 
// NextReponse.json(data, options): 
  // data: JSON-serializable data to be returned
  // options: options for the response (e.g., status code)  
import { supabase } from "@/app/lib/supabase"; // interact w/ Supabase (postgresql) database

// GET: Count pending songs (unrevealed songs)
export async function GET() {
  try {
    // count unrevealed songs (SUPABASE JS)
    const { count, error } = await supabase
      .from("songs") // specify table
      .select("*", { count: "exact", head: true }) // count: "exact" -> return exact count, head: true -> return count as number
      .eq("revealed", false); // filter by revealed column

    if (error) { // see if supabase query was successful
      console.error("Error getting pending songs count:", error);
      return NextResponse.json(
        { count: 0, error: error.message },
        { status: 200 } // still return 200 to not break the UI
      );
    }

    return NextResponse.json({ count: count || 0 }); // return count or 0 if undefined or null 
  } 
  catch (error: any) { // catch any errors 
    console.error("Error getting pending songs count:", {
      message: error.message || "",
    });
    return NextResponse.json(
      { count: 0, error: error.message || "" },
      { status: 200 } // Still return 200 to not break the UI
    );
  }
}
