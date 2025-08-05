import { abrirModal } from "./modal.js";

let currentDate = new Date();
const monthLabel = document.getElementById("monthLabel");
const calendarDays = document.getElementById("calendarDays");

function renderCalendar(scales = {}) {
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
        const div = criarElementoDia(prevDate, true, scales);
        calendarDays.appendChild(div);
    }

    for (let i = 1; i <= totalDias; i++) {
        const day = new Date(year, month, i);
        const div = criarElementoDia(day, false, scales);
        calendarDays.appendChild(div);
    }

    for (let i = 1; i <= diasDepois; i++) {
        const nextDate = new Date(year, month + 1, i);
        const div = criarElementoDia(nextDate, true, scales);
        calendarDays.appendChild(div);
    }
}

function criarElementoDia(date, isOtherMonth, scales) {
    const div = document.createElement("div");
    div.textContent = date.getDate();

    div.className = `p-2 cursor-pointer rounded-full hover:bg-orange-200 text-sm ${isOtherMonth ? "text-gray-400" : "text-gray-900"}`;
    div.addEventListener("click", () => abrirModal(date));

    const dateKey = date.toISOString().slice(0, 10);
    const funcionarios = scales[dateKey];

    if (funcionarios && funcionarios.length > 0) {
        const container = document.createElement("div");
        container.className = "flex justify-center gap-1";

        funcionarios.forEach(func => {
            const badge = document.createElement("div");
            badge.textContent = func.name.charAt(0);
            badge.className = "w-5 h-5 rounded-full text-white text-xs flex items-center justify-center";
            badge.style.backgroundColor = func.color;
            container.appendChild(badge);
        });

        div.appendChild(container);
    }

    return div;
}

function mudarMes(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    renderCalendar();
}

export { renderCalendar, mudarMes, currentDate };