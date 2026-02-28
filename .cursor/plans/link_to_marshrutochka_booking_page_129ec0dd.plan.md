---
name: Link to Marshrutochka booking page
overview: "Практичный вариант: пуш по-прежнему ведёт в приложение на страницу монитора; на ней показываем маршрут, дату, слоты и кнопку «Перейти к бронированию на Маршруточке» — внешняя ссылка на их страницу расписания с подставленными from/to/date."
todos: []
isProject: false
---

# Ссылка на страницу бронирования Маршруточки

Текущее состояние: в пуше уже задаётся `url: /monitors/${monitorId}` ([apps/web/workers/monitor-worker.ts](shortack/apps/web/workers/monitor-worker.ts)), но маршрута `/monitors/[id]` в приложении нет — есть только список `/monitors`. Нужно добавить страницу детали монитора и на ней блок со ссылкой на сайт Маршруточки.

Формат URL расписания у перевозчика (из [apps/web/lib/bus-provider/marshrutochka.ts](shortack/apps/web/lib/bus-provider/marshrutochka.ts)):  
`{host}/schedules?station_from_id=0&station_to_id=0&frame_id=&city_from_id={from.id}&places=1&city_to_id={to.id}&date={yyyy-mm-dd}`

---

## 1. Клиентский API монитора по ID

- В [apps/web/app/(main)/entities/monitors/api.ts](shortack/apps/web/app/(main)/entities/monitors/api.ts) добавить функцию `getMonitor(id: string): Promise<MonitorRecord | null>`, вызывающую `GET /api/monitors/${id}` и возвращающую монитор или null при 404.
- В [apps/web/app/(main)/entities/monitors/model.ts](shortack/apps/web/app/(main)/entities/monitors/model.ts) (или index) добавить хук `useMonitor(id: string | null)` на базе React Query: `queryKey: ['monitors', id]`, `queryFn: () => getMonitor(id!)`, включён только при валидном `id`.

---

## 2. URL страницы расписания Маршруточки (клиент)

- Добавить модуль, пригодный для использования в браузере (без серверного кода bus-provider), например [apps/web/lib/marshrutochka-url.ts](shortack/apps/web/lib/marshrutochka-url.ts).
- Экспортировать константу базового хоста (тот же, что в `marshrutochka.ts`: `https://xn--90aiim0b.xn--80aa3agllaqi6bg.xn--90ais`) и функцию:
  - `buildScheduleUrl(params: { fromId: string; toId: string; date: string }): string`
  - Собирает query как в marshrutochka: `station_from_id=0&station_to_id=0&frame_id=&city_from_id=...&places=1&city_to_id=...&date=...`.
- Так ссылка «Перейти к бронированию» будет вести на их страницу расписания с уже выбранным маршрутом и датой; пользователь дальше бронирует на их сайте.

---

## 3. Страница детали монитора

- Создать маршрут [apps/web/app/(main)/monitors/[id]/page.tsx](shortack/apps/web/app/(main)/monitors/[id]/page.tsx): рендер контейнера с передачей `params.id`.
- Контейнер (например `MonitorDetailContainer.tsx` рядом или в `_components`):
  - Принимает `monitorId: string`.
  - Использует `useMonitor(monitorId)`: показ загрузки, 404 (монитор не найден), ошибки.
  - При успехе: заголовок с маршрутом (from → to), дата, статус (ACTIVE/STOPPED), список слотов (`prevSlots`), кнопка «Stop» для активного монитора (вызов существующего `stopMonitor` + редирект на `/monitors` или обновление статуса).
  - Блок «Перейти к бронированию»:
    - Текст вроде: «Места есть. Забронировать на сайте Маршруточки».
    - Ссылка: `buildScheduleUrl({ fromId: monitor.from.id, toId: monitor.to.id, date: monitor.date })`, атрибут `target="_blank" rel="noopener noreferrer"`.
  - Оформление: использовать существующие стили из [apps/web/app/(main)/monitors/monitors.module.css](shortack/apps/web/app/(main)/monitors/monitors.module.css) или добавить минимальные классы для заголовка и блока ссылки.

---

## 4. Переход со списка на деталь

- В [apps/web/app/(main)/monitors/MonitorsPageContainer.tsx](shortack/apps/web/app/(main)/monitors/MonitorsPageContainer.tsx) в таблице сделать переход на деталь: обернуть строку (или ячейки From/To/Date) в `<Link href={/monitors/${m.id}}>` или добавить отдельную ячейку с ссылкой «View» / «Open». Так с списка мониторов можно попасть на страницу с ссылкой на бронирование.

---

## 5. Push и конфиг

- Payload пуша не менять: `url: /monitors/${monitorId}` — по тапу пользователь откроет новую страницу детали монитора с ссылкой на Маршруточку.
- При желании позже можно завести `NEXT_PUBLIC_MARSHRUTOCHKA_URL` и подставлять в `buildScheduleUrl`, чтобы менять хост без правки кода.

---

## Итог

- Пользователь получает пуш → открывает приложение на `/monitors/:id` → видит маршрут, дату, слоты и кнопку «Перейти к бронированию на Маршруточке» → по клику открывается сайт перевозчика с подставленными маршрутом и датой. Логика бронирования и оплаты остаётся на стороне Маршруточки.
