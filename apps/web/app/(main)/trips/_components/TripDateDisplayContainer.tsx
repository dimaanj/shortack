"use client";

import { useState, useEffect } from "react";
import { TripDateDisplay } from "./TripDateDisplay";
import { getMaxFutureDateForMonitor } from "@shortack/monitor-core";
import type { RouteState } from "../domain/types";
import { useTripSlots } from "../domain/tripQueries";

function useOnlineStatus() {
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

type TripDateDisplayContainerProps = {
  route: RouteState;
  selectedDate: string;
  onDateChange: (date: string) => void;
};

function getDateRange() {
  const today = new Date();
  const max = getMaxFutureDateForMonitor();
  const dates: string[] = [];
  const current = new Date(today);
  current.setHours(0, 0, 0, 0);
  const maxTime = max.getTime();
  while (current.getTime() <= maxTime) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function TripDateDisplayContainer({
  route,
  selectedDate,
  onDateChange,
}: TripDateDisplayContainerProps) {
  const dates = getDateRange();
  const isOnline = useOnlineStatus();
  const { slots, isLoading, error } = useTripSlots(route, selectedDate);

  const errorMessage =
    error && !isOnline
      ? "You're offline. Data will refresh when you're back online."
      : error
        ? error.message
        : null;

  if (!route.from || !route.to) {
    return (
      <p className="muted" style={{ color: "var(--color-text-muted)" }}>
        Select origin and destination to see availability
      </p>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <label
          htmlFor="trip-date"
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--color-text-muted)",
            marginBottom: "0.375rem",
          }}
        >
          Date
        </label>
        <select
          id="trip-date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          style={{
            width: "100%",
            padding: "0.625rem 0.875rem",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            color: "var(--color-text)",
            fontSize: "0.9375rem",
            cursor: "pointer",
          }}
        >
          <option value="">Select date</option>
          {dates.map((d) => (
            <option key={d} value={d}>
              {new Date(d + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </option>
          ))}
        </select>
      </div>
      {selectedDate && (
        <TripDateDisplay
          date={selectedDate}
          fromName={route.from.name}
          toName={route.to.name}
          slots={slots}
          loading={isLoading}
          error={errorMessage}
        />
      )}
    </div>
  );
}

