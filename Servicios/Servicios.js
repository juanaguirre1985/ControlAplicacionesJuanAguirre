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
    const form = document.getElementById('serviceForm');

    const establecerFechaYHora = () => {
        const ahora = new Date();
        document.getElementById('fecha').value = ahora.toISOString().split('T')[0]; // Solo la fecha
        const horaFormateada = ahora.toTimeString().split(' ')[0].slice(0, 5); // Solo HH:MM
        document.getElementById('hora').value = horaFormateada;
    };
    
    establecerFechaYHora(); // Llamar la función al cargar el documento

    // Obtener referencias a los elementos
    const kmInicialInput = document.getElementById('kmInicial');
    const kmFinalInput = document.getElementById('kmFinal');
    const entregasInput = document.getElementById('entregas');
    const valorEntregasInput = document.getElementById('valorEntregas');
    const valorPagadoInput = document.getElementById('valorPagado');
    const kmRecorridosInput = document.getElementById('kmRecorridos');
    const valorPorPaqueteInput = document.getElementById('valorPorPaquete');
    const descuentosComisionInput = document.getElementById('descuentosComision');
    const gananciaNetaInput = document.getElementById('gananciaNeta');
    const valorKilometroInput = document.getElementById('valorKilometro');

    function calcularDatos() {
        const kmInicial = parseFloat(kmInicialInput.value) || 0;
        const kmFinal = parseFloat(kmFinalInput.value) || 0;
        const entregas = parseInt(entregasInput.value) || 1;
        const valorEntregas = parseFloat(valorEntregasInput.value) || 0;
        const valorPagado = parseFloat(valorPagadoInput.value) || 0;
    
        // Calcular kilómetros recorridos
        const kmRecorridos = kmFinal - kmInicial;
        kmRecorridosInput.value = kmRecorridos >= 0 ? kmRecorridos : 0;
    
        // Calcular valor por paquete
        const valorPorPaquete = entregas > 0 ? (valorEntregas / entregas).toFixed(2) : 0;
        valorPorPaqueteInput.value = `$${valorPorPaquete}`;
    
        // Calcular descuentos en comisión
        const descuentosComision = valorEntregas - valorPagado;
        descuentosComisionInput.value = descuentosComision >= 0 ? `$${descuentosComision.toFixed(2)}` : '$0.00';
    
        // Calcular ganancia neta
        const gananciaNeta = valorEntregas - descuentosComision;
        gananciaNetaInput.value = gananciaNeta >= 0 ? `$${gananciaNeta.toFixed(2)}` : '$0.00';
    
        // Calcular valor por kilómetro
        const gananciaNetaValor = parseFloat(gananciaNetaInput.value.replace('$', '')) || 0;
        const valorKilometro = kmRecorridos > 0 ? (gananciaNetaValor / kmRecorridos).toFixed(2) : 0;
        valorKilometroInput.value = `$${valorKilometro}`;
    }
    

    // Actualizar cálculos al ingresar datos
    kmInicialInput.addEventListener('input', calcularDatos);
    kmFinalInput.addEventListener('input', calcularDatos);
    entregasInput.addEventListener('input', calcularDatos);
    valorEntregasInput.addEventListener('input', calcularDatos);
    valorPagadoInput.addEventListener('input', calcularDatos);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const datosServicio = {
            fecha: document.getElementById('fecha').value,
            hora: document.getElementById('hora').value,
            appNombre: document.getElementById('appNombre').value,
            ruta: document.getElementById('ruta').value,
            kmInicial: kmInicialInput.value,
            kmFinal: kmFinalInput.value,
            kmRecorridos: kmRecorridosInput.value,
            entregas: entregasInput.value,
            valorEntregas: valorEntregasInput.value,
            valorPagado: valorPagadoInput.value,
            valorPorPaquete: valorPorPaqueteInput.value,
            descuentosComision: descuentosComisionInput.value.replace('$', ''),
            gananciaNeta: gananciaNetaInput.value.replace('$', ''),
            medioPago: document.getElementById('medioPago').value,
            valorKilometro: valorKilometroInput.value.replace('$', ''),
        };

        // Intentar guardar el documento en Firestore
        try {
            await addDoc(collection(db, "Servicios"), datosServicio);
            alert("Servicio registrado exitosamente!");
            
            form.reset(); // Limpiar el formulario
            establecerFechaYHora(); // Restablecer fecha y hora actuales
            document.getElementById('appNombre').focus(); // Colocar el foco en el campo del nombre de la aplicación
            
            calcularDatos(); // Reiniciar los cálculos
        } catch (error) {
            console.error("Error al registrar servicio: ", error);
            alert("Error al registrar servicio.");
        }
    });
});
