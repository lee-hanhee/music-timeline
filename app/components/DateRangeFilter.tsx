/**
 * Date Range Filter Component
 *
 * This component provides a dropdown menu for users to select
 * different time periods to filter songs in the timeline.
 * Options include All Time, Last 7 Days, Last 30 Days, etc.
 */

"use client";

import { useState, useEffect } from "react";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

/**
 * Constants for date range options
 * These provide a consistent way to reference the different filter options
 */
// Define the date range options for better type safety and reusability
const DATE_RANGES = {
  ALL: "all", // All time (no date filtering)
  SEVEN_DAYS: "7days", // Last 7 days
  THIRTY_DAYS: "30days", // Last 30 days
  THIS_MONTH: "thisMonth", // Current month only
  LAST_MONTH: "lastMonth", // Previous month only
};

/**
 * Display labels for each date range option
 * These are the human-readable labels shown in the dropdown
 */
// Map option values to display labels
const DATE_RANGE_LABELS = {
  [DATE_RANGES.ALL]: "All Time",
  [DATE_RANGES.SEVEN_DAYS]: "Last 7 Days",
  [DATE_RANGES.THIRTY_DAYS]: "Last 30 Days",
  [DATE_RANGES.THIS_MONTH]: "This Month",
  [DATE_RANGES.LAST_MONTH]: "Last Month",
};

/**
 * Props for the DateRangeFilter component
 * @property onFilterChange - Function called when the user selects a different date range
 */
type DateRangeFilterProps = {
  onFilterChange: (
    startDate: string | undefined,
    endDate: string | undefined
  ) => void;
};

/**
 * DateRangeFilter Component
 *
 * Allows users to filter the timeline by different date ranges.
 * The selected filter persists across page reloads using localStorage.
 *
 * @param onFilterChange - Function to call when the filter changes
 */
export default function DateRangeFilter({
  onFilterChange,
}: DateRangeFilterProps) {
  // Store the selected preset in localStorage to persist across page reloads
  const [selectedPreset, setSelectedPreset] = useState<string>(() => {
    // Try to get the saved value from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedDateRange");
      return saved || DATE_RANGES.ALL; // Default to "All Time" if no saved value
    }
    return DATE_RANGES.ALL;
  });

  /**
   * Effect to save the selected filter to localStorage
   * This makes the filter choice persist even if the user reloads the page
   */
  // Update localStorage when selectedPreset changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedDateRange", selectedPreset);
    }
  }, [selectedPreset]);

  /**
   * Handle date range selection change
   * Calculates actual date ranges based on the preset selected
   *
   * @param value - The date range preset identifier
   */
  const handlePresetChange = (value: string) => {
    // Update the selected preset state
    setSelectedPreset(value);

    // Initialize dates as undefined (used for "All Time")
    let startDate: string | undefined = undefined;
    let endDate: string | undefined = undefined;

    // Get the current date for calculations
    const today = new Date();

    // Calculate the appropriate date range based on selection
    switch (value) {
      case DATE_RANGES.ALL:
        // No date filtering - leave both dates undefined
        break;
      case DATE_RANGES.SEVEN_DAYS:
        // Last 7 days - from 7 days ago until today
        startDate = format(subDays(today, 7), "yyyy-MM-dd");
        endDate = format(today, "yyyy-MM-dd");
        break;
      case DATE_RANGES.THIRTY_DAYS:
        // Last 30 days - from 30 days ago until today
        startDate = format(subDays(today, 30), "yyyy-MM-dd");
        endDate = format(today, "yyyy-MM-dd");
        break;
      case DATE_RANGES.THIS_MONTH:
        // This month - from the first day of current month until today
        startDate = format(startOfMonth(today), "yyyy-MM-dd");
        endDate = format(today, "yyyy-MM-dd");
        break;
      case DATE_RANGES.LAST_MONTH:
        // Last month - the entire previous month
        const lastMonth = subMonths(today, 1);
        startDate = format(startOfMonth(lastMonth), "yyyy-MM-dd");
        endDate = format(endOfMonth(lastMonth), "yyyy-MM-dd");
        break;
    }

    // Notify parent component about the new date range
    onFilterChange(startDate, endDate);
  };

  /**
   * Render the date range filter dropdown
   */
  return (
    <div className="flex items-center">
      <div className="flex items-center gap-2">
        {/* Calendar icon for visual indication */}
        <CalendarIcon className="h-4 w-4 opacity-50" />

        {/* Dropdown select menu */}
        <Select
          value={selectedPreset}
          onValueChange={handlePresetChange}
          defaultValue={DATE_RANGES.ALL}
        >
          {/* Trigger button for the dropdown */}
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Select range">
              {
                DATE_RANGE_LABELS[
                  selectedPreset as keyof typeof DATE_RANGE_LABELS
                ]
              }
            </SelectValue>
          </SelectTrigger>

          {/* Dropdown content with all the options */}
          <SelectContent>
            <SelectItem value={DATE_RANGES.ALL}>
              {DATE_RANGE_LABELS[DATE_RANGES.ALL]}
            </SelectItem>
            <SelectItem value={DATE_RANGES.SEVEN_DAYS}>
              {DATE_RANGE_LABELS[DATE_RANGES.SEVEN_DAYS]}
            </SelectItem>
            <SelectItem value={DATE_RANGES.THIRTY_DAYS}>
              {DATE_RANGE_LABELS[DATE_RANGES.THIRTY_DAYS]}
            </SelectItem>
            <SelectItem value={DATE_RANGES.THIS_MONTH}>
              {DATE_RANGE_LABELS[DATE_RANGES.THIS_MONTH]}
            </SelectItem>
            <SelectItem value={DATE_RANGES.LAST_MONTH}>
              {DATE_RANGE_LABELS[DATE_RANGES.LAST_MONTH]}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
