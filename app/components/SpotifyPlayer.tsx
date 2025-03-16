"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { useToast } from "@/app/lib/use-toast";

interface SpotifyPlayerProps {
  trackId?: string;
}

declare global {
  interface Window {
    Spotify: {
      Player: new (options: any) => any;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

export default function SpotifyPlayer({ trackId }: SpotifyPlayerProps) {
  const { toast } = useToast();
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Load the Spotify Web Playback SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      // Get the access token from cookies or localStorage
      const token = getCookie("spotify_access_token");
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in with Spotify to use the player",
          variant: "destructive",
        });
        return;
      }

      setAccessToken(token);

      const spotifyPlayer = new window.Spotify.Player({
        name: "Music Timeline Web Player",
        getOAuthToken: (cb: (token: string) => void) => {
          cb(token);
        },
        volume: 0.5,
      });

      // Error handling
      spotifyPlayer.addListener(
        "initialization_error",
        ({ message }: { message: string }) => {
          console.error("Initialization error:", message);
          toast({
            title: "Player Error",
            description: "Failed to initialize Spotify player",
            variant: "destructive",
          });
        }
      );

      spotifyPlayer.addListener(
        "authentication_error",
        ({ message }: { message: string }) => {
          console.error("Authentication error:", message);
          toast({
            title: "Authentication Error",
            description: "Please log in with Spotify again",
            variant: "destructive",
          });
        }
      );

      spotifyPlayer.addListener(
        "account_error",
        ({ message }: { message: string }) => {
          console.error("Account error:", message);
          toast({
            title: "Account Error",
            description: "Premium account required for playback",
            variant: "destructive",
          });
        }
      );

      spotifyPlayer.addListener(
        "playback_error",
        ({ message }: { message: string }) => {
          console.error("Playback error:", message);
          toast({
            title: "Playback Error",
            description: "Error during playback",
            variant: "destructive",
          });
        }
      );

      // Playback status updates
      spotifyPlayer.addListener("player_state_changed", (state: any) => {
        if (state) {
          setIsPlaying(!state.paused);
        }
      });

      // Ready
      spotifyPlayer.addListener(
        "ready",
        ({ device_id }: { device_id: string }) => {
          console.log("Ready with Device ID", device_id);
          setDeviceId(device_id);
          setIsReady(true);
          toast({
            title: "Player Ready",
            description: "Spotify player is ready",
          });
        }
      );

      // Not Ready
      spotifyPlayer.addListener(
        "not_ready",
        ({ device_id }: { device_id: string }) => {
          console.log("Device ID has gone offline", device_id);
          setIsReady(false);
          toast({
            title: "Player Disconnected",
            description: "Spotify player disconnected",
            variant: "destructive",
          });
        }
      );

      // Connect to the player
      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
    };

    return () => {
      // Clean up
      if (player) {
        player.disconnect();
      }
      document.body.removeChild(script);
    };
  }, [toast]);

  // Play a track when trackId changes
  useEffect(() => {
    if (trackId && deviceId && accessToken && isReady) {
      playTrack(trackId);
    }
  }, [trackId, deviceId, accessToken, isReady]);

  const playTrack = async (id: string) => {
    if (!deviceId || !accessToken) return;

    try {
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            uris: [`spotify:track:${id}`],
          }),
        }
      );
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing track:", error);
      toast({
        title: "Playback Error",
        description: "Failed to play track",
        variant: "destructive",
      });
    }
  };

  const togglePlayback = async () => {
    if (!player) return;

    try {
      await player.togglePlay();
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Error toggling playback:", error);
      toast({
        title: "Playback Error",
        description: "Failed to toggle playback",
        variant: "destructive",
      });
    }
  };

  // Helper function to get cookies
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  if (!accessToken) {
    return (
      <div className="flex flex-col items-center space-y-4 p-4 border rounded-md">
        <p>Spotify playback requires authentication</p>
        <Button onClick={() => (window.location.href = "/api/auth/spotify")}>
          Connect with Spotify
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-4 border rounded-md">
      <div className="text-center">
        <h3 className="font-medium">Spotify Web Player</h3>
        <p className="text-sm text-muted-foreground">
          {isReady ? "Ready to play" : "Connecting..."}
        </p>
      </div>
      <div className="flex space-x-2">
        <Button onClick={togglePlayback} disabled={!isReady || !trackId}>
          {isPlaying ? "Pause" : "Play"}
        </Button>
      </div>
    </div>
  );
}
