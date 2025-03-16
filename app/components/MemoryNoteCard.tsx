"use client";

import { useState } from "react";
import { Song } from "@/app/types";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { useToast } from "@/app/lib/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { Pencil, Save, Trash2 } from "lucide-react";

interface MemoryNoteCardProps {
  song: Song;
  onClose: () => void;
  onUpdate: (updatedSong: Song) => void;
}

export default function MemoryNoteCard({
  song,
  onClose,
  onUpdate,
}: MemoryNoteCardProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [memoryNote, setMemoryNote] = useState(song.memoryNote || "");

  const MAX_NOTE_LENGTH = 200;

  const handleSave = async () => {
    if (memoryNote.length > MAX_NOTE_LENGTH) {
      toast({
        title: "Error",
        description: `Memory note must be ${MAX_NOTE_LENGTH} characters or less`,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/songs/memory-note", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          songId: song.id,
          memoryNote: memoryNote.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update memory note");
      }

      const updatedSong = await response.json();
      onUpdate(updatedSong);
      setIsEditing(false);

      toast({
        title: "Success",
        description: memoryNote.trim()
          ? "Memory note updated"
          : "Memory note removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update memory note",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50 p-4"
      >
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Memory Note</span>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit note</span>
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              {song.name} by {song.artist}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Edit your memory note
                  </span>
                  <span
                    className={`text-xs ${
                      memoryNote.length > MAX_NOTE_LENGTH
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {memoryNote.length}/{MAX_NOTE_LENGTH}
                  </span>
                </div>
                <Textarea
                  value={memoryNote}
                  onChange={(e) => setMemoryNote(e.target.value)}
                  placeholder="Add a personal memory or note about this song..."
                  className="min-h-[120px] resize-y"
                />
              </div>
            ) : (
              <div className="min-h-[120px] p-3 border rounded-md bg-muted/30">
                {song.memoryNote ? (
                  <p className="whitespace-pre-wrap">{song.memoryNote}</p>
                ) : (
                  <p className="text-muted-foreground italic">
                    No memory note added yet. Click the edit button to add one.
                  </p>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMemoryNote(song.memoryNote || "");
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <div className="flex space-x-2">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setIsDeleting(true)}
                    disabled={isSaving || !song.memoryNote}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete note</span>
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || memoryNote.length > MAX_NOTE_LENGTH}
                  >
                    {isSaving ? "Saving..." : "Save"}
                    <Save className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Button onClick={onClose} className="ml-auto">
                Close
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Memory Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this memory note? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setMemoryNote("");
                setIsDeleting(false);
                handleSave();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
