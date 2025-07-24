// js/app.js
// Sistema de Escalas - Aplicação Principal

// Importar Firebase via CDN
import { db } from '/firebase-config.js';
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Variáveis globais
let currentDate = new Date();
let schedules = {};
let editingDate = null;
let unsubscribe = null;

const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// ========================================
// FUNÇÕES DO FIREBASE/FIRESTORE (CRUD)
// ========================================

// READ - Carregar escalas do Firestore
async function loadSchedulesFromFirestore() {
    try {
        showLoading(true);
        const schedulesRef = collection(db, 'schedules');
        const q = query(schedulesRef, orderBy('date'));

        // Listener em tempo real para sincronização
        unsubscribe = onSnapshot(q, (querySnapshot) => {
            schedules = {};
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                schedules[data.date] = data.employees || [];
            });
            updateCalendar();
            showLoading(false);
        });
    } catch (error) {
        console.error('Erro ao carregar escalas:', error);
        showLoading(false);
        alert('Erro ao carregar dados. Verifique sua conexão com o Firebase.');
    }
}

// CREATE/UPDATE - Salvar escala no Firestore
async function saveScheduleToFirestore(dateKey, employees) {
    try {
        const scheduleRef = doc(db, 'schedules', dateKey);

        if (employees && employees.length > 0) {
            // CREATE/UPDATE
            await setDoc(scheduleRef, {
                date: dateKey,
                employees: employees,
                lastUpdated: new Date()
            });
        } else {
            // DELETE - Remove documento se não há funcionários
            await deleteDoc(scheduleRef);
        }
    } catch (error) {
        console.error('Erro ao salvar escala:', error);
        alert('Erro ao salvar dados. Tente novamente.');
    }
}

function showLoading(show) {
    const indicator = document.getElementById('loadingIndicator');
    if (show) {
        indicator.textContent = 'Carregando...';
        indicator.style.color = '#4facfe';
    } else {
        indicator.textContent = 'Conectado';
        indicator.style.color = '#28a745';
    }
}

// ========================================
// FUNÇÕES DO CALENDÁRIO
// ========================================

function initCalendar() {
    updateCalendar();
    updateMonthDisplay();
    loadSchedulesFromFirestore();
}

function updateMonthDisplay() {
    const monthYear = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    document.getElementById('currentMonthYear').textContent = monthYear;

    const today = new Date();
    const isCurrentMonth = currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();

    const indicator = document.getElementById('monthIndicator');
    indicator.textContent = isCurrentMonth ? 'Mês Atual' : '';
    indicator.style.display = isCurrentMonth ? 'block' : 'none';
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
    updateMonthDisplay();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
    updateMonthDisplay();
}

function updateCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendarBody = document.getElementById('calendarBody');
    calendarBody.innerHTML = '';

    let currentWeek = startDate;

    for (let week = 0; week < 6; week++) {
        const row = document.createElement('tr');

        for (let day = 0; day < 7; day++) {
            const cellDate = new Date(currentWeek);
            const cell = document.createElement('td');

            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = cellDate.getDate();
            cell.appendChild(dayNumber);

            const dateKey = formatDateKey(cellDate);

            // Adicionar classes CSS
            if (cellDate.getMonth() !== month) {
                cell.classList.add('other-month');
            }

            if (cellDate.toDateString() === today.toDateString()) {
                cell.classList.add('today');
            }

            if (schedules[dateKey] && schedules[dateKey].length > 0) {
                cell.classList.add('has-employees');
                const employeeList = document.createElement('div');
                employeeList.className = 'employee-list';

                schedules[dateKey].forEach(employee => {
                    const tag = document.createElement('span');
                    tag.className = 'employee-tag';
                    tag.textContent = employee;
                    employeeList.appendChild(tag);
                });

                cell.appendChild(employeeList);
            }

            cell.addEventListener('click', () => openEditModal(dateKey, cellDate));

            row.appendChild(cell);
            currentWeek.setDate(currentWeek.getDate() + 1);
        }

        calendarBody.appendChild(row);

        if (currentWeek.getMonth() > month) break;
    }
}

// ========================================
// FUNÇÕES DE UTILITÁRIOS
// ========================================

function formatDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDateDisplay(date) {
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

// ========================================
// FUNÇÕES DO MODAL
// ========================================

function openEditModal(dateKey, date) {
    editingDate = dateKey;
    const modal = document.getElementById('editModal');
    const modalTitle = document.getElementById('modalTitle');
    const currentEmployees = document.getElementById('currentEmployees');

    modalTitle.textContent = `Escala - ${formatDateDisplay(date)}`;

    // Limpar conteúdo anterior
    currentEmployees.innerHTML = '';
    document.getElementById('newEmployeeName').value = '';

    // Mostrar funcionários atuais
    if (schedules[dateKey] && schedules[dateKey].length > 0) {
        const title = document.createElement('h4');
        title.textContent = 'Funcionários Escalados:';
        title.style.marginTop = '20px';
        title.style.marginBottom = '10px';
        currentEmployees.appendChild(title);

        schedules[dateKey].forEach((employee, index) => {
            const item = document.createElement('div');
            item.className = 'employee-item';

            const name = document.createElement('span');
            name.textContent = employee;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = 'Remover';
            removeBtn.onclick = async () => {
                await removeEmployeeFromDay(index);
                openEditModal(editingDate, new Date(editingDate));
            };

            item.appendChild(name);
            item.appendChild(removeBtn);
            currentEmployees.appendChild(item);
        });
    } else {
        const noEmployees = document.createElement('p');
        noEmployees.textContent = 'Nenhum funcionário escalado para este dia.';
        noEmployees.style.marginTop = '20px';
        noEmployees.style.color = '#666';
        currentEmployees.appendChild(noEmployees);
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
    editingDate = null;
}

// ========================================
// FUNÇÕES DE GERENCIAMENTO DE FUNCIONÁRIOS (CRUD)
// ========================================

// CREATE - Adicionar funcionário no modal
async function addEmployeeToDay() {
    const employeeName = document.getElementById('newEmployeeName').value.trim();

    if (!employeeName) {
        alert('Por favor, digite o nome do funcionário.');
        return;
    }

    if (!schedules[editingDate]) {
        schedules[editingDate] = [];
    }

    if (schedules[editingDate].includes(employeeName)) {
        alert('Este funcionário já está escalado para este dia.');
        return;
    }

    schedules[editingDate].push(employeeName);

    // Salvar no Firestore
    await saveScheduleToFirestore(editingDate, schedules[editingDate]);

    document.getElementById('newEmployeeName').value = '';
}

// DELETE - Remover funcionário específico
async function removeEmployeeFromDay(index) {
    if (schedules[editingDate]) {
        schedules[editingDate].splice(index, 1);

        const employees = schedules[editingDate].length > 0 ? schedules[editingDate] : null;

        if (!employees) {
            delete schedules[editingDate];
        }

        // Salvar no Firestore (ou deletar se vazio)
        await saveScheduleToFirestore(editingDate, employees);
    }
}

// CREATE - Adicionar funcionário via formulário lateral
async function addEmployee() {
    const employeeName = document.getElementById('employeeName').value.trim();
    const selectedDate = document.getElementById('selectedDate').value;

    if (!employeeName) {
        alert('Por favor, digite o nome do funcionário.');
        return;
    }

    if (!selectedDate) {
        alert('Por favor, selecione uma data.');
        return;
    }

    if (!schedules[selectedDate]) {
        schedules[selectedDate] = [];
    }

    if (schedules[selectedDate].includes(employeeName)) {
        alert('Este funcionário já está escalado para este dia.');
        return;
    }

    schedules[selectedDate].push(employeeName);

    // Salvar no Firestore
    await saveScheduleToFirestore(selectedDate, schedules[selectedDate]);

    // Limpar formulário
    document.getElementById('employeeName').value = '';
    document.getElementById('selectedDate').value = '';

    alert('Funcionário adicionado com sucesso!');
}

// ========================================
// EVENT LISTENERS E INICIALIZAÇÃO
// ========================================

// Fechar modal ao clicar fora dele
window.onclick = function (event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Cleanup ao sair da página
window.addEventListener('beforeunload', () => {
    if (unsubscribe) {
        unsubscribe();
    }
});

// Tornar funções disponíveis globalmente para os event handlers do HTML
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.addEmployee = addEmployee;
window.addEmployeeToDay = addEmployeeToDay;
window.closeModal = closeModal;

// Inicializar o calendário quando a página carregar
document.addEventListener('DOMContentLoaded', initCalendar);