import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAzr-Tx3etwRFMPsCz4aS7zjseWCb90QRQ",
    authDomain: "control-consumo-de-combustible.firebaseapp.com",
    projectId: "control-consumo-de-combustible",
    storageBucket: "control-consumo-de-combustible.appspot.com",
    messagingSenderId: "600638990845",
    appId: "1:600638990845:web:d151bbe84154098f8a5194"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const btnGuardar = document.getElementById('btnGuardar');
    const btnAgregarOcio = document.getElementById('btnAgregarOcio');
    const btnAgregarAlmuerzo = document.getElementById('btnAgregarAlmuerzo');
    const inputs = document.querySelectorAll('input');

    // Establecer la fecha y hora actual
    const hoy = new Date();
    document.getElementById('fecha').value = hoy.toISOString().split('T')[0];
    document.getElementById('hora').value = hoy.toTimeString().split(' ')[0].substring(0, 5);

    // Permitir cambio de campo con la tecla Enter
    inputs.forEach((input, index) => {
        input.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const nextInput = inputs[index + 1];
                if (nextInput) nextInput.focus();
            }
        });
    });

    btnAgregarOcio.addEventListener('click', agregarTiempoOcio);
    btnAgregarAlmuerzo.addEventListener('click', agregarTiempoAlmuerzo);
    btnGuardar.addEventListener('click', guardarRegistro);
});

let tiemposOcio = [];
let tiemposAlmuerzo = [];

function agregarTiempoOcio() {
    const horaInicio = prompt("Ingrese hora de inicio de ocio (HH:mm):");
    const horaFin = prompt("Ingrese hora de fin de ocio (HH:mm):");
    if (horaInicio && horaFin) {
        const inicio = new Date(`1970-01-01T${horaInicio}:00`);
        const fin = new Date(`1970-01-01T${horaFin}:00`);
        const tiempo = (fin - inicio) / 60000; // en minutos
        tiemposOcio.push({ horaInicio, horaFin, tiempo });
        mostrarTiemposOcio();
        actualizarResumen();
    }
}

function agregarTiempoAlmuerzo() {
    const horaInicio = prompt("Ingrese hora de inicio de almuerzo (HH:mm):");
    const horaFin = prompt("Ingrese hora de fin de almuerzo (HH:mm):");
    if (horaInicio && horaFin) {
        const inicio = new Date(`1970-01-01T${horaInicio}:00`);
        const fin = new Date(`1970-01-01T${horaFin}:00`);
        const tiempo = (fin - inicio) / 60000; // en minutos
        tiemposAlmuerzo.push({ horaInicio, horaFin, tiempo });
        mostrarTiemposAlmuerzo();
        actualizarResumen();
    }
}

function mostrarTiemposOcio() {
    const contenedorOcio = document.getElementById('tiemposOcio');
    contenedorOcio.innerHTML = tiemposOcio.map(t => 
        `<p>Ocio de ${t.horaInicio} a ${t.horaFin} (${t.tiempo} min)</p>`
    ).join('');
}

function mostrarTiemposAlmuerzo() {
    const contenedorAlmuerzo = document.getElementById('tiemposAlmuerzo');
    contenedorAlmuerzo.innerHTML = tiemposAlmuerzo.map(t => 
        `<p>Almuerzo de ${t.horaInicio} a ${t.horaFin} (${t.tiempo} min)</p>`
    ).join('');
}

function actualizarResumen() {
    const totalTiempoOcio = tiemposOcio.reduce((acc, t) => acc + t.tiempo, 0);
    const totalTiempoAlmuerzo = tiemposAlmuerzo.reduce((acc, t) => acc + t.tiempo, 0);
    const horaSalida = document.getElementById('horaSalida').value;
    const horaFin = document.getElementById('horaFin').value;

    const totalHorasTrabajadas = calcularHorasTrabajadas(horaSalida, horaFin, totalTiempoOcio, totalTiempoAlmuerzo);
    document.getElementById('totalHorasTrabajadas').textContent = `Total Horas Trabajadas: ${totalHorasTrabajadas}`;
    document.getElementById('totalTiempoOcio').textContent = `Total Tiempo de Ocio: ${totalTiempoOcio} min`;
    document.getElementById('totalTiempoAlmuerzo').textContent = `Total Tiempo de Almuerzo: ${totalTiempoAlmuerzo} min`;
}

function calcularHorasTrabajadas(horaSalida, horaFin, tiempoOcio, tiempoAlmuerzo) {
    if (horaSalida && horaFin) {
        const inicio = new Date(`1970-01-01T${horaSalida}:00`);
        const fin = new Date(`1970-01-01T${horaFin}:00`);
        const totalTrabajado = (fin - inicio) / 60000 - tiempoOcio - tiempoAlmuerzo; // en minutos
        const horas = Math.floor(totalTrabajado / 60);
        const minutos = totalTrabajado % 60;
        return `${horas}h ${minutos}m`;
    }
    return '0h 0m';
}

async function guardarRegistro() {
    const nombre = document.getElementById('nombreMensajero').value;
    const fecha = document.getElementById('fecha').value;
    const kmInicial = document.getElementById('kmInicial').value;
    const horaSalida = document.getElementById('horaSalida').value;
    const horaFin = document.getElementById('horaFin').value;

    const totalTiempoOcio = tiemposOcio.reduce((acc, t) => acc + t.tiempo, 0);
    const totalTiempoAlmuerzo = tiemposAlmuerzo.reduce((acc, t) => acc + t.tiempo, 0);
    const totalHorasTrabajadas = calcularHorasTrabajadas(horaSalida, horaFin, totalTiempoOcio, totalTiempoAlmuerzo);

    const datosRegistro = {
        nombreMensajero: nombre,
        fecha: fecha,
        hora: document.getElementById('hora').value,
        kilometrajeInicial: parseFloat(kmInicial),
        horaSalida: horaSalida,
        horaFin: horaFin,
        tiemposOcio: tiemposOcio,
        tiemposAlmuerzo: tiemposAlmuerzo,
        totalHorasTrabajadas: totalHorasTrabajadas,
        totalTiempoOcio: totalTiempoOcio,
        totalTiempoAlmuerzo: totalTiempoAlmuerzo,
    };

    try {
        await addDoc(collection(db, "RegistroActividades"), datosRegistro);
        alert('Registro guardado con éxito!');
        // Reiniciar los valores
        tiemposOcio = [];
        tiemposAlmuerzo = [];
        document.getElementById('nombreMensajero').value = '';
        document.getElementById('kmInicial').value = '';
        document.getElementById('horaSalida').value = '';
        document.getElementById('horaFin').value = '';
        document.getElementById('tiemposOcio').innerHTML = '';
        document.getElementById('tiemposAlmuerzo').innerHTML = '';
        document.getElementById('totalHorasTrabajadas').textContent = `Total Horas Trabajadas: 0h 0m`;
        document.getElementById('totalTiempoOcio').textContent = `Total Tiempo de Ocio: 0 min`;
        document.getElementById('totalTiempoAlmuerzo').textContent = `Total Tiempo de Almuerzo: 0 min`;
    } catch (error) {
        console.error('Error al guardar:', error);
    }
}
