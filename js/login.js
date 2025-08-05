
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAZkqhpI65wReHGsp5s6DxZhhmHjAmAeIA",
    authDomain: "escala-vpu.firebaseapp.com",
    projectId: "escala-vpu",
    storageBucket: "escala-vpu.appspot.com",
    messagingSenderId: "514143628923",
    appId: "1:514143628923:web:bc29094ad9915f5c917cde"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "index.html";
    } catch (error) {
        document.getElementById("loginError").textContent = "Email ou senha inválidos.";
        document.getElementById("loginError").classList.remove("hidden");
    }
});
