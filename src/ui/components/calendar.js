import { escapeHtml } from "../../services/security.js";

function toCalendarMap(events) {
  return events.reduce((map, event) => {
    if (!map[event.date]) {
      map[event.date] = [];
    }
    map[event.date].push(event);
    return map;
  }, {});
}

function monthMatrix(referenceDate) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const start = new Date(year, month, 1);
  const firstWeekday = start.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function renderCalendar(referenceDate, events) {
  const map = toCalendarMap(events);
  const cells = monthMatrix(referenceDate);
  const todayKey = formatDateKey(new Date());

  return cells
    .map((cell) => {
      if (!cell) {
        return `<div class="day-cell empty"></div>`;
      }
      const key = formatDateKey(cell);
      const hasToday = key === todayKey;
      const eventRows = (map[key] ?? [])
        .slice(0, 2)
        .map((event) => `<div class="calendar-event">${escapeHtml(event.title)}</div>`)
        .join("");
      return `
        <div class="day-cell ${hasToday ? "today" : ""}">
          <div class="day-number">${cell.getDate()}</div>
          ${eventRows}
        </div>
      `;
    })
    .join("");
}

export { renderCalendar };
