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
import ThrowbackCard from "./ThrowbackCard";
import MemoryNoteCard from "./MemoryNoteCard";
import { Clock, MessageSquare } from "lucide-react";

export default function Timeline() {
  const { toast } = useToast();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [throwbackSong, setThrowbackSong] = useState<Song | null>(null);
  const [showThrowback, setShowThrowback] = useState(false);
  const [isLoadingThrowback, setIsLoadingThrowback] = useState(false);
  const [selectedMemorySong, setSelectedMemorySong] = useState<Song | null>(
    null
  );

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

  const fetchThrowbackSong = async () => {
    setIsLoadingThrowback(true);
    try {
      const response = await fetch("/api/throwback");
      if (!response.ok) {
        if (response.status === 404) {
          setThrowbackSong(null);
          setShowThrowback(true);
          return;
        }
        throw new Error("Failed to fetch throwback song");
      }
      const data = await response.json();
      setThrowbackSong(data);
      setShowThrowback(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch throwback song",
        variant: "destructive",
      });
    } finally {
      setIsLoadingThrowback(false);
    }
  };

  const handleMemoryNoteUpdate = (updatedSong: Song) => {
    setSongs((prevSongs) =>
      prevSongs.map((song) => (song.id === updatedSong.id ? updatedSong : song))
    );
    setSelectedMemorySong(updatedSong);
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Timeline</CardTitle>
          <Button
            onClick={fetchThrowbackSong}
            variant="outline"
            className="flex items-center gap-2"
            disabled={isLoadingThrowback}
          >
            <Clock className="h-4 w-4" />
            <span>Throwback Song</span>
          </Button>
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
                      {song.memoryNote && (
                        <div className="mt-1 p-2 bg-muted/30 rounded-md text-xs text-muted-foreground line-clamp-2">
                          <p className="whitespace-pre-wrap">
                            {song.memoryNote}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (song.spotifyUrl) {
                          window.open(song.spotifyUrl, "_blank");
                        }
                      }}
                    >
                      Open in Spotify
                    </Button>
                    <Button
                      size="sm"
                      variant={song.memoryNote ? "default" : "outline"}
                      onClick={() => setSelectedMemorySong(song)}
                      className="flex items-center gap-1"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{song.memoryNote ? "View Note" : "Add Note"}</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showThrowback && (
        <ThrowbackCard
          song={throwbackSong}
          onClose={() => setShowThrowback(false)}
          isLoading={isLoadingThrowback}
        />
      )}

      {selectedMemorySong && (
        <MemoryNoteCard
          song={selectedMemorySong}
          onClose={() => setSelectedMemorySong(null)}
          onUpdate={handleMemoryNoteUpdate}
        />
      )}

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
                <div className="flex space-x-2 w-full">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      if (selectedSong.spotifyUrl) {
                        window.open(selectedSong.spotifyUrl, "_blank");
                      }
                    }}
                  >
                    Open in Spotify
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
