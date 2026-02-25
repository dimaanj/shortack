"use client";

import { useState, useEffect } from "react";
import { TripDateDisplay } from "./TripDateDisplay";
import type { DestinationInfo } from "@shortack/monitor-core";
import { getMaxFutureDateForMonitor } from "@shortack/monitor-core";

type RouteState = {
  from: DestinationInfo | null;
  to: DestinationInfo | null;
};

type TripDateDisplayContainerProps = {
  route: RouteState;
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

export function TripDateDisplayContainer({ route }: TripDateDisplayContainerProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dates = getDateRange();

  useEffect(() => {
    if (!route.from || !route.to || !selectedDate) {
      setSlots([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      fromId: route.from.id,
      fromName: route.from.name,
      toId: route.to.id,
      toName: route.to.name,
      date: selectedDate,
    });
    fetch(`/api/bus/slots?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setSlots(data.slots ?? []);
      })
      .catch((e) => {
        setError(e.message);
        setSlots([]);
      })
      .finally(() => setLoading(false));
  }, [route.from, route.to, selectedDate]);

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
          onChange={(e) => setSelectedDate(e.target.value)}
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
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
}
