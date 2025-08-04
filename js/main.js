import { renderCalendar, mudarMes } from "./calendar.js";
import { loadEmployees } from "./employees.js";
import { loadUpcomingSchedules } from "./schedule.js";


const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

prevMonth.addEventListener("click", () => mudarMes(-1));
nextMonth.addEventListener("click", () => mudarMes(1));

// window.addEventListener("DOMContentLoaded", () => {

// });

loadEmployees();
loadUpcomingSchedules();
renderCalendar();