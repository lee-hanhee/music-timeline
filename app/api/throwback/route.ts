// This file is used to get the throwback song from the database.

import { NextResponse } from "next/server";
import { getThrowbackSong } from "@/app/lib/supabase";

export async function GET() {
  try {
    const throwbackSong = await getThrowbackSong();

    if (!throwbackSong) {
      return NextResponse.json(
        { error: "No throwback songs available" },
        { status: 404 }
      );
    }

    return NextResponse.json(throwbackSong);
  } 
  catch (error) { // error in GET /api/throwback
    return NextResponse.json(
      { error: "Failed to fetch throwback song" },
      { status: 500 }
    );
  }
}
