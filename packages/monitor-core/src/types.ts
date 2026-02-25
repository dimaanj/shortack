export type DestinationInfo = {
  id: string;
  name: string;
};

export type BusProvider = "MARSHRUTOCHKA";

/** Time slot string, e.g. "12:45" */
export type AvailableTimeSlot = string;

export type MonitorData = {
  userId: string;
  busProvider: BusProvider;
  from: DestinationInfo;
  to: DestinationInfo;
  date: string;
};

export type MonitorStatus = "ACTIVE" | "STOPPED";

/** Stored monitor document (e.g. Firestore) */
export type MonitorRecord = MonitorData & {
  id: string;
  status: MonitorStatus;
  prevSlots: AvailableTimeSlot[];
  createdAt: string; // ISO
};

export type SlotDiff = {
  added: AvailableTimeSlot[];
  removed: AvailableTimeSlot[];
};
