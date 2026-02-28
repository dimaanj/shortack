"use client";

import { TripRouteSelector } from "./TripRouteSelector";
import type { RouteState } from "../domain/types";
import { useTripRoutes } from "../domain/tripQueries";

type TripRouteSelectorContainerProps = {
  route: RouteState;
  onRouteChange: (route: RouteState) => void;
};

export function TripRouteSelectorContainer({
  route,
  onRouteChange,
}: TripRouteSelectorContainerProps) {
  const { fromOptions, toOptions, isLoading, error } = useTripRoutes(route);

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

  if (isLoading) {
    return (
      <p style={{ color: "var(--color-text-muted)" }}>Loading destinations…</p>
    );
  }

  if (error) {
    return <p style={{ color: "#ef4444" }}>Error: {error.message}</p>;
  }

  return (
    <TripRouteSelector
      fromOptions={fromOptions ?? []}
      toOptions={toOptions ?? []}
      fromValue={route.from?.id ?? ""}
      toValue={route.to?.id ?? ""}
      fromDisabled={false}
      toDisabled={!route.from}
      onFromChange={onFromChange}
      onToChange={onToChange}
    />
  );
}

