# Music Timeline

A full-stack web application that allows users to create a shared music timeline. Users can search for songs using the Spotify API, add them to a timeline, and add songs to their Spotify playlists.

## Features

- Search for songs using the Spotify API
- Add songs to a shared timeline
- Add songs to Spotify playlists
- User-specific timelines (Kate, Victor, Hanhee)
- Spotify authentication for playlist management and playback
- Modern UI with ShadCN UI components

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS, ShadCN UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Spotify OAuth
- **APIs**: Spotify Web API

## Prerequisites

- Node.js and npm
- Supabase account
- Spotify Developer account with API credentials

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback
```

## Database Setup

To set up the database for this project, follow these steps:

1. Go to your Supabase project dashboard: https://app.supabase.com/project/_/sql
2. Open the SQL Editor
3. Copy the contents of the `fix-database.sql` file from this project
4. Paste it into the SQL Editor and run it

This will:

- Create the `songs` table if it doesn't exist
- Disable Row Level Security (RLS) for development purposes
- Test that the table is working correctly

### Troubleshooting Database Issues

If you encounter a "new row violates row-level security policy for table 'songs'" error, it means that Row Level Security (RLS) is enabled on your table but you don't have the proper permissions. To fix this:

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Policies
3. Find the `songs` table
4. Click "Disable RLS" or run the SQL command: `ALTER TABLE songs DISABLE ROW LEVEL SECURITY;`

For production environments, you should enable RLS and create appropriate policies, but for development, disabling RLS is simpler.

### Service Role Key (Optional)

For more advanced database operations that bypass RLS, you can add your Supabase service role key to your `.env.local` file:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

You can find this key in your Supabase project settings under API > Project API keys > service_role key.

**Warning:** The service role key has admin privileges. Never expose it in client-side code or commit it to your repository.

## Spotify Developer Setup

1. Create a Spotify Developer account at [developer.spotify.com](https://developer.spotify.com/)
2. Create a new application in the Spotify Developer Dashboard
3. Add `http://localhost:3000/api/auth/spotify/callback` as a Redirect URI in your Spotify app settings
4. Copy your Client ID and Client Secret to your `.env.local` file

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This application can be deployed on Vercel:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Configure the environment variables in Vercel
4. Update the Spotify Redirect URI in your Spotify Developer Dashboard to match your production URL
5. Deploy

## API Routes

- `GET /api/songs` - Get all songs in the timeline
- `POST /api/songs` - Add a new song to the timeline
- `GET /api/songs/search` - Search for songs using the Spotify API
- `GET /api/auth/spotify` - Initiate Spotify authentication
- `GET /api/auth/spotify/callback` - Handle Spotify authentication callback

## License

MIT
