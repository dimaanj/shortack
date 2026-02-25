import { parse, HTMLElement } from "node-html-parser";
import type { DestinationInfo } from "@shortack/monitor-core";
import { dateToString } from "@shortack/monitor-core";

const MARSHRUTOCHKA_HOST =
  "https://xn--90aiim0b.xn--80aa3agllaqi6bg.xn--90ais";

export type AvailableTimeSlot = string;

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${url}`);
  return res.text();
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${url}`);
  return res.json() as Promise<T>;
}

export async function getFromDestinations(): Promise<DestinationInfo[]> {
  const html = await fetchText(MARSHRUTOCHKA_HOST);
  const dom = parse(html);
  const selectWithCities = dom.getElementById("city_from_id");

  if (!selectWithCities) {
    throw new Error("MarshrutochkaService: No selectWithCities");
  }

  return Array.from(selectWithCities.childNodes)
    .filter(
      (node): node is HTMLElement =>
        node instanceof HTMLElement && Boolean(node.getAttribute("value"))
    )
    .map((node): DestinationInfo => ({
      id: String(node.getAttribute("value")),
      name: node.innerText.trim(),
    }));
}

export async function getToDestinations(
  from: DestinationInfo
): Promise<DestinationInfo[]> {
  const data = await fetchJson<Record<string, { id: number; name: string }>>(
    `${MARSHRUTOCHKA_HOST}/cities?city_from_id=${from.id}`
  );
  return Object.values(data).map(
    (item): DestinationInfo => ({ id: String(item.id), name: item.name })
  );
}

export async function getAvailableTimeSlots(params: {
  from: DestinationInfo;
  to: DestinationInfo;
  date: Date;
}): Promise<AvailableTimeSlot[]> {
  const { from, to, date } = params;
  const dateStr = dateToString(date);
  const url = `${MARSHRUTOCHKA_HOST}/schedules?station_from_id=0&station_to_id=0&frame_id=&city_from_id=${from.id}&places=1&city_to_id=${to.id}&date=${dateStr}`;

  const res = await fetchJson<{ html: string }>(url);
  const dom = parse(res.html);

  return [...dom.querySelectorAll(".nf-route:not(.is-disabled)")].map(
    (route) =>
      (route.querySelector(".nf-route__time") as unknown as HTMLElement)
        .innerText
  );
}

export function getMaxFutureDateForMonitor(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7);
}
