import { db } from './firebase-config.js';
import {
    collection,
    addDoc,
    doc,
    setDoc,
    getDocs,
    getDoc,
    onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

let currentDate = new Date();
let listaFuncionarios = [];

const monthLabel = document.getElementById("monthLabel");
const calendarDays = document.getElementById("calendarDays");
const modal = document.getElementById("employeeModal");
const modalDate = document.getElementById("modalDate");
const employeeList = document.getElementById("employeeList");
const employeeInput = document.getElementById("employeeInput");
const closeModal = document.getElementById("closeModal");
const addEmployee = document.getElementById("addEmployee");
const selectFuncionario = document.getElementById("selectFuncionario");

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    monthLabel.textContent = `${firstDay.toLocaleString("default", { month: "long" })} ${year}`;
    calendarDays.innerHTML = "";

    const diasAntes = firstDay.getDay();
    const totalDias = lastDay.getDate();
    const diasDepois = 6 - lastDay.getDay();

    for (let i = diasAntes; i > 0; i--) {
        const prevDate = new Date(year, month, 1 - i);
        const div = criarElementoDia(prevDate, true);
        calendarDays.appendChild(div);
    }

    for (let i = 1; i <= totalDias; i++) {
        const day = new Date(year, month, i);
        const div = criarElementoDia(day, false);
        calendarDays.appendChild(div);
    }

    for (let i = 1; i <= diasDepois; i++) {
        const nextDate = new Date(year, month + 1, i);
        const div = criarElementoDia(nextDate, true);
        calendarDays.appendChild(div);
    }
}

function criarElementoDia(date, isOtherMonth) {
    const div = document.createElement("div");
    div.textContent = date.getDate();
    div.className = `p-2 cursor-pointer rounded-full hover:bg-orange-200 text-sm ${isOtherMonth ? "text-gray-400" : "text-gray-900"}`;
    div.addEventListener("click", () => abrirModal(date));
    return div;
}

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

async function carregarFuncionarios() {
    try {
        const querySnapshot = await getDocs(collection(db, "funcionarios"));
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

// Cadastrar funcionário
const saveEmployeeBtn = document.getElementById("saveEmployeeBtn");
saveEmployeeBtn.addEventListener("click", async () => {
    const nome = document.getElementById("employeeNameInput").value.trim();
    const cor = document.getElementById("employeeColorInput").value;
    if (!nome) return;
    try {
        await addDoc(collection(db, "funcionarios"), { nome, cor });
        document.getElementById("employeeFeedback").classList.remove("hidden");
        carregarFuncionarios();
    } catch (error) {
        console.error("Erro ao salvar funcionário:", error);
    }
});

// Navegação
prevMonth.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonth.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

window.addEventListener("DOMContentLoaded", () => {
    carregarFuncionarios();
    renderCalendar();
});
