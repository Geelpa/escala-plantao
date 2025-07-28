// js/app.js
// Sistema de Escalas - Aplicação Principal

// Importar Firebase via CDN
import { db } from './firebase-config';
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const schedulesCollection = collection(db, "schedules");
const scheduleData = {};
const calendarElement = document.getElementById("calendar");

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// --- Calendar Functions ---
function renderCalendar(month = currentMonth, year = currentYear) {
    calendarElement.innerHTML = "";
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        calendarElement.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = formatDateKey(new Date(year, month, day));
        const dayCell = document.createElement("div");
        dayCell.className = "bg-white p-2 border rounded text-sm cursor-pointer hover:bg-orange-100";
        dayCell.textContent = day;

        const employeeList = scheduleData[dateKey] || [];
        if (employeeList.length > 0) {
            const list = document.createElement("ul");
            list.className = "text-xs text-gray-700 mt-1";
            employeeList.forEach(name => {
                const li = document.createElement("li");
                li.textContent = `• ${name}`;
                list.appendChild(li);
            });
            dayCell.appendChild(list);
        }

        dayCell.addEventListener("click", () => openModal(dateKey));
        calendarElement.appendChild(dayCell);
    }
}

function updateCalendar() {
    renderCalendar(currentMonth, currentYear);
}

// --- Date Formatting ---
function formatDateKey(date) {
    return date.toISOString().split("T")[0];
}

function formatDateDisplay(date) {
    return date.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
}

// --- Modal Logic ---
const modal = document.getElementById("employeeModal");
const modalDate = document.getElementById("modalDate");
const employeeListEl = document.getElementById("employeeList");
const employeeInput = document.getElementById("employeeInput");
let selectedDateKey = null;

function openModal(dateKey) {
    selectedDateKey = dateKey;
    modalDate.textContent = `Shifts for ${formatDateDisplay(new Date(dateKey))}`;
    employeeListEl.innerHTML = "";

    const employees = scheduleData[dateKey] || [];
    employees.forEach((name, index) => {
        const li = document.createElement("li");
        li.textContent = name;
        li.className = "flex justify-between items-center";

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "×";
        removeBtn.className = "text-red-500 font-bold ml-2";
        removeBtn.onclick = () => removeEmployeeFromDay(index);

        li.appendChild(removeBtn);
        employeeListEl.appendChild(li);
    });

    modal.classList.remove("hidden");
}

function closeModal() {
    modal.classList.add("hidden");
    employeeInput.value = "";
}

function addEmployeeToDay() {
    const name = employeeInput.value.trim();
    if (!name) return;

    if (!scheduleData[selectedDateKey]) {
        scheduleData[selectedDateKey] = [];
    }
    scheduleData[selectedDateKey].push(name);
    saveScheduleToFirestore(selectedDateKey);
    openModal(selectedDateKey); // Refresh modal
}

function removeEmployeeFromDay(index) {
    if (scheduleData[selectedDateKey]) {
        scheduleData[selectedDateKey].splice(index, 1);
        saveScheduleToFirestore(selectedDateKey);
        openModal(selectedDateKey); // Refresh modal
    }
}

document.getElementById("closeModal").onclick = closeModal;
document.getElementById("addEmployee").onclick = addEmployeeToDay;

// --- Firestore Functions ---
function saveScheduleToFirestore(dateKey) {
    const ref = doc(schedulesCollection, dateKey);
    const employees = scheduleData[dateKey] || [];
    setDoc(ref, {
        date: dateKey,
        employees: employees,
        lastUpdated: new Date()
    }).catch(err => console.error("Error saving schedule:", err));
}

function loadSchedulesFromFirestore() {
    onSnapshot(schedulesCollection, snapshot => {
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            scheduleData[data.date] = data.employees || [];
        });
        updateCalendar();
        renderUpcomingSchedules();
    });
}

// --- Upcoming Schedules ---
function renderUpcomingSchedules() {
    const listEl = document.getElementById("upcomingSchedulesList");
    listEl.innerHTML = "";

    const today = new Date();
    const upcoming = Object.keys(scheduleData)
        .filter(dateKey => {
            const [y, m, d] = dateKey.split("-").map(Number);
            const dateObj = new Date(y, m - 1, d);
            return dateObj >= today && scheduleData[dateKey].length > 0;
        })
        .sort()
        .slice(0, 7);

    if (upcoming.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No upcoming shifts.";
        listEl.appendChild(li);
        return;
    }

    upcoming.forEach(dateKey => {
        const li = document.createElement("li");
        const names = scheduleData[dateKey].join(", ");
        li.textContent = `${formatDateDisplay(new Date(dateKey))}: ${names}`;
        listEl.appendChild(li);
    });
}

// --- Initialize ---
renderCalendar();
loadSchedulesFromFirestore();
