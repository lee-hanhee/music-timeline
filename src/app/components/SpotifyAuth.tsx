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
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check if the user is authenticated with Spotify
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const token = getCookie("spotify_access_token");

        if (!token) {
          console.log("No Spotify access token found in cookies");
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        console.log("Found Spotify access token, verifying with API");

        // Fetch the user profile to verify the token
        const response = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const profile = await response.json();
          console.log(
            "Successfully verified Spotify token, user:",
            profile.display_name
          );
          setUserProfile(profile);
          setIsAuthenticated(true);
          setAuthError(null);
        } else {
          // Token might be expired
          console.error(
            "Spotify API error:",
            response.status,
            response.statusText
          );
          setIsAuthenticated(false);
          setAuthError("Token validation failed");
        }
      } catch (error) {
        console.error("Error checking Spotify auth:", error);
        setIsAuthenticated(false);
        setAuthError(String(error));
      } finally {
        setIsLoading(false);
      }
    };

    // Check for auth=success in the URL (after redirect from Spotify)
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get("auth");
    const authReason = urlParams.get("reason") || urlParams.get("details");

    if (authStatus) {
      console.log(
        "Auth status from URL:",
        authStatus,
        authReason ? `(${authReason})` : ""
      );
    }

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
        description: authReason
          ? `Error: ${authReason}`
          : "Failed to connect to Spotify",
        variant: "destructive",
      });
      setAuthError(authReason || "Unknown error");
      // Remove the query parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authStatus === "config-error") {
      toast({
        title: "Configuration Error",
        description: "Spotify API configuration is incomplete",
        variant: "destructive",
      });
      setAuthError("Configuration error");
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
    console.log("Initiating Spotify login");
    window.location.href = "/api/auth/spotify";
  };

  const handleLogout = () => {
    console.log("Logging out from Spotify");
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
          {authError && (
            <p className="text-xs text-red-500 mt-1">Last error: {authError}</p>
          )}
          <Button onClick={handleLogin}>Connect with Spotify</Button>
        </>
      )}
    </div>
  );
}
