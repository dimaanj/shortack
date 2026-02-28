export type MonitorPollJobData = {
  /** Unique key for filter set (fromId:toId:date). One job per key; multiple monitors can share it. */
  filterKey: string;
};
