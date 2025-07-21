// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAZkqhpI65wReHGsp5s6DxZhhmHjAmAeIA",
    authDomain: "escala-vpu.firebaseapp.com",
    projectId: "escala-vpu",
    storageBucket: "escala-vpu.firebasestorage.app",
    messagingSenderId: "514143628923",
    appId: "1:514143628923:web:bc29094ad9915f5c917cde"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Utilitários
function formatDateKey(date) {
    return date.toISOString().split('T')[0];
}

function parseDateKey(key) {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function getMonthDays(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function criarDia(data, escalas) {
    const dia = document.createElement('div');
    dia.className = `border p-2 rounded text-center cursor-pointer relative text-sm ${data.getDay() === 0 ? 'text-red-600' : data.getDay() === 6 ? 'text-blue-600' : ''
        }`;
    dia.textContent = data.getDate();

    const key = formatDateKey(data);
    const usuarios = escalas[key];
    if (usuarios) {
        usuarios.forEach(u => {
            const nome = typeof u === 'string' ? u : u.nome;
            const cor = typeof u === 'string' ? '#000' : u.cor || '#000';

            const tag = document.createElement('span');
            tag.className = 'block text-white text-xs rounded mt-1 px-1';
            tag.style.backgroundColor = cor;
            tag.textContent = nome;
            dia.appendChild(tag);
        });
    }

    dia.addEventListener('click', () => abrirModal(key));
    return dia;
}

// Modal
const modal = document.getElementById('modal');
const inputNome = document.getElementById('nome-usuario');
const inputCor = document.getElementById('cor-usuario');
const salvarBtn = document.getElementById('salvar-escala');
const fecharBtn = document.getElementById('fechar-modal');
let dataSelecionada = '';

function abrirModal(data) {
    dataSelecionada = data;
    inputNome.value = '';
    inputCor.value = '#ef7e24';
    modal.classList.remove('hidden');
}

fecharBtn.addEventListener('click', () => modal.classList.add('hidden'));

salvarBtn.addEventListener('click', async () => {
    const nome = inputNome.value.trim();
    const cor = inputCor.value;
    if (!nome) return;

    const ref = db.collection('schedules').doc(dataSelecionada);
    const doc = await ref.get();
    const usuarios = doc.exists ? doc.data().employees || [] : [];
    usuarios.push({ nome, cor });

    await ref.set({ date: dataSelecionada, employees: usuarios });
    modal.classList.add('hidden');
    renderCalendar();
    carregarProximasEscalas();
});

// Calendário
let hoje = new Date();
let mesAtual = hoje.getMonth();
let anoAtual = hoje.getFullYear();

async function obterEscalasPorMes() {
    try {
        const inicio = new Date(anoAtual, mesAtual, 1);
        const fim = new Date(anoAtual, mesAtual + 1, 0);
        const snapshot = await db.collection('schedules')
            .where('date', '>=', formatDateKey(inicio))
            .where('date', '<=', formatDateKey(fim))
            .get();

        // console.log("Documentos encontrados:", snapshot.size);

        const mapa = {};
        snapshot.forEach(doc => {
            // console.log("Doc:", doc.id, doc.data());
            mapa[doc.id] = doc.data().employees;
        });
        return mapa;
    } catch (e) {
        // console.error("Erro ao buscar escalas:", e);
        return {};
    }
}

async function renderCalendar() {
    const container = document.getElementById('calendar');
    container.innerHTML = '';

    const escalas = await obterEscalasPorMes();
    const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
    const totalDias = getMonthDays(anoAtual, mesAtual);

    for (let i = 0; i < primeiroDia; i++) {
        container.appendChild(document.createElement('div'));
    }

    for (let d = 1; d <= totalDias; d++) {
        const data = new Date(anoAtual, mesAtual, d);
        container.appendChild(criarDia(data, escalas));
    }
}

// Próximas escalas
async function carregarProximasEscalas() {
    const ul = document.getElementById('lista-proximas');
    ul.innerHTML = '';

    const hojeKey = formatDateKey(new Date());
    const snapshot = await db.collection('schedules')
        .where('date', '>=', hojeKey)
        .orderBy('date')
        .limit(7)
        .get();

    if (snapshot.empty) {
        ul.innerHTML = '<li class="text-gray-500">Nenhuma escala futura.</li>';
        return;
    }

    snapshot.forEach(doc => {
        const { date, employees } = doc.data();
        const texto = `${new Date(date).toLocaleDateString('pt-BR')}: ${employees
            .map(u => (typeof u === 'string' ? u : u.nome))
            .join(', ')}`;
        const li = document.createElement('li');
        li.textContent = texto;
        ul.appendChild(li);
    });
}

// Inicialização
renderCalendar();
carregarProximasEscalas();
