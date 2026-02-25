"use client";

import { useState, useEffect } from "react";
import { TripRouteSelector } from "./TripRouteSelector";
import type { DestinationInfo } from "@shortack/monitor-core";

type RouteState = {
  from: DestinationInfo | null;
  to: DestinationInfo | null;
};

type TripRouteSelectorContainerProps = {
  route: RouteState;
  onRouteChange: (route: RouteState) => void;
};

export function TripRouteSelectorContainer({
  route,
  onRouteChange,
}: TripRouteSelectorContainerProps) {
  const [fromOptions, setFromOptions] = useState<DestinationInfo[]>([]);
  const [toOptions, setToOptions] = useState<DestinationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/bus/from")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setFromOptions(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!route.from) {
      setToOptions([]);
      return;
    }
    fetch(
      `/api/bus/to?fromId=${route.from.id}&fromName=${encodeURIComponent(route.from.name)}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setToOptions(data);
      })
      .catch((e) => setError(e.message));
  }, [route.from?.id]);

  const onFromChange = (value: string, label: string) => {
    onRouteChange({
      from: value ? { id: value, name: label } : null,
      to: null,
    });
  };

  const onToChange = (value: string, label: string) => {
    onRouteChange({
      ...route,
      to: value ? { id: value, name: label } : null,
    });
  };

  if (loading)
    return (
      <p style={{ color: "var(--color-text-muted)" }}>Loading destinations…</p>
    );
  if (error) return <p style={{ color: "#ef4444" }}>Error: {error}</p>;

  return (
    <TripRouteSelector
      fromOptions={fromOptions}
      toOptions={toOptions}
      fromValue={route.from?.id ?? ""}
      toValue={route.to?.id ?? ""}
      fromDisabled={false}
      toDisabled={!route.from}
      onFromChange={onFromChange}
      onToChange={onToChange}
    />
  );
}
