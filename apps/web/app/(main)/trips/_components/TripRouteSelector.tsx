"use client";

import * as Select from "@radix-ui/react-select";
import type { DestinationInfo } from "@shortack/monitor-core";
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
        <Select.Root
          value={fromValue}
          onValueChange={(v) => {
            const opt = fromOptions.find((o) => o.id === v);
            onFromChange(v, opt?.name ?? "");
          }}
          disabled={fromDisabled}
        >
          <Select.Trigger className={styles.trigger}>
            <Select.Value placeholder="Select origin" />
            <Select.Icon className={styles.icon} />
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className={styles.content}>
              {fromOptions.map((opt) => (
                <Select.Item key={opt.id} value={opt.id} className={styles.item}>
                  <Select.ItemText>{opt.name}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>To</label>
        <Select.Root
          value={toValue}
          onValueChange={(v) => {
            const opt = toOptions.find((o) => o.id === v);
            onToChange(v, opt?.name ?? "");
          }}
          disabled={toDisabled}
        >
          <Select.Trigger className={styles.trigger}>
            <Select.Value placeholder="Select destination" />
            <Select.Icon className={styles.icon} />
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className={styles.content}>
              {toOptions.map((opt) => (
                <Select.Item key={opt.id} value={opt.id} className={styles.item}>
                  <Select.ItemText>{opt.name}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>
    </div>
  );
}
