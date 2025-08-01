import { db } from "./firebase-config.js";
import { renderCalendar } from "./calendar.js";
import { fecharModal } from "./modal.js";
import {
    doc, getDoc, setDoc, getDocs, collection
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const addEmployee = document.getElementById("addEmployee");
const selectFuncionario = document.getElementById("selectFuncionario");
const employeeInput = document.getElementById("employeeInput");
const modal = document.getElementById("employeeModal");
// const employeeList = document.getElementById("employeeList");

addEmployee.addEventListener("click", async () => {
    const nomeFuncionario = selectFuncionario.value || employeeInput.value.trim();
    if (!nomeFuncionario) return;
    const data = modal.getAttribute("data-date");
    if (!data) return;

    const docRef = doc(db, "schedules", data);
    const docSnap = await getDoc(docRef);

    let escalados = [];
    if (docSnap.exists()) {
        escalados = docSnap.data().funcionarios || [];
    }

    if (!escalados.includes(nomeFuncionario)) {
        escalados.push(nomeFuncionario);
        await setDoc(docRef, { funcionarios: escalados });
        renderCalendar();
        fecharModal();
    }
});

// async function loadUpcomingSchedules(data) {
//     const docRef = doc(db, "schedules", data);
//     const docSnap = await getDoc(docRef);
//     employeeList.innerHTML = "";
//     if (docSnap.exists()) {
//         const funcionarios = docSnap.data().funcionarios || [];
//         funcionarios.forEach(nome => {
//             const li = document.createElement("li");
//             li.textContent = nome;
//             employeeList.appendChild(li);
//         });
//     }
// }

async function loadUpcomingSchedules() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // remove horas para comparação exata

    const container = document.getElementById("upcoming-schedules");
    container.innerHTML = "";

    try {
        const snapshot = await getDocs(collection(db, "schedules"));
        const upcoming = [];

        snapshot.forEach(docSnap => {
            const docId = docSnap.id;
            if (!docId) return;

            const [year, month, day] = docId.split("-");
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            if (isNaN(date)) return;

            date.setHours(0, 0, 0, 0); // normalize

            if (date >= today) {
                const data = docSnap.data();
                upcoming.push({
                    date,
                    users: data.users || [],
                });
            }
        });

        upcoming.sort((a, b) => a.date - b.date);

        if (upcoming.length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-500">Nenhuma escala futura.</p>';
        } else {
            upcoming.slice(0, 5).forEach(schedule => {
                const div = document.createElement("div");
                const formattedDate = schedule.date.toLocaleDateString("pt-BR");
                console.log("Escala carregada:", schedule.date, schedule.users);
                const userList = schedule.users
                    .map(user => `<span style="color: ${user.color}">${user.name}</span>`)
                    .join(", ");
                div.innerHTML = `<p><strong>${formattedDate}</strong>: ${userList}</p>`;
                container.appendChild(div);
            });
        }
    } catch (err) {
        console.error("Erro ao carregar próximas escalas:", err);
        container.innerHTML = '<p class="text-sm text-red-500">Erro ao carregar escalas.</p>';
    }
}

export { loadUpcomingSchedules };