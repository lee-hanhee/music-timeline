"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/app/lib/use-toast";
import { Song } from "@/app/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";

export default function Timeline() {
  const { toast } = useToast();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/songs");
      if (!response.ok) {
        throw new Error("Failed to fetch songs");
      }
      const data = await response.json();
      setSongs(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch songs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToPlaylist = async (song: Song) => {
    try {
      toast({
        title: "Adding to playlist",
        description: `Adding ${song.name} to your ${song.platform} playlist`,
      });

      // In a real app, this would call the appropriate API
      if (song.platform === "Apple Music") {
        // Call Apple Music API to add to playlist
        console.log("Adding to Apple Music playlist:", song);
      } else if (song.platform === "Spotify") {
        // Call Spotify API to add to playlist
        console.log("Adding to Spotify playlist:", song);
      }

      toast({
        title: "Success",
        description: `Added ${song.name} to your ${song.platform} playlist`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add ${song.name} to your ${song.platform} playlist`,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const getUserInitials = (name: string) => {
    return name.charAt(0);
  };

  const getUserColor = (name: string) => {
    const colors = {
      Kate: "bg-pink-500",
      Victor: "bg-blue-500",
      Hanhee: "bg-purple-500",
    };
    return colors[name as keyof typeof colors] || "bg-gray-500";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p>Loading songs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (songs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p>No songs added yet. Add your first song!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {songs.map((song) => (
              <div key={song.id} className="flex">
                <div className="mr-4">
                  <Avatar className={`${getUserColor(song.addedBy)}`}>
                    <AvatarFallback>
                      {getUserInitials(song.addedBy)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{song.addedBy}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(song.addedAt)}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {song.platform}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <img
                      src={song.coverUrl}
                      alt={song.name}
                      className="w-16 h-16 rounded-md"
                    />
                    <div>
                      <p className="font-medium">{song.name}</p>
                      <p className="text-sm">{song.artist}</p>
                      <p className="text-sm text-muted-foreground">
                        {song.album}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedSong(song);
                        setDialogOpen(true);
                      }}
                    >
                      Play
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddToPlaylist(song)}
                    >
                      Add to Playlist
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSong?.name} - {selectedSong?.artist}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {selectedSong && (
              <>
                <img
                  src={selectedSong.coverUrl}
                  alt={selectedSong.name}
                  className="w-40 h-40 rounded-md"
                />
                <div className="text-center">
                  <p className="font-medium">{selectedSong.name}</p>
                  <p className="text-sm">{selectedSong.artist}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSong.album}
                  </p>
                </div>
                {selectedSong.previewUrl ? (
                  <audio
                    controls
                    src={selectedSong.previewUrl}
                    className="w-full"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No preview available
                  </p>
                )}
                <div className="flex space-x-2 w-full">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      const url =
                        selectedSong.platform === "Apple Music"
                          ? selectedSong.appleMusicUrl
                          : selectedSong.spotifyUrl;
                      if (url) {
                        window.open(url, "_blank");
                      }
                    }}
                  >
                    Open in {selectedSong.platform}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleAddToPlaylist(selectedSong)}
                  >
                    Add to Playlist
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
