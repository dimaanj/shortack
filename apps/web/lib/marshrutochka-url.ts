/**
 * Client-safe URL builder for Marshrutochka schedule/booking page.
 * Same base and query shape as apps/web/lib/bus-provider/marshrutochka.ts.
 */

export const MARSHRUTOCHKA_HOST =
  process.env.NEXT_PUBLIC_MARSHRUTOCHKA_URL ||
  "https://xn--90aiim0b.xn--80aa3agllaqi6bg.xn--90ais";

export function buildScheduleUrl(params: {
  fromId: string;
  toId: string;
  date: string;
}): string {
  const { fromId, toId, date } = params;
  const search = new URLSearchParams({
    station_from_id: "0",
    station_to_id: "0",
    frame_id: "",
    city_from_id: fromId,
    places: "1",
    city_to_id: toId,
    date,
  });
  return `${MARSHRUTOCHKA_HOST}/schedules?${search.toString()}`;
}
