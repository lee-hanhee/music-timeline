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

// Define the date range options for better type safety and reusability
const DATE_RANGES = {
  ALL: "all",
  SEVEN_DAYS: "7days",
  THIRTY_DAYS: "30days",
  THIS_MONTH: "thisMonth",
  LAST_MONTH: "lastMonth",
};

// Map option values to display labels
const DATE_RANGE_LABELS = {
  [DATE_RANGES.ALL]: "All Time",
  [DATE_RANGES.SEVEN_DAYS]: "Last 7 Days",
  [DATE_RANGES.THIRTY_DAYS]: "Last 30 Days",
  [DATE_RANGES.THIS_MONTH]: "This Month",
  [DATE_RANGES.LAST_MONTH]: "Last Month",
};

type DateRangeFilterProps = {
  onFilterChange: (
    startDate: string | undefined,
    endDate: string | undefined
  ) => void;
};

export default function DateRangeFilter({
  onFilterChange,
}: DateRangeFilterProps) {
  // Store the selected preset in localStorage to persist across page reloads
  const [selectedPreset, setSelectedPreset] = useState<string>(() => {
    // Try to get the saved value from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedDateRange");
      return saved || DATE_RANGES.ALL;
    }
    return DATE_RANGES.ALL;
  });

  // Update localStorage when selectedPreset changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedDateRange", selectedPreset);
    }
  }, [selectedPreset]);

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    let startDate: string | undefined = undefined;
    let endDate: string | undefined = undefined;

    const today = new Date();

    switch (value) {
      case DATE_RANGES.ALL:
        // No date filtering
        break;
      case DATE_RANGES.SEVEN_DAYS:
        startDate = format(subDays(today, 7), "yyyy-MM-dd");
        endDate = format(today, "yyyy-MM-dd");
        break;
      case DATE_RANGES.THIRTY_DAYS:
        startDate = format(subDays(today, 30), "yyyy-MM-dd");
        endDate = format(today, "yyyy-MM-dd");
        break;
      case DATE_RANGES.THIS_MONTH:
        startDate = format(startOfMonth(today), "yyyy-MM-dd");
        endDate = format(today, "yyyy-MM-dd");
        break;
      case DATE_RANGES.LAST_MONTH:
        const lastMonth = subMonths(today, 1);
        startDate = format(startOfMonth(lastMonth), "yyyy-MM-dd");
        endDate = format(endOfMonth(lastMonth), "yyyy-MM-dd");
        break;
    }

    onFilterChange(startDate, endDate);
  };

  return (
    <div className="flex items-center">
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-4 w-4 opacity-50" />
        <Select
          value={selectedPreset}
          onValueChange={handlePresetChange}
          defaultValue={DATE_RANGES.ALL}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Select range">
              {
                DATE_RANGE_LABELS[
                  selectedPreset as keyof typeof DATE_RANGE_LABELS
                ]
              }
            </SelectValue>
          </SelectTrigger>
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
