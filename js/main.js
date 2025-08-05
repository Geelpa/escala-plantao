import { renderCalendar, mudarMes } from "./calendar.js";
import { loadEmployees } from "./employees.js";
import { loadUpcomingSchedulesDay } from "./schedule.js";
import {
    collection, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { db, app, firebaseConfig } from "./firebase-config.js";


const auth = getAuth(app);

onAuthStateChanged(auth, user => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        iniciarAplicacao();
    }
});

function iniciarAplicacao() {
    const prevMonth = document.getElementById("prevMonth");
    const nextMonth = document.getElementById("nextMonth");

    prevMonth.addEventListener("click", () => mudarMes(-1));
    nextMonth.addEventListener("click", () => mudarMes(1));

    escutarEscalasTempoReal();
    loadEmployees();
    loadUpcomingSchedulesDay();
}

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
