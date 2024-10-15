// Importar funciones necesarias
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
    const form = document.getElementById('formGasolina');

    // Establecer fecha y hora actuales
    const ahora = new Date();
    document.getElementById('fecha').value = ahora.toISOString().split('T')[0]; // Solo la fecha
    const horaFormateada = ahora.toTimeString().split(' ')[0].slice(0, 5); // Solo HH:MM
    document.getElementById('hora').value = horaFormateada;

    // Calcular valores automáticamente
    const valorGalonInput = document.getElementById('valorGalon');
    const valorTanqueadoInput = document.getElementById('valorTanqueado');
    const cantidadGalonesInput = document.getElementById('cantidadGalones');
    const kmRecorrerInput = document.getElementById('kmRecorrer');
    const kmFinalInput = document.getElementById('kmFinal');
    const valorPorKmInput = document.getElementById('valorPorKm');

    valorGalonInput.addEventListener('input', calcularDatos);
    valorTanqueadoInput.addEventListener('input', calcularDatos);

    function calcularDatos() {
        const valorGalon = parseFloat(valorGalonInput.value) || 0;
        const valorTanqueado = parseFloat(valorTanqueadoInput.value) || 0;
        const kmInicial = parseFloat(document.getElementById('kmInicial').value) || 0;

        // Calcular la cantidad de galones
        const cantidadGalones = valorGalon > 0 ? (valorTanqueado / valorGalon).toFixed(2) : 0;
        cantidadGalonesInput.value = cantidadGalones;

        // Calcular kilómetros a recorrer
        const kmRecorrer = (cantidadGalones * 130).toFixed(2);
        kmRecorrerInput.value = kmRecorrer;

        // Calcular kilometraje final
        const kmFinal = (kmInicial + parseFloat(kmRecorrer)).toFixed(2);
        kmFinalInput.value = kmFinal;

        // Calcular valor por kilómetro
        const valorPorKm = kmRecorrer > 0 ? (valorTanqueado / kmRecorrer).toFixed(2) : 0;
        valorPorKmInput.value = `$${valorPorKm}`;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const datosTanqueo = {
            fecha: document.getElementById('fecha').value,
            hora: document.getElementById('hora').value, // Se guarda como militar
            kmInicial: document.getElementById('kmInicial').value,
            bomba: document.getElementById('bomba').value,
            valorGalon: valorGalonInput.value,
            valorTanqueado: valorTanqueadoInput.value,
            cantidadGalones: cantidadGalonesInput.value,
            kmRecorrer: kmRecorrerInput.value,
            kmFinal: kmFinalInput.value,
            valorPorKm: valorPorKmInput.value.replace('$', '')
        };

        try {
            await addDoc(collection(db, "Gasolina"), datosTanqueo);
            alert('Registro guardado con éxito!');
            form.reset();
            calcularDatos(); // Reiniciar los cálculos
        } catch (error) {
            console.error('Error al guardar:', error);
        }
    });
});
