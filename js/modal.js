import { loadEmployees, popularSelectFuncionarios } from "./employees.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase-config.js";

const modal = document.getElementById("employeeModal");
const modalDate = document.getElementById("modalDate");
const employeeList = document.getElementById("employeeList");
const closeModal = document.getElementById("closeModal");

async function loadUpcomingSchedules(date) {
    const employeeList = document.getElementById("employeeList");
    employeeList.innerHTML = "";

    try {
        const docRef = doc(db, "schedules", date);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const funcionarios = docSnap.data().funcionarios || [];

            funcionarios.forEach((func, index) => {
                const li = document.createElement("li");
                li.className = "flex justify-between items-center bg-gray-100 px-2 py-1 rounded";

                const nome = typeof func === "string" ? func : func.name;

                li.innerHTML = `
                    <span class="truncate max-w-[140px]">${nome}</span>
                    <button class="bg-red-100 text-red-600 text-xs px-2 py-1 rounded hover:bg-red-200">🗑️</button>
                `;

                const btn = li.querySelector("button");
                btn.addEventListener("click", async () => {
                    const novosFuncionarios = funcionarios.filter((_, i) => i !== index);
                    await setDoc(docRef, { funcionarios: novosFuncionarios });
                    loadUpcomingSchedules(date);
                });

                employeeList.appendChild(li);
            });
        }
    } catch (error) {
        console.error("Erro ao carregar funcionários da data:", error);
    }
}

function abrirModal(dateObj) {
    const yyyy = dateObj.getFullYear();
    const mm = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const dd = dateObj.getDate().toString().padStart(2, "0");
    const date = `${yyyy}-${mm}-${dd}`;
    const dateBr = `${dd}/${mm}/${yyyy}`;

    modalDate.textContent = dateBr;
    modal.setAttribute("data-date", date);

    modal.classList.remove("hidden");
    loadEmployees();
    popularSelectFuncionarios();
    loadUpcomingSchedules(date);
}

function fecharModal() {
    modal.classList.add("hidden");
    employeeList.innerHTML = "";
}

closeModal.addEventListener("click", fecharModal);

export { abrirModal, fecharModal };