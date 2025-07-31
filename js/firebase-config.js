import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyAZkqhpI65wReHGsp5s6DxZhhmHjAmAeIA",
    authDomain: "escala-vpu.firebaseapp.com",
    projectId: "escala-vpu",
    storageBucket: "escala-vpu.firebasestorage.app",
    messagingSenderId: "514143628923",
    appId: "1:514143628923:web:bc29094ad9915f5c917cde"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };