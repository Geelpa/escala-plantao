import { db } from "./firebase-config.js";
import {
    collection, addDoc, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let listaFuncionarios = [];

async function loadEmployees() {
    try {
        const querySnapshot = await getDocs(collection(db, "employees"));
        listaFuncionarios = [];
        querySnapshot.forEach((doc) => {
            const funcionario = doc.data();
            listaFuncionarios.push({ id: doc.id, ...funcionario });
        });
    } catch (error) {
        console.error("Erro ao carregar funcionários:", error);
    }
}

function popularSelectFuncionarios() {
    const select = document.getElementById("selectFuncionario");
    if (!select) return;
    select.innerHTML = '<option value="">Selecione um funcionário</option>';
    listaFuncionarios.forEach(func => {
        const option = document.createElement("option");
        option.value = func.nome;
        option.textContent = func.nome;
        select.appendChild(option);
    });
}

const saveEmployeeBtn = document.getElementById("saveEmployeeBtn");
saveEmployeeBtn.addEventListener("click", async () => {
    const nome = document.getElementById("employeeNameInput").value.trim();
    const cor = document.getElementById("employeeColorInput").value;
    if (!nome) return;
    try {
        await addDoc(collection(db, "employees"), { nome, cor });
        document.getElementById("employeeFeedback").classList.remove("hidden");
        loadEmployees();
        document.getElementById("employeeNameInput").value = "";

        escutarEscalasTempoReal();

    } catch (error) {
        console.error("Erro ao salvar funcionário:", error);
    }
});

export { loadEmployees, popularSelectFuncionarios };