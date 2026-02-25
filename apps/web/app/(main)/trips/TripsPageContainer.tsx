"use client";

import { useState } from "react";
import { TripRouteSelectorContainer } from "./_components/TripRouteSelectorContainer";
import { TripDateDisplayContainer } from "./_components/TripDateDisplayContainer";
import { PushSubscribe } from "./_components/PushSubscribe";
import { StartMonitorBlock } from "./_components/StartMonitorBlock";
import type { DestinationInfo } from "@shortack/monitor-core";
import styles from "./trips.module.css";

export function TripsPageContainer() {
  const [route, setRoute] = useState<{
    from: DestinationInfo | null;
    to: DestinationInfo | null;
  }>({ from: null, to: null });
  const [selectedDate, setSelectedDate] = useState<string>("");

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Check trip availability</h1>
      <p className={styles.subtitle}>
        Select your route and date to see available departure times
      </p>
      <TripRouteSelectorContainer
        route={route}
        onRouteChange={setRoute}
      />
      <TripDateDisplayContainer
        route={route}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      {route.from && route.to && selectedDate && (
        <StartMonitorBlock
          from={route.from}
          to={route.to}
          date={selectedDate}
          defaultUserId="dev"
        />
      )}
      <PushSubscribe defaultUserId="dev" />
    </div>
  );
}
