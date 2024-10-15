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
    const form = document.getElementById('mantenimientoForm');

    // Establecer fecha y hora actuales
    const ahora = new Date();
    const hoy = ahora.toISOString().split('T')[0];
    document.getElementById('fecha').value = hoy;
    document.getElementById('hora').value = ahora.toTimeString().split(' ')[0].slice(0, 5);

    // Escuchar cambios en campos relevantes
    document.getElementById('valor_instalacion').addEventListener('input', calcularCostoTotal);
    document.getElementById('valor_repuesto').addEventListener('input', calcularCostoTotal);
    document.getElementById('fecha_ultimo_cambio').addEventListener('change', calcularTiempoDuracion);
    document.getElementById('kilometraje_actual').addEventListener('input', calcularProximoKilometraje);
    document.getElementById('duracion').addEventListener('input', calcularProximoCambio);

    function calcularCostoTotal() {
        const valorInstalacion = parseFloat(document.getElementById('valor_instalacion').value) || 0;
        const valorRepuesto = parseFloat(document.getElementById('valor_repuesto').value) || 0;
        const costoTotal = valorInstalacion + valorRepuesto;
        document.getElementById('costo_total').value = `$${costoTotal.toFixed(2)}`;
    }

    function calcularTiempoDuracion() {
        const fechaUltimoCambio = new Date(document.getElementById('fecha_ultimo_cambio').value);
        const ahora = new Date();
        const diferenciaEnMs = ahora - fechaUltimoCambio;
        const diasDeDuracion = Math.floor(diferenciaEnMs / (1000 * 60 * 60 * 24));

        const años = Math.floor(diasDeDuracion / 365);
        const meses = Math.floor((diasDeDuracion % 365) / 30);
        const dias = diasDeDuracion % 30;

        document.getElementById('tiempo_duracion').value = 
            `${años} años, ${meses} meses, ${dias} días`;

        calcularProximoCambio();
    }

    function calcularProximoCambio() {
        const tiempoDuracion = document.getElementById('tiempo_duracion').value.split(', ');
        const [años, meses, dias] = tiempoDuracion.map(t => parseInt(t));

        // Obtener la fecha actual
        const fechaActual = new Date();

        // Sumar años, meses y días a la fecha actual
        const fechaProximoCambio = new Date(fechaActual);
        fechaProximoCambio.setFullYear(fechaProximoCambio.getFullYear() + años);
        fechaProximoCambio.setMonth(fechaProximoCambio.getMonth() + meses);
        fechaProximoCambio.setDate(fechaProximoCambio.getDate() + dias);
        
        document.getElementById('fecha_proximo_cambio').value = fechaProximoCambio.toISOString().split('T')[0];

        // Calcular el próximo kilometraje
        calcularProximoKilometraje();
    }

    function calcularProximoKilometraje() {
        const kilometrajeActual = parseFloat(document.getElementById('kilometraje_actual').value) || 0;
        const duracion = parseFloat(document.getElementById('duracion').value) || 0; // Duración en km
        const proximoKilometraje = kilometrajeActual + duracion;
        document.getElementById('proximo_kilometraje').value = proximoKilometraje;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const datosMantenimiento = {
            fecha: document.getElementById('fecha').value,
            hora: document.getElementById('hora').value,
            fecha_ultimo_cambio: document.getElementById('fecha_ultimo_cambio').value,
            kilometraje_actual: document.getElementById('kilometraje_actual').value,
            repuesto: document.getElementById('repuesto').value,
            lugar_compra: document.getElementById('lugar_compra').value,
            valor_instalacion: document.getElementById('valor_instalacion').value,
            valor_repuesto: document.getElementById('valor_repuesto').value,
            duracion: document.getElementById('duracion').value,
            costo_total: document.getElementById('costo_total').value,
            tiempo_duracion: document.getElementById('tiempo_duracion').value,
            fecha_proximo_cambio: document.getElementById('fecha_proximo_cambio').value,
            proximo_kilometraje: document.getElementById('proximo_kilometraje').value,
        };

        try {
            await addDoc(collection(db, "Mantenimiento"), datosMantenimiento);
            alert('Registro guardado con éxito!');
            form.reset();
            calcularCostoTotal(); 
        } catch (error) {
            console.error('Error al guardar:', error);
        }
    });
});
