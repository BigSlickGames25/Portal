import { renderCalendar } from "../components/calendar.js";
import { escapeHtml } from "../../services/security.js";

const calendarScreen = {
  title: "Studio Calendar",
  kicker: "Milestones and Events",
  render(ctx) {
    const now = new Date();
    const monthName = now.toLocaleString("en-US", { month: "long", year: "numeric" });
    return `
      <section class="screen-grid">
        <article class="panel span-12" data-layout="calendar-board">
          <h3>${escapeHtml(monthName)} Planning Board</h3>
          <div class="calendar-grid">
            <div class="weekday">Sun</div>
            <div class="weekday">Mon</div>
            <div class="weekday">Tue</div>
            <div class="weekday">Wed</div>
            <div class="weekday">Thu</div>
            <div class="weekday">Fri</div>
            <div class="weekday">Sat</div>
            ${renderCalendar(now, ctx.data.releaseCalendar)}
          </div>
        </article>
        <article class="panel span-12" data-layout="calendar-events">
          <h3>Upcoming Events</h3>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Date</th><th>Event</th><th>Type</th></tr>
              </thead>
              <tbody>
                ${ctx.data.releaseCalendar
                  .map(
                    (event) => `
                    <tr>
                      <td>${escapeHtml(event.date)}</td>
                      <td>${escapeHtml(event.title)}</td>
                      <td>${escapeHtml(event.type)}</td>
                    </tr>
                  `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    `;
  }
};

export { calendarScreen };
