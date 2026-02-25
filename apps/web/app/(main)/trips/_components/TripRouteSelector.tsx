"use client";

import type { DestinationInfo } from "@shortack/monitor-core";
import { SearchableSelect } from "./SearchableSelect";
import styles from "./TripRouteSelector.module.css";

export type TripRouteSelectorProps = {
  fromOptions: DestinationInfo[];
  toOptions: DestinationInfo[];
  fromValue: string;
  toValue: string;
  fromDisabled: boolean;
  toDisabled: boolean;
  onFromChange: (value: string, label: string) => void;
  onToChange: (value: string, label: string) => void;
};

export function TripRouteSelector({
  fromOptions,
  toOptions,
  fromValue,
  toValue,
  fromDisabled,
  toDisabled,
  onFromChange,
  onToChange,
}: TripRouteSelectorProps) {
  return (
    <div className={styles.root}>
      <div className={styles.field}>
        <label className={styles.label}>From</label>
        <SearchableSelect
          options={fromOptions}
          value={fromValue}
          placeholder="Select origin"
          disabled={fromDisabled}
          onChange={onFromChange}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>To</label>
        <SearchableSelect
          options={toOptions}
          value={toValue}
          placeholder="Select destination"
          disabled={toDisabled}
          onChange={onToChange}
        />
      </div>
    </div>
  );
}
