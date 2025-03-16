"use client";

import { useState } from "react";
import { useToast } from "@/app/lib/use-toast";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { AppleMusicSong, SpotifySong, User } from "@/app/types";

export default function SongForm() {
  const { toast } = useToast();
  const [songName, setSongName] = useState("");
  const [user, setUser] = useState<User | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    appleMusic?: AppleMusicSong[];
    spotify?: SpotifySong[];
  }>({});
  const [selectedPlatform, setSelectedPlatform] = useState<
    "Apple Music" | "Spotify" | ""
  >("");
  const [selectedSong, setSelectedSong] = useState<
    AppleMusicSong | SpotifySong | null
  >(null);

  const handleSearch = async () => {
    if (!songName) {
      toast({
        title: "Error",
        description: "Please enter a song name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/songs/search?query=${encodeURIComponent(songName)}`
      );
      if (!response.ok) {
        throw new Error("Failed to search for songs");
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search for songs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSong) {
      toast({
        title: "Error",
        description: "Please select a song",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPlatform) {
      toast({
        title: "Error",
        description: "Please select a platform",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Prepare song data based on the platform
      let songData;
      if (selectedPlatform === "Apple Music" && "attributes" in selectedSong) {
        const appleSong = selectedSong as AppleMusicSong;
        songData = {
          name: appleSong.attributes.name,
          artist: appleSong.attributes.artistName,
          album: appleSong.attributes.albumName,
          coverUrl: appleSong.attributes.artwork.url,
          previewUrl: appleSong.attributes.previews?.[0]?.url,
          addedBy: user,
          platform: selectedPlatform,
          appleMusicId: appleSong.id,
          appleMusicUrl: appleSong.attributes.url,
        };
      } else if (selectedPlatform === "Spotify" && "artists" in selectedSong) {
        const spotifySong = selectedSong as SpotifySong;
        songData = {
          name: spotifySong.name,
          artist: spotifySong.artists[0].name,
          album: spotifySong.album.name,
          coverUrl: spotifySong.album.images[0].url,
          previewUrl: spotifySong.preview_url || undefined,
          addedBy: user,
          platform: selectedPlatform,
          spotifyId: spotifySong.id,
          spotifyUrl: spotifySong.external_urls.spotify,
        };
      } else {
        throw new Error("Invalid song or platform selection");
      }

      const response = await fetch("/api/songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(songData),
      });

      if (!response.ok) {
        throw new Error("Failed to add song");
      }

      toast({
        title: "Success",
        description: "Song added to timeline",
      });

      // Reset form
      setSongName("");
      setSelectedSong(null);
      setSearchResults({});
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add song",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a Song</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">User</Label>
            <Select
              value={user}
              onValueChange={(value) => setUser(value as User)}
            >
              <SelectTrigger id="user">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Kate">Kate</SelectItem>
                <SelectItem value="Victor">Victor</SelectItem>
                <SelectItem value="Hanhee">Hanhee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="songName">Song Name</Label>
            <div className="flex space-x-2">
              <Input
                id="songName"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                placeholder="Enter song name"
              />
              <Button
                type="button"
                onClick={handleSearch}
                disabled={isLoading || !songName}
              >
                Search
              </Button>
            </div>
          </div>

          {searchResults.appleMusic?.length || searchResults.spotify?.length ? (
            <div className="space-y-2">
              <Label>Select Platform</Label>
              <div className="flex space-x-2">
                {searchResults.appleMusic?.length ? (
                  <Button
                    type="button"
                    variant={
                      selectedPlatform === "Apple Music" ? "default" : "outline"
                    }
                    onClick={() => setSelectedPlatform("Apple Music")}
                    className="flex-1"
                  >
                    Apple Music
                  </Button>
                ) : null}
                {searchResults.spotify?.length ? (
                  <Button
                    type="button"
                    variant={
                      selectedPlatform === "Spotify" ? "default" : "outline"
                    }
                    onClick={() => setSelectedPlatform("Spotify")}
                    className="flex-1"
                  >
                    Spotify
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}

          {selectedPlatform === "Apple Music" &&
          searchResults.appleMusic?.length ? (
            <div className="space-y-2">
              <Label>Select Song</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.appleMusic.map((song) => (
                  <div
                    key={song.id}
                    className={`p-2 border rounded-md cursor-pointer ${
                      selectedSong === song ? "border-primary bg-accent" : ""
                    }`}
                    onClick={() => setSelectedSong(song)}
                  >
                    <div className="flex items-center space-x-2">
                      {song.attributes.artwork?.url && (
                        <img
                          src={song.attributes.artwork.url.replace(
                            "{w}x{h}",
                            "60x60"
                          )}
                          alt={song.attributes.name}
                          className="w-12 h-12 rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{song.attributes.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {song.attributes.artistName}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {selectedPlatform === "Spotify" && searchResults.spotify?.length ? (
            <div className="space-y-2">
              <Label>Select Song</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.spotify.map((song) => (
                  <div
                    key={song.id}
                    className={`p-2 border rounded-md cursor-pointer ${
                      selectedSong === song ? "border-primary bg-accent" : ""
                    }`}
                    onClick={() => setSelectedSong(song)}
                  >
                    <div className="flex items-center space-x-2">
                      {song.album.images[0]?.url && (
                        <img
                          src={song.album.images[0].url}
                          alt={song.name}
                          className="w-12 h-12 rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{song.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {song.artists[0].name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !user || !selectedSong || !selectedPlatform}
          >
            {isLoading ? "Adding..." : "Add to Timeline"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
