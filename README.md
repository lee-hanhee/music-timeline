# MusicLine

## About

MusicLine is a collaborative music timeline application that leverages the Spotify API for song data and playback. The system architecture follows a modern full-stack approach with Next.js serving both the frontend React application and backend API routes.

The application flow begins with users authenticating via Spotify OAuth to gain access to playlist features. Users can search for songs using the Spotify API, with results displayed in real-time. Selected songs are added to a shared timeline stored in a Supabase PostgreSQL database.

The timeline interface displays songs chronologically with user avatars, album artwork, and playback controls. Users can filter the timeline by date ranges or view user-specific timelines. A weekly song reveal system adds engagement by making newly added songs visible only after a countdown timer expires. The throwback feature randomly surfaces older songs to encourage rediscovery.

Data flows from the Spotify API through server-side API routes to protect authentication credentials, while the frontend handles state management and UI interactions. The application prioritizes a responsive, modern interface with animations and sleek design elements, making it accessible across devices.

## Features

- **Song Search**: Search for songs using the Spotify API with real-time results
- **Shared Timeline**: Add songs to a collaborative timeline visible to all users
- **User-Specific Timelines**: View songs by specific users (Kate, Victor, Hanhee)
- **Date Filtering**: Filter the timeline by date ranges (last 7 days, last 30 days, this month, etc.)
- **Song Reveal System**: Weekly song reveal with countdown timer
- **Throwback Feature**: Randomly surfaces older songs from the timeline
- **Responsive Design**: Modern UI with ShadCN UI components that works on mobile and desktop

## Tech Stack

- **Frontend**:
  - Next.js 15.2
  - React 18
  - TypeScript
  - TailwindCSS
  - ShadCN UI components
  - Framer Motion (for animations)
- **Backend**:
  - Next.js API Routes
  - Supabase (PostgreSQL database)
  - Supabase Edge Functions (for automated tasks)
- **Authentication**:
  - Spotify OAuth
- **APIs**:
  - Spotify Web API
- **Libraries**:
  - date-fns (date manipulation)
  - zod (schema validation)
  - canvas-confetti (visual effects)

## Code Structure

```
├── app/                          # Main application directory (Next.js App Router)
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── songs/                # Song management endpoints
│   │   ├── spotify/              # Spotify integration endpoints
│   │   └── throwback/            # Throwback feature endpoints
│   ├── components/               # UI components
│   │   ├── ui/                   # Base UI components (ShadCN)
│   │   ├── DateRangeFilter.tsx   # Date filtering component
│   │   ├── Header.tsx            # App header
│   │   ├── SongForm.tsx          # Song addition form
│   │   ├── SongRevealCountdown.tsx # Weekly song reveal countdown
│   │   ├── ThrowbackCard.tsx     # Throwback song display
│   │   └── Timeline.tsx          # Main timeline component
│   ├── lib/                      # Utility functions and services
│   │   ├── spotify.ts            # Spotify API integration
│   │   ├── supabase.ts           # Database connection and queries
│   │   └── use-toast.ts          # Toast notification hook
│   ├── types/                    # TypeScript type definitions
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Homepage component
├── public/                       # Static files
├── db/                           # Database scripts and schemas
├── supabase/                     # Supabase configuration
│   ├── functions/                # Supabase Edge Functions
│   │   └── reveal-sunday-songs/  # Weekly song reveal automation
│   └── schema.sql                # Database schema
└── fix-database.sql              # Database setup script
```

## Key Function Details

### Backend

- **API Routes**:

  - `/api/songs`: GET (fetch all songs with optional filters), POST (add a new song)
  - `/api/songs/search`: Search for songs using the Spotify API
  - `/api/songs/reveal`: Manage song reveal system for weekly reveals
  - `/api/songs/pending`: Get songs that are pending reveal
  - `/api/auth/spotify`: Initiate Spotify authentication flow
  - `/api/auth/spotify/callback`: Handle Spotify authentication callback
  - `/api/throwback`: Get a random throwback song from the timeline

- **Database Services**:

  - `getSongs()`: Fetches songs with optional date range and reveal filters
  - `addSong()`: Adds a new song to the database
  - `getSongsByUser()`: Gets songs added by a specific user
  - `getThrowbackSong()`: Randomly selects a song that's at least a month old
  - `updateSong()`: Updates an existing song
  - `deleteSong()`: Removes a song from the database

- **Spotify Integration**:
  - `getSpotifyClientToken()`: Obtains a client credentials token
  - `searchSpotify()`: Searches for tracks using the Spotify API
  - `getSpotifyTrack()`: Gets details for a specific track

### Frontend

- **Main Components**:
  - `Timeline.tsx`: Displays songs in chronological order with filtering options
  - `SongForm.tsx`: Handles song search and addition
  - `SpotifyAuth.tsx`: Manages Spotify authentication state
  - `SongRevealCountdown.tsx`: Weekly song reveal countdown timer
  - `ThrowbackCard.tsx`: Displays throwback songs

## Automated Tasks

- **Weekly Song Reveal**: Supabase Edge Function that automatically sets `revealed = true` for all pending songs every Sunday at 12 PM EST (5 PM UTC)
  - Located in `supabase/functions/reveal-sunday-songs/`
  - Uses Deno CRON functionality to schedule weekly execution
  - No manual intervention required once deployed

## Environment Setup

To set up the environment variables for local development:

1. Create a `.env.local` file in the project root with the following:

   ```
   # Supabase connection details
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

   # Supabase service role key (only for server-side operations)
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Spotify API credentials
   SPOTIFY_CLIENT_ID=your-spotify-client-id
   SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
   SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback
   ```

2. For Edge Functions development, create another `.env.local` file in `supabase/functions/reveal-sunday-songs/`:

   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. Replace the placeholder values with your actual credentials from:
   - Supabase Project Dashboard → Settings → API
   - Spotify Developer Dashboard → Your App → Settings

Note: Never commit these files to your repository. They're already added to `.gitignore`.

## License

MIT
