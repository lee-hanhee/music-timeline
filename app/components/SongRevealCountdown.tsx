import React, { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { useToast } from "@/app/lib/use-toast";
import confetti from "canvas-confetti";
import { Clock } from "lucide-react";

type CountdownProps = {
  onSongsRevealed: () => void;
};

export default function SongRevealCountdown({
  onSongsRevealed,
}: CountdownProps) {
  const { toast } = useToast();
  const [nextReveal, setNextReveal] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch next reveal time and pending count
  const fetchRevealInfo = async () => {
    try {
      const response = await fetch("/api/songs/reveal");
      if (!response.ok) {
        throw new Error("Failed to fetch next reveal time");
      }
      const data = await response.json();
      setNextReveal(data.nextReveal);
      setPendingCount(data.pendingRevealCount || 0);
    } catch (error) {
      console.error("Error fetching reveal info:", error);
      toast({
        title: "Error",
        description: "Failed to load countdown information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch pending songs count
  const fetchPendingCount = async () => {
    try {
      const response = await fetch("/api/songs/pending");
      if (!response.ok) {
        throw new Error("Failed to fetch pending songs count");
      }
      const data = await response.json();
      setPendingCount(data.count || 0);
    } catch (error) {
      console.error("Error fetching pending count:", error);
    }
  };

  // Update countdown timer
  useEffect(() => {
    if (!nextReveal) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const revealDate = new Date(nextReveal);
      const difference = revealDate.getTime() - now.getTime();

      // If the time has passed, trigger reveal effect
      if (difference <= 0) {
        // Only show confetti if there are pending songs
        if (pendingCount > 0) {
          triggerConfetti();
          // Call the callback to refresh songs
          onSongsRevealed();
          // Refetch pending count and next reveal time
          fetchRevealInfo();
        }
        // Return all zeros for the countdown
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      // Calculate time units
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      return { days, hours, minutes, seconds };
    };

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Set up interval for countdown
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    // Clean up interval
    return () => clearInterval(interval);
  }, [nextReveal, pendingCount, onSongsRevealed]);

  // Initial fetch of reveal info and set up periodic fetches
  useEffect(() => {
    fetchRevealInfo();

    // Refetch pending count every minute
    const intervalId = setInterval(() => {
      fetchPendingCount();
    }, 60000); // Every minute

    return () => clearInterval(intervalId);
  }, []);

  // Function to trigger confetti animation
  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Since particles fall down, start from the top
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    // Show a toast notification
    toast({
      title: "🎉 New Songs Revealed!",
      description: `${pendingCount} new song${
        pendingCount !== 1 ? "s" : ""
      } added to the timeline`,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-20">
            <p>Loading countdown...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no songs are pending, don't show the countdown
  if (pendingCount === 0) {
    return null;
  }

  return (
    <Card className="bg-muted/50 border-dashed">
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center mb-1">
            <Clock className="mr-2 h-4 w-4" />
            <h3 className="font-medium">Next Song Reveal</h3>
          </div>

          {timeRemaining && (
            <div className="grid grid-flow-col gap-2 text-center auto-cols-max">
              <div className="flex flex-col">
                <span className="font-bold text-lg">{timeRemaining.days}</span>
                <span className="text-xs">days</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg">{timeRemaining.hours}</span>
                <span className="text-xs">hours</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg">
                  {timeRemaining.minutes}
                </span>
                <span className="text-xs">min</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg">
                  {timeRemaining.seconds}
                </span>
                <span className="text-xs">sec</span>
              </div>
            </div>
          )}

          <p className="text-sm mt-2">
            {pendingCount} song{pendingCount !== 1 ? "s" : ""} waiting to be
            revealed
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
