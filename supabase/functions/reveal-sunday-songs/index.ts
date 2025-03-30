// @deno-types="npm:@types/node"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Type declaration for Deno namespace (for TypeScript)
declare global {
  interface DenoNamespace {
    env: {
      get(key: string): string | undefined;
    };
    cron(name: string, schedule: string, callback: () => Promise<void>): void;
  }

  var Deno: DenoNamespace;
}

// CRON schedule: "0 17 * * 0" means "At 5:00 PM UTC / 12:00 PM EST on Sunday"
Deno.cron("Reveal Sunday Songs", "0 17 * * 0", async () => {
  try {
    // Set up database connection with service role key for admin privileges
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find all songs where revealed=false and set them to revealed=true
    const { data, error } = await supabase
      .from("songs")
      .update({ revealed: true })
      .eq("revealed", false)
      .select("id");

    // Log the results for monitoring
    if (error) {
      console.error("Error revealing songs:", error.message);
      return;
    }

    const revealedCount = data?.length || 0;
    console.log(`Successfully revealed ${revealedCount} songs`);
  } catch (error: any) {
    console.error(
      "Unexpected error in reveal-sunday-songs function:",
      error.message
    );
  }
});

// HTTP endpoint handler (required for deployments)
serve(async (req) => {
  return new Response(
    JSON.stringify({
      message: "This is a CRON function triggered every Sunday at 12 PM UTC",
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
