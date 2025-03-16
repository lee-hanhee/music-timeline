# Music Timeline

A full-stack web application that allows users to create a shared music timeline. Users can search for songs using Apple Music and Spotify APIs, add them to a timeline, play previews, and add songs to their playlists.

## Features

- Search for songs using Apple Music and Spotify APIs
- Add songs to a shared timeline
- Play song previews
- Add songs to Apple Music or Spotify playlists
- User-specific timelines (Kate, Victor, Hanhee)
- Modern UI with ShadCN UI components

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS, ShadCN UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **APIs**: Apple Music API, Spotify API

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Apple Music API Developer Token
- Spotify API Client ID and Secret

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
APPLE_MUSIC_API_TOKEN=your_apple_music_api_token
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
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
4. Deploy

## API Routes

- `GET /api/songs` - Get all songs in the timeline
- `POST /api/songs` - Add a new song to the timeline
- `GET /api/songs/search` - Search for songs using Apple Music and Spotify APIs

## License

MIT
