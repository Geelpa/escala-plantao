import { renderCalendar, mudarMes } from "./calendar.js";
import { loadEmployees } from "./employees.js";
import { loadUpcomingSchedulesDay } from "./schedule.js";
import {
    collection, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { db, app } from "./firebase-config.js";


const auth = getAuth(app);

onAuthStateChanged(auth, user => {
    if (user) {

        // Mostra botão "Sair"
        authButton.textContent = "Sair";
        authButton.onclick = async () => {
            await signOut(auth);
        };
        // Exibir seções de edição
        document.getElementById("employeeRegister")?.classList.remove("hidden");
        document.getElementById("selectFuncionario")?.classList.remove("hidden");
        document.getElementById("attributionButtons")?.classList.remove("hidden");
        document.getElementById("addEmployee")?.classList.remove("hidden");
    } else {
        // Mostra botão "Entrar"
        authButton.textContent = "Entrar";
        authButton.onclick = () => {
            window.location.href = "login.html";
        };

        // Garantir que edição permanece oculta
        document.getElementById("addEmployee")?.classList.add("hidden");
        document.getElementById("employeeRegister")?.classList.add("hidden");
        document.getElementById("selectFuncionario")?.classList.add("hidden");
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
iniciarAplicacao(); // render calendar, etc.
