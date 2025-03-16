// Script to verify Spotify credentials and redirect URI
require("dotenv").config({ path: ".env.local" });

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

console.log("Verifying Spotify configuration:");
console.log("Client ID:", SPOTIFY_CLIENT_ID ? "✅ Set" : "❌ Missing");
console.log("Client Secret:", SPOTIFY_CLIENT_SECRET ? "✅ Set" : "❌ Missing");
console.log("Redirect URI:", SPOTIFY_REDIRECT_URI ? "✅ Set" : "❌ Missing");

if (SPOTIFY_REDIRECT_URI) {
  console.log("\nFull Redirect URI:", SPOTIFY_REDIRECT_URI);
  console.log(
    "\nVerify this exact URI is added to your Spotify Developer Dashboard"
  );
  console.log("Go to https://developer.spotify.com/dashboard");
  console.log("Select your app");
  console.log("Click 'Edit Settings'");
  console.log("Check the 'Redirect URIs' section");
}

// Generate the authorization URL for testing
if (SPOTIFY_CLIENT_ID && SPOTIFY_REDIRECT_URI) {
  const scopes = [
    "user-read-private",
    "user-read-email",
    "playlist-read-private",
    "playlist-modify-private",
    "playlist-modify-public",
    "streaming",
    "user-read-playback-state",
    "user-modify-playback-state",
  ];

  const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
    SPOTIFY_REDIRECT_URI
  )}&scope=${encodeURIComponent(scopes.join(" "))}`;

  console.log("\nTest authorization URL:");
  console.log(authUrl);
  console.log("\nTry opening this URL directly in your browser");
}
