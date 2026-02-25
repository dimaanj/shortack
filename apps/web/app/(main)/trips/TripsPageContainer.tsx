"use client";

import { useState } from "react";
import { TripRouteSelectorContainer } from "./_components/TripRouteSelectorContainer";
import { TripDateDisplayContainer } from "./_components/TripDateDisplayContainer";
import type { DestinationInfo } from "@shortack/monitor-core";
import styles from "./trips.module.css";

export function TripsPageContainer() {
  const [route, setRoute] = useState<{
    from: DestinationInfo | null;
    to: DestinationInfo | null;
  }>({ from: null, to: null });

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
      <TripDateDisplayContainer route={route} />
    </div>
  );
}
