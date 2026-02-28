import type { DestinationInfo } from "@shortack/monitor-core";

export type RouteState = {
  from: DestinationInfo | null;
  to: DestinationInfo | null;
};

