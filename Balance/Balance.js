// Importar funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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

// Funciones para obtener datos
async function obtenerTotalTanqueado(fechaInicio, fechaFin) {
    const q = query(
        collection(db, "Gasolina"),
        where("fecha", ">=", fechaInicio),
        where("fecha", "<=", fechaFin)
    );

    const querySnapshot = await getDocs(q);
    let total = 0;

    querySnapshot.forEach((doc) => {
        total += parseFloat(doc.data().valorTanqueado) || 0;
    });

    return total;
}

async function obtenerTotalMantenimiento(fechaInicio, fechaFin) {
    const q = query(
        collection(db, "Mantenimiento"),
        where("fecha", ">=", fechaInicio),
        where("fecha", "<=", fechaFin)
    );

    const querySnapshot = await getDocs(q);
    let total = 0;

    querySnapshot.forEach((doc) => {
        total += parseFloat(doc.data().costo_total.replace('$', '')) || 0;
    });

    return total;
}

async function obtenerActividadResumen(fechaInicio, fechaFin) {
    const q = query(
        collection(db, "RegistroActividades"),
        where("fecha", ">=", fechaInicio),
        where("fecha", "<=", fechaFin)
    );

    const querySnapshot = await getDocs(q);
    let totalHorasTrabajadas = 0;
    let totalTiempoOcio = 0;
    let totalTiempoAlmuerzo = 0;
    const diasLaboradosSet = new Set();

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        totalHorasTrabajadas += data.horasTrabajadas || 0;
        totalTiempoOcio += data.tiempoOcio || 0;
        totalTiempoAlmuerzo += data.tiempoAlmuerzo || 0;
        diasLaboradosSet.add(data.fecha);
    });

    return {
        totalHorasTrabajadas,
        totalTiempoOcio,
        totalTiempoAlmuerzo,
        diasLaborados: diasLaboradosSet.size
    };
}

async function obtenerServiciosResumen(fechaInicio, fechaFin) {
    const q = query(
        collection(db, "Servicios"),
        where("fecha", ">=", fechaInicio),
        where("fecha", "<=", fechaFin)
    );

    const querySnapshot = await getDocs(q);
    let kmRecorridos = 0;
    let gananciaNeta = 0;
    const diasLaboradosSet = new Set();

    querySnapshot.forEach((doc) => {
        kmRecorridos += parseFloat(doc.data().kmRecorridos) || 0;
        gananciaNeta += parseFloat(doc.data().gananciaNeta) || 0;
        diasLaboradosSet.add(doc.data().fecha); // Agrega la fecha al conjunto
    });

    return {
        kmRecorridos,
        gananciaNeta,
        diasLaborados: diasLaboradosSet.size // Devuelve el número de días únicos
    };
}

// Manejo de eventos al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    const formResumen = document.getElementById('formResumen');

    formResumen.addEventListener('submit', async (event) => {
        event.preventDefault();

        const fechaInicio = document.getElementById('fechaInicio').value;
        const fechaFin = document.getElementById('fechaFin').value;

        const totalTanqueado = await obtenerTotalTanqueado(fechaInicio, fechaFin);
        const totalMantenimiento = await obtenerTotalMantenimiento(fechaInicio, fechaFin);
        const actividadResumen = await obtenerActividadResumen(fechaInicio, fechaFin);
        const serviciosResumen = await obtenerServiciosResumen(fechaInicio, fechaFin);

        const diasLaborados = serviciosResumen.diasLaborados; // Ahora se obtiene de Servicios
        const gananciaNeta = serviciosResumen.gananciaNeta;
        const kmRecorridos = serviciosResumen.kmRecorridos;

        // Gastos diarios
        const gastosTotales = totalTanqueado + totalMantenimiento;
        const gastosDiarios = diasLaborados > 0 ? (gastosTotales / diasLaborados) : 0;

        const promedioDiarioGanancias = diasLaborados > 0 ? (gananciaNeta / diasLaborados).toFixed(2) : 0;
        const gananciaDiariaReal = (promedioDiarioGanancias - gastosDiarios).toFixed(2);
        const totalGananciasProyectadas = (promedioDiarioGanancias * 26).toFixed(2); // Proyección a 26 días

        document.getElementById('resultadoResumen').innerHTML = `
            <h3>Resultados del Período</h3>
            <p>Total Tanqueado: $${totalTanqueado}</p>
            <p>Total Mantenimiento: $${totalMantenimiento}</p>
            <p>Días Laborados: ${diasLaborados}</p>
            <p>Kilómetros Recorridos: ${kmRecorridos}</p>
            <p>Ganancia Neta: $${gananciaNeta}</p>
            <p>Promedio Diario de Ganancias: $${promedioDiarioGanancias}</p>
            <p>Total Ganancias Proyectadas para el Mes: $${totalGananciasProyectadas}</p>
        `;

        document.getElementById('metaGanancia').style.display = 'none'; // Oculta la sección de meta
    });
});
