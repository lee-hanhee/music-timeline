"use client";

import { useState } from "react";
import { Song } from "@/app/types";
import { Button } from "@/app/components/ui/button";
import { useToast } from "@/app/lib/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { motion } from "framer-motion";

interface ThrowbackCardProps {
  song: Song | null;
  onClose: () => void;
  isLoading: boolean;
}

export default function ThrowbackCard({
  song,
  onClose,
  isLoading,
}: ThrowbackCardProps) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const handleAddToPlaylist = async () => {
    if (!song) return;

    setIsAdding(true);
    try {
      toast({
        title: "Opening in Spotify",
        description: `Opening ${song.name} in Spotify`,
      });

      if (song.spotifyUrl) {
        window.open(song.spotifyUrl, "_blank");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open in Spotify",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
      >
        <Card className="w-[350px] shadow-lg">
          <CardHeader>
            <CardTitle>Finding a throwback song...</CardTitle>
            <CardDescription>Looking for a blast from the past</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!song) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
      >
        <Card className="w-[350px] shadow-lg">
          <CardHeader>
            <CardTitle>No throwback songs available</CardTitle>
            <CardDescription>
              Keep adding songs to your timeline!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-4">
              No throwback songs available yet! Keep adding songs to your
              timeline.
            </p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
    >
      <Card className="w-[350px] shadow-lg">
        <CardHeader>
          <CardTitle>Throwback Song</CardTitle>
          <CardDescription>
            Added on {formatDate(song.addedAt)} by {song.addedBy}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <img
            src={song.coverUrl}
            alt={song.name}
            className="w-40 h-40 rounded-md shadow-md"
          />
          <div className="text-center">
            <h3 className="font-bold text-lg">{song.name}</h3>
            <p className="text-muted-foreground">{song.artist}</p>
            <p className="text-sm text-muted-foreground">{song.album}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={handleAddToPlaylist}
            disabled={isAdding || !song.spotifyUrl}
          >
            {isAdding ? "Opening..." : "Open in Spotify"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
