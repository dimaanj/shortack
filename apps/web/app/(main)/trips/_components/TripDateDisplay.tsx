import styles from "./TripDateDisplay.module.css";

export type TripDateDisplayProps = {
  date: string;
  fromName: string;
  toName: string;
  slots: string[];
  loading?: boolean;
  error?: string | null;
};

export function TripDateDisplay({
  date,
  fromName,
  toName,
  slots,
  loading,
  error,
}: TripDateDisplayProps) {
  if (error) {
    return (
      <div className={styles.card}>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.card}>
        <p className={styles.muted}>Loading availability…</p>
      </div>
    );
  }

  const formattedDate = new Date(date + "T12:00:00").toLocaleDateString(
    "en-US",
    { weekday: "short", month: "short", day: "numeric", year: "numeric" }
  );

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Available times</h2>
      <p className={styles.route}>
        {fromName} → {toName}
      </p>
      <p className={styles.date}>{formattedDate}</p>
      {slots.length === 0 ? (
        <p className={styles.muted}>No available slots for this date</p>
      ) : (
        <ul className={styles.slotList}>
          {slots.map((slot) => (
            <li key={slot} className={styles.slot}>
              {slot}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
