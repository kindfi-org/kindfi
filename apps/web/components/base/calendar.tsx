"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { cn } from "~/lib/utils";

interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  disabled?: (date: Date) => boolean;
  mode?: "single";
}

/**
 * A Calendar component that displays a monthly view starting at 18 years ago. Allows the user to select a date.
 * It initializes the calendar view to a date corresponding to 18 years prior to today and enforces that selected
 * dates cannot be after that threshold. This date range is a specification for document processing, currently not configurable.
 *
 * The component populates the calendar view with days from the previous, current, and next months to ensure a full
 * grid display. Navigation buttons are provided to traverse months, but navigation to future months beyond the limit
 * is restricted. Each day cell is interactive, invoking a callback when a valid selection is made, unless the day
 * is disabled by either being after the allowed date or by a custom disabled function.
 * @component
 * @example
 * <Calendar
 *  selected={new Date()}
 *  onSelect={(date) => console.log(date)}
 *  disabled={(date) => date.getDay() === 0}
 * />
 */
export function Calendar({
  selected,
  onSelect,
  className,
  disabled,
  mode = "single",
}: CalendarProps) {
  // Calculate 18 years ago from today
  const today = new Date();
  const eighteenYearsAgo = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  );

  // Start the calendar view at 18 years ago
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [currentDate, setCurrentDate] = React.useState(eighteenYearsAgo);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();
  const lastDayOfPrevMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0,
  ).getDate();

  const weeks: {
    id: string;
    days: {
      value: number | null;
      isPrevMonth: boolean;
      isNextMonth: boolean;
    }[];
  }[] = [];
  let currentWeek: {
    value: number | null;
    isPrevMonth: boolean;
    isNextMonth: boolean;
  }[] = [];
  let currentDay = 1;

  // Previous month days
  for (let i = 0; i < firstDayOfMonth; i++) {
    currentWeek.push({
      value: lastDayOfPrevMonth - firstDayOfMonth + i + 1,
      isPrevMonth: true,
      isNextMonth: false,
    });
  }

  // Current month days
  while (currentDay <= daysInMonth) {
    if (currentWeek.length === 7) {
      weeks.push({
        id: `${currentDate.getFullYear()}-${currentDate.getMonth()}-week-${Math.ceil(
          currentDay / 7,
        )}`,
        days: currentWeek,
      });
      currentWeek = [];
    }
    currentWeek.push({
      value: currentDay,
      isPrevMonth: false,
      isNextMonth: false,
    });
    currentDay++;
  }

  // Next month days
  while (currentWeek.length < 7) {
    currentWeek.push({
      value: currentDay - daysInMonth,
      isPrevMonth: false,
      isNextMonth: true,
    });
    currentDay++;
  }
  weeks.push({
    id: `${currentDate.getFullYear()}-${currentDate.getMonth()}-week-${Math.ceil(
      currentDay / 7,
    )}`,
    days: currentWeek,
  });

  // Fill remaining weeks if needed
  let weekCounter = weeks.length;
  while (weeks.length < 6) {
    const nextWeek = [];
    for (let i = 0; i < 7; i++) {
      nextWeek.push({
        value: currentDay - daysInMonth,
        isPrevMonth: false,
        isNextMonth: true,
      });
      currentDay++;
    }
    weeks.push({
      id: `${currentDate.getFullYear()}-${currentDate.getMonth()}-week-${
        weekCounter + 1
      }`,
      days: nextWeek,
    });
    weekCounter++;
  }

  const handleDateClick = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );

    // Check if the date is not after 18 years ago
    if (newDate > eighteenYearsAgo) return;

    if (disabled?.(newDate)) return;
    onSelect?.(newDate);
  };

  const isSelectedDate = (date: Date) => {
    if (!selected) return false;
    return (
      date.getFullYear() === selected.getFullYear() &&
      date.getMonth() === selected.getMonth() &&
      date.getDate() === selected.getDate()
    );
  };

  const isDateDisabled = (date: Date) => {
    return date > eighteenYearsAgo || disabled?.(date);
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className={cn("p-3", className)}>
      <div className="space-y-4">
        <div className="relative flex items-center justify-center pt-1">
          <button
            onClick={() =>
              setCurrentDate(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() - 1,
                  1,
                ),
              )
            }
            className="absolute left-1 h-7 w-7 bg-transparent p-0 opacity-75 hover:opacity-100 transition-opacity"
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-sm font-medium">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
          <button
            onClick={() =>
              setCurrentDate(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() + 1,
                  1,
                ),
              )
            }
            className="absolute right-1 h-7 w-7 bg-transparent p-0 opacity-75 hover:opacity-100 transition-opacity"
            type="button"
            // Disable next button if next month would be after 18 years ago
            disabled={
              new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1,
                1,
              ) > eighteenYearsAgo
            }
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div>
          <div className="flex mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="w-9 text-center text-[0.8rem] text-muted-foreground font-normal"
              >
                {day}
              </div>
            ))}
          </div>
          {weeks.map((week) => (
            <div key={week.id} className="flex mt-2">
              {week.days.map((dayObj, dayIndex) => {
                const day = dayObj.value;
                const isCurrentMonth =
                  !dayObj.isPrevMonth && !dayObj.isNextMonth;
                const date = new Date(
                  currentDate.getFullYear(),
                  dayObj.isPrevMonth
                    ? currentDate.getMonth() - 1
                    : dayObj.isNextMonth
                      ? currentDate.getMonth() + 1
                      : currentDate.getMonth(),
                  day || 1,
                );
                const isDisabled = isDateDisabled(date);
                const isSelected = isSelectedDate(date);
                const dayKey = `${date.getFullYear()}-${date.getMonth()}-${day}`;

                return (
                  <button
                    key={dayKey}
                    onClick={() => handleDateClick(day || 1, isCurrentMonth)}
                    disabled={isDisabled}
                    type="button"
                    className={cn(
                      "h-9 w-9 p-0 font-normal text-center text-sm focus:outline-none rounded-md",
                      isSelected &&
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                      !isSelected && "hover:bg-accent",
                      !isCurrentMonth && "text-muted-foreground opacity-50",
                      isDisabled &&
                        "text-muted-foreground opacity-50 cursor-not-allowed",
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
