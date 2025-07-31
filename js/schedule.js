import { db } from "./firebase-config.js";
import { renderCalendar } from "./calendar.js";
import { fecharModal } from "./modal.js";
import {
    doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const addEmployee = document.getElementById("addEmployee");
const selectFuncionario = document.getElementById("selectFuncionario");
const employeeInput = document.getElementById("employeeInput");
const modal = document.getElementById("employeeModal");
const employeeList = document.getElementById("employeeList");

addEmployee.addEventListener("click", async () => {
    const nomeFuncionario = selectFuncionario.value || employeeInput.value.trim();
    if (!nomeFuncionario) return;
    const data = modal.getAttribute("data-date");
    if (!data) return;

    const docRef = doc(db, "escalas", data);
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

async function carregarEscalaDoDia(data) {
    const docRef = doc(db, "escalas", data);
    const docSnap = await getDoc(docRef);
    employeeList.innerHTML = "";
    if (docSnap.exists()) {
        const funcionarios = docSnap.data().funcionarios || [];
        funcionarios.forEach(nome => {
            const li = document.createElement("li");
            li.textContent = nome;
            employeeList.appendChild(li);
        });
    }
}

export { carregarEscalaDoDia };