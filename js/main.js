import { renderCalendar, mudarMes } from "./calendar.js";
import { loadEmployees } from "./employees.js";
import { loadUpcomingSchedulesDay } from "./schedule.js";
import { db } from "./firebase-config.js";
import {
    getDocs, collection, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
<<<<<<< Updated upstream
=======
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig, db } from "./firebase-config.js";


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, user => {
    if (!user) {
        // Redireciona para login se não estiver autenticado
        window.location.href = "login.html";
    } else {
        // Usuário autenticado — carrega o calendário e funcionalidades
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
>>>>>>> Stashed changes

const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");


<<<<<<< Updated upstream
prevMonth.addEventListener("click", () => mudarMes(-1));
nextMonth.addEventListener("click", () => mudarMes(1));
=======
>>>>>>> Stashed changes

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
loadUpcomingSchedulesDay();
escutarEscalasTempoReal();