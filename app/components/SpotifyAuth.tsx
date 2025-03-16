"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { useToast } from "@/app/lib/use-toast";
import { SpotifyUserProfile } from "@/app/types";

export default function SpotifyAuth() {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<SpotifyUserProfile | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if the user is authenticated with Spotify
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const token = getCookie("spotify_access_token");

        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Fetch the user profile to verify the token
        const response = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const profile = await response.json();
          setUserProfile(profile);
          setIsAuthenticated(true);
        } else {
          // Token might be expired
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking Spotify auth:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Check for auth=success in the URL (after redirect from Spotify)
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get("auth");

    if (authStatus === "success") {
      toast({
        title: "Authentication Successful",
        description: "You are now connected to Spotify",
      });
      // Remove the query parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authStatus === "error") {
      toast({
        title: "Authentication Failed",
        description: "Failed to connect to Spotify",
        variant: "destructive",
      });
      // Remove the query parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    checkAuth();
  }, [toast]);

  // Helper function to get cookies
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  const handleLogin = () => {
    window.location.href = "/api/auth/spotify";
  };

  const handleLogout = () => {
    // Clear the cookies
    document.cookie = "spotify_access_token=; Max-Age=0; path=/; SameSite=Lax";
    document.cookie = "spotify_refresh_token=; Max-Age=0; path=/; SameSite=Lax";
    setIsAuthenticated(false);
    setUserProfile(null);
    toast({
      title: "Logged Out",
      description: "You have been disconnected from Spotify",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">
          Checking Spotify connection...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-4 border rounded-md">
      {isAuthenticated && userProfile ? (
        <>
          <div className="flex items-center space-x-2">
            {userProfile.images && userProfile.images.length > 0 && (
              <img
                src={userProfile.images[0].url}
                alt={userProfile.display_name}
                className="w-8 h-8 rounded-full"
              />
            )}
            <div>
              <p className="font-medium">{userProfile.display_name}</p>
              <p className="text-xs text-muted-foreground">
                Connected to Spotify
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Disconnect
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm">
            Connect to Spotify to enable full functionality
          </p>
          <Button onClick={handleLogin}>Connect with Spotify</Button>
        </>
      )}
    </div>
  );
}
