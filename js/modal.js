import { loadEmployees, popularSelectFuncionarios } from "./employees.js";
import { } from "./calendar.js"
// import { loadUpcomingSchedules } from "./schedule.js";

const modal = document.getElementById("employeeModal");
const modalDate = document.getElementById("modalDate");
const employeeList = document.getElementById("employeeList");
const closeModal = document.getElementById("closeModal");

function abrirModal(dateObj) {
    const date = dateObj.toISOString().split("T")[0];
    modalDate.textContent = new Date(date).toLocaleDateString("pt-BR");
    modal.setAttribute("data-date", date);
    modal.classList.remove("hidden");
    loadEmployees();
    popularSelectFuncionarios();
}

function fecharModal() {
    modal.classList.add("hidden");
    employeeList.innerHTML = "";
}

closeModal.addEventListener("click", fecharModal);

export { abrirModal, fecharModal };