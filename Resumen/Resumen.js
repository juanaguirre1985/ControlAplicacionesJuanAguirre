import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAzr-Tx3etwRFMPsCz4aS7jseWCb90QRQ",
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
    cargarDatos(); 
    document.getElementById('btnConsultar').addEventListener('click', cargarDatos);
    document.getElementById('btnConsultarServicios').addEventListener('click', cargarResumenServicios);
    document.getElementById('kilometraje_actual').addEventListener('input', actualizarInformeMantenimiento);
});

async function cargarDatos() {
    const fechaInicial = document.getElementById('fechaInicial').value;
    const fechaFinal = document.getElementById('fechaFinal').value;

    const q = query(collection(db, "Gasolina"), where("fecha", ">=", fechaInicial), where("fecha", "<=", fechaFinal));
    const registros = await getDocs(q);
    const datos = [];

    registros.forEach((doc) => {
        const data = doc.data();
        datos.push(data);
    });

    const cuerpoTabla = document.getElementById('cuerpoTabla');
    cuerpoTabla.innerHTML = datos.map(d => `
        <tr>
            <td>${d.fecha}</td>
            <td>${d.hora}</td>
            <td>${d.kmInicial}</td>
            <td>${d.bomba}</td>
            <td>$${parseFloat(d.valorGalon).toFixed(0)}</td>
            <td>$${parseFloat(d.valorTanqueado).toFixed(0)}</td>
            <td>${parseFloat(d.cantidadGalones).toFixed(2)}</td>
            <td>${parseFloat(d.kmRecorrer).toFixed(2)}</td>
            <td>${parseFloat(d.kmFinal).toFixed(0)}</td>
            <td>$${parseFloat(d.valorPorKm).toFixed(2)}</td>
        </tr>
    `).join('');

    mostrarConsolidado(datos);
    await cargarInformeMantenimiento();
    await cargarRegistroDiasLaborados(fechaInicial, fechaFinal); // Llamar la nueva función
}

async function cargarInformeMantenimiento() {
    const q = collection(db, "Mantenimiento");
    const registros = await getDocs(q);
    const datosMantenimiento = {};

    registros.forEach((doc) => {
        const data = doc.data();
        if (!datosMantenimiento[data.repuesto] || new Date(data.fecha_ultimo_cambio) > new Date(datosMantenimiento[data.repuesto].fecha_ultimo_cambio)) {
            datosMantenimiento[data.repuesto] = {
                ...data,
                diasDesdeCambio: calcularDiasDesdeCambio(data.fecha_ultimo_cambio)
            };
        }
    });

    const arrayMantenimiento = Object.values(datosMantenimiento);

    const cuerpoMantenimiento = document.getElementById('cuerpoMantenimiento');
    cuerpoMantenimiento.innerHTML = arrayMantenimiento.map(item => `
        <tr>
            <td>${item.repuesto}</td>
            <td>${item.diasDesdeCambio}</td>
            <td>${calcularEstado(item.proximo_kilometraje)}</td>
            <td>${item.proximo_kilometraje - parseFloat(document.getElementById('kilometraje_actual').value) || 0}</td>
            <td>${item.proximo_kilometraje}</td>
        </tr>
    `).join('');
}

function calcularDiasDesdeCambio(fechaUltimoCambio) {
    const dias = Math.floor((new Date() - new Date(fechaUltimoCambio)) / (1000 * 60 * 60 * 24));
    return dias;
}

function calcularEstado(proximoKilometraje) {
    const kilometrajeActual = parseFloat(document.getElementById('kilometraje_actual').value) || 0;
    return (proximoKilometraje - kilometrajeActual <= 0) ? 'Necesita Cambio' : 'En Buen Estado';
}

function mostrarConsolidado(datos) {
    const consolidadoDiv = document.getElementById('consolidado');
    let totalValorTanqueado = 0;
    let totalCantidadGalones = 0;

    datos.forEach(d => {
        totalValorTanqueado += parseFloat(d.valorTanqueado);
        totalCantidadGalones += parseFloat(d.cantidadGalones);
    });

    consolidadoDiv.innerHTML = `
        <p>Total Valor Tanqueado: $${totalValorTanqueado.toFixed(2)}</p>
        <p>Total Cantidad de Galones: ${totalCantidadGalones.toFixed(2)}</p>
    `;
}

function actualizarInformeMantenimiento() {
    cargarInformeMantenimiento();
}

