"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Clock, Music } from "lucide-react";
import { useToast } from "@/app/lib/use-toast";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { useWindowSize } from "@/app/lib/use-window-size";

type RevealCountdownProps = {
  onReveal: (newSongs: any[]) => void;
};

export default function RevealCountdown({ onReveal }: RevealCountdownProps) {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isRevealing, setIsRevealing] = useState(false);
  const [pendingSongs, setPendingSongs] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  // Calculate time until next Sunday at 12 PM
  const calculateTimeUntilNextReveal = () => {
    const now = new Date();
    const nextSunday = new Date(now);

    // Set to next Sunday at 12:00 PM
    nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7));
    nextSunday.setHours(12, 0, 0, 0);

    // If it's already past noon on Sunday, go to next week
    if (now.getDay() === 0 && now.getHours() >= 12) {
      nextSunday.setDate(nextSunday.getDate() + 7);
    }

    const diff = nextSunday.getTime() - now.getTime();

    // Convert to days, hours, minutes, seconds
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  // Check if it's reveal time (Sunday at 12 PM)
  const isRevealTime = () => {
    const now = new Date();
    return (
      now.getDay() === 0 && now.getHours() === 12 && now.getMinutes() === 0
    );
  };

  useEffect(() => {
    // Fetch pending songs count on mount
    fetchPendingSongsCount();

    // Set up timer
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeUntilNextReveal();
      setTimeLeft(newTimeLeft);

      // Check if it's time to reveal
      if (isRevealTime()) {
        handleReveal();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchPendingSongsCount = async () => {
    try {
      const response = await fetch("/api/songs/pending");
      if (!response.ok) {
        throw new Error("Failed to fetch pending songs count");
      }

      const data = await response.json();
      setPendingSongs(data.count);
    } catch (error) {
      console.error("Error fetching pending songs count:", error);
    }
  };

  const handleReveal = async () => {
    if (isRevealing || pendingSongs === 0) return;

    setIsRevealing(true);

    try {
      const response = await fetch("/api/songs/reveal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ force: process.env.NODE_ENV === "development" }),
      });

      if (!response.ok) {
        throw new Error("Failed to reveal songs");
      }

      const data = await response.json();

      if (data.success) {
        // Show confetti
        setShowConfetti(true);

        // Notify about revealed songs
        toast({
          title: "Songs Revealed!",
          description: `${data.revealedSongs.length} new songs have been added to the timeline.`,
        });

        // Call the callback to update the timeline
        onReveal(data.revealedSongs);

        // Reset pending songs count
        setPendingSongs(0);

        // Hide confetti after 5 seconds
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reveal songs. Try again later.",
        variant: "destructive",
      });
    } finally {
      setIsRevealing(false);
    }
  };

  const formatTimeUnit = (value: number) => {
    return value.toString().padStart(2, "0");
  };

  return (
    <>
      {showConfetti && (
        <Confetti width={width} height={height} recycle={false} />
      )}

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>Song Reveal Countdown</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col items-center">
                <div className="grid grid-cols-4 gap-4 mb-4 w-full max-w-md">
                  {/* Days */}
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold">
                      {formatTimeUnit(timeLeft.days)}
                    </div>
                    <div className="text-xs text-muted-foreground">Days</div>
                  </div>

                  {/* Hours */}
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold">
                      {formatTimeUnit(timeLeft.hours)}
                    </div>
                    <div className="text-xs text-muted-foreground">Hours</div>
                  </div>

                  {/* Minutes */}
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold">
                      {formatTimeUnit(timeLeft.minutes)}
                    </div>
                    <div className="text-xs text-muted-foreground">Minutes</div>
                  </div>

                  {/* Seconds */}
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold">
                      {formatTimeUnit(timeLeft.seconds)}
                    </div>
                    <div className="text-xs text-muted-foreground">Seconds</div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-muted-foreground text-center">
                    Next song reveal: Sunday at 12:00 PM
                  </p>

                  {pendingSongs > 0 && (
                    <div className="flex items-center gap-2 bg-secondary/50 rounded-full px-4 py-1">
                      <Music className="h-4 w-4" />
                      <span className="text-sm">
                        {pendingSongs} {pendingSongs === 1 ? "song" : "songs"}{" "}
                        pending
                      </span>
                    </div>
                  )}

                  {process.env.NODE_ENV === "development" && (
                    <Button
                      onClick={handleReveal}
                      disabled={isRevealing || pendingSongs === 0}
                      className="mt-2"
                    >
                      {isRevealing ? "Revealing..." : "Force Reveal (Dev Only)"}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </>
  );
}
