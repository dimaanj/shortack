/**
 * Public API of the monitors entity (FSD).
 * Other slices should import only from this file.
 */

export { useCreateMonitor, useMonitors, useStopMonitor } from "./model";
export type { CreateMonitorInput, CreateMonitorResponse } from "./api";
