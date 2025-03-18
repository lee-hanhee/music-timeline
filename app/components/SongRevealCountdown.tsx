/**
 * Song Reveal Countdown Component
 *
 * This component displays a countdown timer for the next song reveal.
 * Songs are revealed every Sunday at 12 PM, and this countdown tracks the time until then.
 * When songs are revealed, it shows a confetti animation and notifies the user.
 */

import React, { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { useToast } from "@/app/lib/use-toast";
import confetti from "canvas-confetti"; // Library for creating confetti animations
import { Clock } from "lucide-react"; // Icon component

/**
 * Props for the SongRevealCountdown component
 * @property onSongsRevealed - Function to call when songs are revealed (to refresh the timeline)
 */
type CountdownProps = {
  onSongsRevealed: () => void;
};

export default function SongRevealCountdown({
  onSongsRevealed,
}: CountdownProps) {
  const { toast } = useToast(); // Hook for showing toast notifications

  // State variables to track countdown information
  const [nextReveal, setNextReveal] = useState<string | null>(null); // Next reveal date/time as ISO string
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null); // Time remaining until next reveal
  const [pendingCount, setPendingCount] = useState(0); // Number of songs waiting to be revealed
  const [isLoading, setIsLoading] = useState(true); // Loading state while fetching data

  /**
   * Fetches information about the next reveal time and pending songs
   * Makes a request to the /api/songs/reveal endpoint
   */
  const fetchRevealInfo = async () => {
    try {
      // Fetch the next reveal time from the API
      const response = await fetch("/api/songs/reveal");
      if (!response.ok) {
        throw new Error("Failed to fetch next reveal time");
      }

      // Parse the response and update state
      const data = await response.json();
      setNextReveal(data.nextReveal); // Set the next reveal time
      setPendingCount(data.pendingRevealCount || 0); // Set the number of pending songs
    } catch (error) {
      // Handle errors if the API request fails
      console.error("Error fetching reveal info:", error);
      toast({
        title: "Error",
        description: "Failed to load countdown information",
        variant: "destructive",
      });
    } finally {
      // Mark loading as complete
      setIsLoading(false);
    }
  };

  /**
   * Fetches only the pending songs count
   * Used for periodic updates without fetching all reveal info
   */
  const fetchPendingCount = async () => {
    try {
      // Fetch just the pending songs count
      const response = await fetch("/api/songs/pending");
      if (!response.ok) {
        throw new Error("Failed to fetch pending songs count");
      }

      // Update the pending count state
      const data = await response.json();
      setPendingCount(data.count || 0);
    } catch (error) {
      console.error("Error fetching pending count:", error);
    }
  };

  /**
   * Effect to manage the countdown timer
   * Updates every second and triggers reveal effects when time hits zero
   */
  useEffect(() => {
    // Don't start the countdown if we don't have a next reveal time yet
    if (!nextReveal) return;

    /**
     * Calculates the time remaining until the next reveal
     * Returns an object with days, hours, minutes, and seconds
     */
    const calculateTimeRemaining = () => {
      const now = new Date(); // Current time
      const revealDate = new Date(nextReveal); // Time when songs will be revealed
      const difference = revealDate.getTime() - now.getTime(); // Difference in milliseconds

      // If the time has passed (countdown reached zero)
      if (difference <= 0) {
        // Only show confetti if there are pending songs
        if (pendingCount > 0) {
          // Celebrate with confetti animation
          triggerConfetti();

          // Tell the parent component to refresh the song list
          onSongsRevealed();

          // Get the next reveal time and updated pending count
          fetchRevealInfo();
        }

        // Return all zeros for the countdown display
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      // Calculate the individual time units from milliseconds
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      return { days, hours, minutes, seconds };
    };

    // Calculate the time remaining initially
    setTimeRemaining(calculateTimeRemaining());

    // Update the countdown every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [nextReveal, pendingCount, onSongsRevealed]);

  /**
   * Effect to fetch initial data and set up periodic updates
   * Runs once when the component mounts
   */
  useEffect(() => {
    // Fetch reveal info when component loads
    fetchRevealInfo();

    // Set up interval to refresh pending count every minute
    const intervalId = setInterval(() => {
      fetchPendingCount();
    }, 60000); // Every minute

    // Clean up interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);

  /**
   * Creates a confetti animation effect when songs are revealed
   * Also shows a toast notification
   */
  const triggerConfetti = () => {
    const duration = 3 * 1000; // Animation duration in milliseconds (3 seconds)
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    /**
     * Helper function to generate random numbers within a range
     * Used to randomize confetti positions
     */
    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    // Create confetti particles at intervals
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      // Stop when animation duration is complete
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      // Reduce particle count as animation progresses
      const particleCount = 50 * (timeLeft / duration);

      // Create confetti from the left side of the screen
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });

      // Create confetti from the right side of the screen
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    // Show a toast notification about the newly revealed songs
    toast({
      title: "🎉 New Songs Revealed!",
      description: `${pendingCount} new song${
        pendingCount !== 1 ? "s" : ""
      } added to the timeline`,
    });
  };

  // Show loading state while fetching data
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

  // Don't show the countdown if there are no pending songs
  if (pendingCount === 0) {
    return null;
  }

  // Render the countdown timer
  return (
    <Card className="bg-muted/50 border-dashed">
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center space-y-2">
          {/* Heading with clock icon */}
          <div className="flex items-center mb-1">
            <Clock className="mr-2 h-4 w-4" />
            <h3 className="font-medium">Next Song Reveal</h3>
          </div>

          {/* Countdown timer display */}
          {timeRemaining && (
            <div className="grid grid-flow-col gap-2 text-center auto-cols-max">
              {/* Days */}
              <div className="flex flex-col">
                <span className="font-bold text-lg">{timeRemaining.days}</span>
                <span className="text-xs">days</span>
              </div>
              {/* Hours */}
              <div className="flex flex-col">
                <span className="font-bold text-lg">{timeRemaining.hours}</span>
                <span className="text-xs">hours</span>
              </div>
              {/* Minutes */}
              <div className="flex flex-col">
                <span className="font-bold text-lg">
                  {timeRemaining.minutes}
                </span>
                <span className="text-xs">min</span>
              </div>
              {/* Seconds */}
              <div className="flex flex-col">
                <span className="font-bold text-lg">
                  {timeRemaining.seconds}
                </span>
                <span className="text-xs">sec</span>
              </div>
            </div>
          )}

          {/* Information about pending songs */}
          <p className="text-sm mt-2">
            {pendingCount} song{pendingCount !== 1 ? "s" : ""} waiting to be
            revealed
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
