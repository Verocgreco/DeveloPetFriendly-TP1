const fs = require("fs"); 
const path = require("path");

const Transaccion = require("../models/transaccion.model");

const rutaArchivo = path.join(__dirname, "../data/transacciones.json"); 
const rutaTiendas = path.join(__dirname, "../data/tiendas.json"); 
const rutaComercios = path.join(__dirname, "../data/comercios.json");

// LEER ARCHIVO 
const leerTransacciones = () => { 
    const data = fs.readFileSync(rutaArchivo, "utf-8"); 
    return JSON.parse(data); 
};

// leer tiendas 
const leerTiendas = () => { 
    const data = fs.readFileSync(rutaTiendas, "utf-8"); 
    return JSON.parse(data); 
};

// GUARDAR ARCHIVO 
const guardarTransacciones = (transacciones) => { 
    fs.writeFileSync(rutaArchivo, JSON.stringify(transacciones, null, 2)); 
};

// GET ALL 
const obtenerTransacciones = (req, res) => { 
    const transacciones = leerTransacciones(); 
    res.json(transacciones); 
};

// GET BY ID 
const obtenerTransaccionPorId = (req, res) => {

};

// CREATE 
const crearTransaccion = (req, res) => { 
    // 1. Traemos las tiendas a la memoria y validamos
    const tiendas = leerTiendas(); 
    const idTiendaBuscada = parseInt(req.body.id_tienda); 
    const tiendaExiste = tiendas.find(t => t.id === idTiendaBuscada);

    // Si la tienda no existe, frenamos todo
    if (!tiendaExiste) {
        return res.status(400).json({ error: "La tienda indicada no existe en el sistema" });
    }

    // ⭐ 2. INTERACCIÓN ENTRE MÓDULOS: Extraemos el comercio_id directamente de la tienda
    const idComercioAsociado = tiendaExiste.comercio_id || tiendaExiste.id_comercio;

    // 3. Lógica de conciliación y observación
    const montoTotalReal = parseFloat(req.body.monto_total);
    const montoPasarela = parseFloat(req.body.monto_informado_pasarela);

    let estadoConciliacionCalculado = "Pendiente";
    let observacionCalculada = "Sin observaciones";

    if (montoTotalReal === montoPasarela) {
        estadoConciliacionCalculado = "Conciliado OK";
        observacionCalculada = "Sin diferencias en el flujo monetario";
    } else {
        estadoConciliacionCalculado = "Inconsistencia Detectada";
        const diferencia = Math.abs(montoTotalReal - montoPasarela);
        const porcentajeError = ((diferencia / montoTotalReal) * 100).toFixed(2);
        observacionCalculada = `Alerta: La pasarela informó una diferencia de $${diferencia} (${porcentajeError}%)`;
    }

    // 4. Lógica del split de pagos (5% comisión)
    const porcentajeComision = 0.05;
    const comisionTechretail = parseFloat((montoTotalReal * porcentajeComision).toFixed(2));
    const ingresoComercio = parseFloat((montoTotalReal - comisionTechretail).toFixed(2));

    const splitPagosCalculado = {
        comision_techretail: comisionTechretail,
        ingreso_comercio: ingresoComercio
    };

    // 5. Creación de la nueva transacción
    const transacciones = leerTransacciones();
    
    const nuevaTransaccion = new Transaccion(
        transacciones.length > 0 ? transacciones[transacciones.length - 1].id + 1 : 1, // ID autoincremental
        idTiendaBuscada, // ID de la tienda (enviado por Thunder Client)
        idComercioAsociado, // ⭐ ID del comercio (obtenido automáticamente, ya no da null)
        req.body.fecha || new Date().toISOString(), // Fecha
        montoTotalReal, // Monto total
        montoPasarela, // Monto informado por pasarela
        splitPagosCalculado, // Objeto con el split
        estadoConciliacionCalculado, // Estado calculado
        observacionCalculada // Texto de observación
    );

    transacciones.push(nuevaTransaccion);
    guardarTransacciones(transacciones);

    res.status(201).json(nuevaTransaccion);
}; 

// UPDATE 
const actualizarTransaccion = (req, res) => {

};

// DELETE 
const eliminarTransaccion = (req, res) => {

};

module.exports = { 
    obtenerTransacciones, 
    obtenerTransaccionPorId, 
    crearTransaccion, 
    actualizarTransaccion, 
    eliminarTransaccion 
};