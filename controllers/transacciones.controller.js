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

//leer tiendas
const leerTiendas = () => { 
    const data = fs.readFileSync(rutaTiendas, "utf-8"); 
    return JSON.parse(data); 
};

// GUARDAR ARCHIVO
const guardarTransacciones = (transacciones) => {
    fs.writeFileSync(
        rutaArchivo,
        JSON.stringify(transacciones, null, 2)
    );
};


// GET ALL
const obtenerTransacciones = (req, res) => {
    const transacciones = leerTransacciones();
    res.json(transacciones);
};


// GET BY ID
const obtenerTransaccionPorId = (req, res) => {

    const transacciones = leerTransacciones();

    const id = parseInt(req.params.id);

    const transaccion = transacciones.find(t => t.id === id);

    if (!transaccion) {
        return res.status(404).json({
            mensaje: "Transacción no encontrada"
        });
    }

    res.json(transaccion);
};


// CREATE
const crearTransaccion = (req, res) => {
    // 1. Traemos las tiendas a la memoria y validamos
    const tiendas = leerTiendas();
    const idTiendaBuscada = parseInt(req.body.id_tienda);
    const tiendaExiste = tiendas.find(t => t.id === idTiendaBuscada);

    if (!tiendaExiste) {
        return res.status(400).json({ error: "La tienda indicada no existe en el sistema" });
    }

    // 2. LÓGICA DE CONCILIACIÓN Y OBSERVACIÓN DINÁMICA
    const montoTotalReal = parseFloat(req.body.monto_total);
    const montoPasarela = parseFloat(req.body.monto_informado_pasarela);
    
    let estadoConciliacionCalculado = "Pendiente";
    let observacionCalculada = "Sin observaciones";

    if (montoTotalReal === montoPasarela) {
        estadoConciliacionCalculado = "Conciliado OK";
        observacionCalculada = "Sin diferencias en el flujo monetario";
    } else {
        estadoConciliacionCalculado = "Inconsistencia Detectada";
        // Calculamos la diferencia y el porcentaje de error
        const diferencia = Math.abs(montoTotalReal - montoPasarela);
        const porcentajeError = ((diferencia / montoTotalReal) * 100).toFixed(2);
        
        observacionCalculada = `Alerta: La pasarela informó una diferencia de $${diferencia} (${porcentajeError}%)`;
    }

    // ⭐ 3. LÓGICA DEL SPLIT DE PAGOS (5% de comisión)
    const porcentajeComision = 0.05; 
    const comisionTechretail = parseFloat((montoTotalReal * porcentajeComision).toFixed(2));
    const ingresoComercio = parseFloat((montoTotalReal - comisionTechretail).toFixed(2));

    // Armamos el objeto tal como lo espera tu JSON
    const splitPagosCalculado = {
        comision_techretail: comisionTechretail,
        ingreso_comercio: ingresoComercio
    };

    // 4. CREACIÓN DE LA TRANSACCIÓN
    const transacciones = leerTransacciones();
    
    const nuevaTransaccion = new Transaccion(
        transacciones.length > 0 ? transacciones[transacciones.length - 1].id + 1 : 1, // 1. id
        idTiendaBuscada, // 2. tienda_id 
        parseInt(req.body.comercio_id), // 3. comercio_id 
        req.body.fecha || new Date().toISOString(), // 4. fecha 
        montoTotalReal, // 5. monto_total
        montoPasarela, // 6. monto_informado_pasarela
        splitPagosCalculado, // 7. ⭐ Pasamos el OBJETO matemático
        estadoConciliacionCalculado, // 8. ⭐ Pasamos el ESTADO calculado
        observacionCalculada // 9. ⭐ Pasamos el TEXTO de alerta
    );

    transacciones.push(nuevaTransaccion);
    guardarTransacciones(transacciones);

    res.status(201).json(nuevaTransaccion);
};
// UPDATE
const actualizarTransaccion = (req, res) => {

    const transacciones = leerTransacciones();

    const id = parseInt(req.params.id);

    const transaccion = transacciones.find(
        t => t.id === id
    );

    if (!transaccion) {
        return res.status(404).json({
            mensaje: "Transacción no encontrada"
        });
    }

    const {
        estado_conciliacion,
        observacion
    } = req.body;

    transaccion.estado_conciliacion =
        estado_conciliacion ??
        transaccion.estado_conciliacion;

    transaccion.observacion =
        observacion ??
        transaccion.observacion;

    guardarTransacciones(transacciones);

    res.json({
        mensaje: "Transacción actualizada correctamente",
        transaccion
    });
};


// DELETE
const eliminarTransaccion = (req, res) => {

    const transacciones = leerTransacciones();

    const id = parseInt(req.params.id);

    const nuevasTransacciones =
        transacciones.filter(
            t => t.id !== id
        );

    if (
        nuevasTransacciones.length ===
        transacciones.length
    ) {
        return res.status(404).json({
            mensaje: "Transacción no encontrada"
        });
    }

    guardarTransacciones(
        nuevasTransacciones
    );

    res.json({
        mensaje: "Transacción eliminada correctamente"
    });
};


module.exports = {
    obtenerTransacciones,
    obtenerTransaccionPorId,
    crearTransaccion,
    actualizarTransaccion,
    eliminarTransaccion
};