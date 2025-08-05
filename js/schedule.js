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

    // Verifica se já foi atribuído
    if (!escalados.some(emp => emp.name === nomeFuncionario)) {
        // Busca a cor do funcionário na coleção 'employees'
        const snapshot = await getDocs(collection(db, "employees"));
        let corFuncionario = "#9ca3af"; // cinza padrão

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.nome === nomeFuncionario) {
                corFuncionario = data.cor || corFuncionario;
            }
        });

        // Salva como objeto com nome + cor
        escalados.push({ name: nomeFuncionario, color: corFuncionario });

        await setDoc(docRef, { funcionarios: escalados });
        fecharModal();
    }
});

async function loadUpcomingSchedules() {
    const today = new Date();
    const container = document.getElementById("upcoming-schedules");
    container.innerHTML = "";

    try {
        const snapshot = await getDocs(collection(db, "schedules"));
        const upcoming = [];

        snapshot.forEach(docSnap => {
            const docId = docSnap.id;
            if (!docId || typeof docId !== "string") return;

            const date = new Date(docId + "T00:00:00");
            if (isNaN(date)) return;

            if (date >= today) {
                const data = docSnap.data();
                const rawUsers = data.users || data.funcionarios || [];
                const users = rawUsers.map(user => {
                    if (typeof user === "string") {
                        return { name: user, color: "gray-600" };
                    }
                    return user;
                });

                upcoming.push({ date, users });
            }
        });

        upcoming.sort((a, b) => a.date - b.date);

        if (upcoming.length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-500">Nenhuma escala futura.</p>';
        } else {
            upcoming.slice(0, 5).forEach(schedule => {
                const div = document.createElement("div");
                const formattedDate = schedule.date.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                });

                const userList = schedule.users.map(user => {
                    const name = user.name || "Funcionário";
                    const color = user.color || "gray-600";
                    return `<span class="font-medium">${name}</span>`;
                }).join(", ");

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