async function cargarResumenServicios() {
    const fechaInicial = document.getElementById('fechaInicial').value;
    const fechaFinal = document.getElementById('fechaFinal').value;

    const q = query(collection(db, "Servicios"), where("fecha", ">=", fechaInicial), where("fecha", "<=", fechaFinal));
    const registros = await getDocs(q);
    const resumenServicios = {};
    let totalServicios = 0;
    const mediosPagoTotales = {};

    registros.forEach((doc) => {
        const data = doc.data();
        const appNombre = data.appNombre;

        if (!resumenServicios[appNombre]) {
            resumenServicios[appNombre] = {
                cantidadServicios: 0,
                gananciaNetaTotal: 0,
                cantidadPaquetes: 0
            };
        }

        resumenServicios[appNombre].cantidadServicios++;
        totalServicios++;
        resumenServicios[appNombre].gananciaNetaTotal += parseFloat(data.gananciaNeta.replace('$', '')) || 0;
        resumenServicios[appNombre].cantidadPaquetes += parseInt(data.entregas) || 0;

        const medioPago = data.medioPago;
        if (!mediosPagoTotales[medioPago]) {
            mediosPagoTotales[medioPago] = 0;
        }
        mediosPagoTotales[medioPago] += parseFloat(data.valorPagado.replace('$', '')) || 0;
    });

    const cuerpoResumenServicios = document.getElementById('cuerpoResumenServicios');
    cuerpoResumenServicios.innerHTML = Object.keys(resumenServicios).map(app => {
        const { cantidadServicios, gananciaNetaTotal, cantidadPaquetes } = resumenServicios[app];
        return `
            <tr>
                <td>${app}</td>
                <td>${cantidadServicios}</td>
                <td>$${gananciaNetaTotal.toFixed(2)}</td>
                <td>${cantidadPaquetes}</td>
            </tr>
        `;
    }).join('');

    const totalServiciosDiv = document.getElementById('totalServicios');
    totalServiciosDiv.innerHTML = `<p>Total de Servicios Realizados: ${totalServicios}</p>`;

    // Mostrar totales acumulados por medio de pago
    const cuerpoMediosPago = document.getElementById('cuerpoMediosPago');
    cuerpoMediosPago.innerHTML = Object.keys(mediosPagoTotales).map(medio => `
        <tr>
            <td>${medio}</td>
            <td>$${mediosPagoTotales[medio].toFixed(2)}</td>
        </tr>
    `).join('');
}

async function cargarRegistroDiasLaborados(fechaInicial, fechaFinal) {
    const q = query(collection(db, "RegistroActividades"), where("fecha", ">=", fechaInicial), where("fecha", "<=", fechaFinal));
    const registros = await getDocs(q);
    
    const diasLaborados = [];
    let totalTiempoOcio = 0;
    let totalTiempoAlmuerzo = 0;

    registros.forEach(doc => {
        const data = doc.data();
        diasLaborados.push({
            fecha: data.fecha,
            horaSalida: data.horaSalida,
            horaFin: data.horaFin,
            horasTrabajadas: calcularHorasTrabajadas(data.horaSalida, data.horaFin, data.totalTiempoOcio, data.totalTiempoAlmuerzo)
        });
        totalTiempoOcio += data.totalTiempoOcio;
        totalTiempoAlmuerzo += data.totalTiempoAlmuerzo;
    });

    mostrarRegistroDiasLaborados(diasLaborados);
    mostrarResumenDiasLaborados(diasLaborados.length, totalTiempoOcio, totalTiempoAlmuerzo);
}

function mostrarRegistroDiasLaborados(diasLaborados) {
    const registroDiv = document.getElementById('registroDiasLaborados');
    registroDiv.innerHTML = diasLaborados.map(d => `
        <p>Fecha: ${d.fecha}, Hora Salida: ${d.horaSalida}, Hora Fin: ${d.horaFin}, Horas Laboradas: ${d.horasTrabajadas}</p>
    `).join('');
}

function mostrarResumenDiasLaborados(diasTrabajados, tiempoOcio, tiempoAlmuerzo) {
    document.getElementById('diasTrabajados').textContent = diasTrabajados;
    document.getElementById('tiempoOcio').textContent = `${tiempoOcio} min`;
    document.getElementById('tiempoAlmuerzo').textContent = `${tiempoAlmuerzo} min`;
}

function calcularHorasTrabajadas(horaSalida, horaFin, tiempoOcio, tiempoAlmuerzo) {
    const inicio = new Date(`1970-01-01T${horaSalida}:00`);
    const fin = new Date(`1970-01-01T${horaFin}:00`);
    const totalTrabajado = (fin - inicio) / 60000 - tiempoOcio - tiempoAlmuerzo; // en minutos
    const horas = Math.floor(totalTrabajado / 60);
    const minutos = totalTrabajado % 60;
    return `${horas}h ${minutos}m`;
}
