import { renderCalendar, mudarMes } from "./calendar.js";
import { loadEmployees } from "./employees.js";
import { loadUpcomingSchedulesDay } from "./schedule.js";
import {
    collection, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { db, app } from "./firebase-config.js";


const auth = getAuth(app);

// onAuthStateChanged(auth, user => {
//     if (!user) {
//         window.location.href = "login.html";
//     } else {
//         iniciarAplicacao();
//     }
// });

onAuthStateChanged(auth, user => {
    if (user) {
        iniciarAplicacao(); // render calendar, etc.

        // Exibir seções de edição
        document.getElementById("employeeRegister")?.classList.remove("hidden");
        document.getElementById("selectFuncionario")?.classList.remove("hidden");
        document.getElementById("attributionButtons")?.classList.remove("hidden");
    } else {
        iniciarAplicacao(); // visitante também pode ver calendário

        // Garantir que edição permanece oculta
        document.getElementById("employeeRegister")?.classList.add("hidden");
        document.getElementById("selectFuncionario")?.classList.add("hidden");
        document.getElementById("attributionButtons")?.classList.add("hidden");
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
