"use client";

import { useState } from "react";
import { useToast } from "@/app/lib/use-toast";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
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
import { SpotifySong, User } from "@/app/types";

export default function SongForm() {
  const { toast } = useToast();
  const [songName, setSongName] = useState("");
  const [user, setUser] = useState<User | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    spotify: SpotifySong[];
  }>({ spotify: [] });
  const [selectedSong, setSelectedSong] = useState<SpotifySong | null>(null);

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

    setIsLoading(true);
    try {
      // Prepare song data
      const songData = {
        name: selectedSong.name,
        artist: selectedSong.artists[0].name,
        album: selectedSong.album.name,
        coverUrl: selectedSong.album.images[0].url,
        previewUrl: selectedSong.preview_url || undefined,
        addedBy: user,
        platform: "Spotify" as const,
        spotifyId: selectedSong.id,
        spotifyUrl: selectedSong.external_urls.spotify,
      };

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
      setSearchResults({ spotify: [] });
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

          {searchResults.spotify?.length > 0 && (
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
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !user || !selectedSong}
          >
            {isLoading ? "Adding..." : "Add to Timeline"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
