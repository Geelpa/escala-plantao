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

let listaFuncionarios = [];




const addEmployee = document.getElementById("addEmployee");
const selectFuncionario = document.getElementById("selectFuncionario");


function criarElementoDia(date, isOtherMonth) {
    const div = document.createElement("div");
    div.textContent = date.getDate();
    div.className = `p-2 cursor-pointer rounded-full hover:bg-orange-200 text-sm ${isOtherMonth ? "text-gray-400" : "text-gray-900"}`;
    div.addEventListener("click", () => abrirModal(date));
    return div;
}











