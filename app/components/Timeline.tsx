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
import DateRangeFilter from "./DateRangeFilter";
import SongRevealCountdown from "./SongRevealCountdown";
import { Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";

export default function Timeline() {
  const { toast } = useToast();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [throwbackSong, setThrowbackSong] = useState<Song | null>(null);
  const [showThrowback, setShowThrowback] = useState(false);
  const [isLoadingThrowback, setIsLoadingThrowback] = useState(false);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [revealTriggered, setRevealTriggered] = useState(false);

  useEffect(() => {
    fetchSongs();
  }, [startDate, endDate, revealTriggered]);

  // Load saved date range from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRange = localStorage.getItem("selectedDateRange");
      if (savedRange) {
        // Apply the saved date range filter
        const today = new Date();
        let newStartDate: string | undefined = undefined;
        let newEndDate: string | undefined = undefined;

        switch (savedRange) {
          case "7days":
            newStartDate = format(subDays(today, 7), "yyyy-MM-dd");
            newEndDate = format(today, "yyyy-MM-dd");
            break;
          case "30days":
            newStartDate = format(subDays(today, 30), "yyyy-MM-dd");
            newEndDate = format(today, "yyyy-MM-dd");
            break;
          case "thisMonth":
            newStartDate = format(startOfMonth(today), "yyyy-MM-dd");
            newEndDate = format(today, "yyyy-MM-dd");
            break;
          case "lastMonth":
            const lastMonth = subMonths(today, 1);
            newStartDate = format(startOfMonth(lastMonth), "yyyy-MM-dd");
            newEndDate = format(endOfMonth(lastMonth), "yyyy-MM-dd");
            break;
          // "all" or any other value doesn't need date filtering
        }

        setStartDate(newStartDate);
        setEndDate(newEndDate);
      }
    }
  }, []);

  const fetchSongs = async () => {
    setIsLoading(true);
    try {
      // Build URL with query parameters
      let url = "/api/songs";
      const params = new URLSearchParams();

      if (startDate) {
        params.append("startDate", startDate);
      }

      if (endDate) {
        params.append("endDate", endDate);
      }

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch songs");
      }

      const data = await response.json();

      // Use Framer Motion for smooth transitions
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

  const handleDateRangeChange = (
    newStartDate: string | undefined,
    newEndDate: string | undefined
  ) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handleSongsRevealed = () => {
    // Trigger a refetch of songs when songs are revealed
    setRevealTriggered(prev => !prev);
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

  const getUserProfilePicture = (name: string) => {
    const profilePictures = {
      Kate: "/kate.jpg",
      Victor: "/victor.jpg",
      Hanhee: "/hanhee.jpg",
    };
    return profilePictures[name as keyof typeof profilePictures];
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

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
          <CardTitle>Timeline</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <DateRangeFilter onFilterChange={handleDateRangeChange} />
            <Button
              onClick={fetchThrowbackSong}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isLoadingThrowback}
            >
              <Clock className="h-4 w-4" />
              <span>Throwback Song</span>
            </Button>
          </div>
        </CardHeader>
        
        {/* Song Reveal Countdown */}
        <div className="px-6 pb-2">
          <SongRevealCountdown onSongsRevealed={handleSongsRevealed} />
        </div>
        
        <CardContent>
          {songs.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p>No songs found for the selected time period.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {songs.map((song) => (
                  <motion.div
                    key={song.id}
                    className="flex"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    layout
                  >
                    <div className="mr-4">
                      <Avatar className={`${getUserColor(song.addedBy)}`}>
                        <AvatarImage
                          src={getUserProfilePicture(song.addedBy)}
                          alt={song.addedBy}
                          loading="lazy"
                        />
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
                          variant="outline"
                          onClick={() => {
                            if (song.spotifyUrl) {
                              window.open(song.spotifyUrl, "_blank");
                            }
                          }}
                        >
                          Open in Spotify
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>

      {showThrowback && (
        <ThrowbackCard
          song={throwbackSong}
          onClose={() => setShowThrowback(false)}
          isLoading={isLoadingThrowback}
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
