import { renderCalendar, mudarMes } from "./calendar.js";
import { loadEmployees } from "./employees.js";
import { loadUpcomingSchedules } from "./schedule.js";
import { db } from "./firebase-config.js";
import {
    getDocs, collection, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

prevMonth.addEventListener("click", () => mudarMes(-1));
nextMonth.addEventListener("click", () => mudarMes(1));

export function escutarEscalasTempoReal() {
    const ref = collection(db, "schedules");

    onSnapshot(ref, (snapshot) => {
        const scales = {};

        snapshot.forEach(doc => {
            const data = doc.id;
            const funcionarios = doc.data().funcionarios || [];
            scales[data] = funcionarios;
        });

        renderCalendar(scales);
    });
}

loadEmployees();
loadUpcomingSchedules();
escutarEscalasTempoReal();