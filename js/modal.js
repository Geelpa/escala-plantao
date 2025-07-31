import { carregarFuncionarios, popularSelectFuncionarios } from "./employees.js";
import { carregarEscalaDoDia } from "./schedule.js";

const modal = document.getElementById("employeeModal");
const modalDate = document.getElementById("modalDate");
const employeeList = document.getElementById("employeeList");
const employeeInput = document.getElementById("employeeInput");
const closeModal = document.getElementById("closeModal");

function abrirModal(dateObj) {
    const date = dateObj.toISOString().split("T")[0];
    modalDate.textContent = new Date(date).toLocaleDateString("pt-BR");
    modal.setAttribute("data-date", date);
    modal.classList.remove("hidden");
    carregarFuncionarios();
    carregarEscalaDoDia(date);
    popularSelectFuncionarios();
}

function fecharModal() {
    modal.classList.add("hidden");
    employeeList.innerHTML = "";
    employeeInput.value = "";
}

closeModal.addEventListener("click", fecharModal);

export { abrirModal, fecharModal };