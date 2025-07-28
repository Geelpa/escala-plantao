import { db } from './firebase-config.js';
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
// const calendarElement = document.getElementById("calendar");

const monthLabel = document.getElementById("monthLabel");
const calendarDays = document.getElementById("calendarDays");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

let currentDate = new Date();

function renderCalendar(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth();

    monthLabel.textContent = `${monthNames[month]} ${year}`;
    calendarDays.innerHTML = "";

    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const totalCells = 35; // 6 semanas completas
    const days = [];

    // Dias do mês anterior
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        days.push({
            day: daysInPrevMonth - i,
            class: "text-gray-400" // estilo mais claro
        });
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInCurrentMonth; i++) {
        days.push({
            day: i,
            class: "text-black font-semibold"
        });
    }

    // Dias do mês seguinte
    while (days.length < totalCells) {
        days.push({
            day: days.length - (firstDayOfWeek + daysInCurrentMonth) + 1,
            class: "text-gray-400"
        });
    }

    // Renderizar os dias
    days.forEach(({ day, class: className }, index) => {
        const cell = document.createElement("div");
        cell.textContent = day;
        cell.className = `p-2 rounded-lg hover:bg-orange-200 cursor-pointer ${className}`;

        const dateKey = formatDateKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));

        cell.addEventListener("click", () => openModal(dateKey));

        calendarDays.appendChild(cell);
    });
}

// Navegar entre meses
prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
});

nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
});

// Inicializar
renderCalendar(currentDate);

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
        // updateCalendar();
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
