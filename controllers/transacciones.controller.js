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

    const transacciones = leerTransacciones();

    const {
        tienda_id,
        monto_total,
        monto_informado_pasarela
    } = req.body;

    // VALIDAR TIENDA
    const tiendas = JSON.parse(
        fs.readFileSync(rutaTiendas, "utf-8")
    );

    const tienda = tiendas.find(
        t =>
            t.id === parseInt(tienda_id) &&
            t.estado === "Activa"
    );

    if (!tienda) {
        return res.status(400).json({
            mensaje: "La tienda indicada no existe o está inactiva"
        });
    }

    // VALIDAR COMERCIO
    const comercios = JSON.parse(
        fs.readFileSync(rutaComercios, "utf-8")
    );

    const comercio = comercios.find(
        c =>
            c.id === parseInt(tienda.comercio_id) &&
            c.estado === "Activo"
    );

    if (!comercio) {
        return res.status(400).json({
            mensaje: "El comercio asociado no existe o está inactivo"
        });
    }

    const montoTotal = parseFloat(monto_total);
    const montoPasarela = parseFloat(monto_informado_pasarela);
    const comision = parseFloat(comercio.comision_variable);

    const montoTechRetail = montoTotal * comision;
    const montoComercio = montoTotal - montoTechRetail;

    let estadoConciliacion = "Conciliado OK";
    let observacion = "Sin diferencias en el flujo monetario";

    if (montoTotal !== montoPasarela) {

        const diferencia = montoTotal - montoPasarela;
        const porcentaje =
            (diferencia / montoTotal) * 100;

        estadoConciliacion = "Inconsistencia Detectada";
        observacion =
            `Alerta: La pasarela informó una diferencia de $${diferencia} (${porcentaje.toFixed(2)}%)`;
    }

    const nuevoId =
        transacciones.length > 0
            ? transacciones[transacciones.length - 1].id + 1
            : 1;

    const nuevaTransaccion = new Transaccion(
        nuevoId,
        tienda.id,
        comercio.id,
        new Date().toISOString(),
        montoTotal,
        montoPasarela,
        {
            comision_techretail: montoTechRetail,
            ingreso_comercio: montoComercio
        },
        estadoConciliacion,
        observacion
    );

    transacciones.push(nuevaTransaccion);

    guardarTransacciones(transacciones);

    res.status(201).json({
        mensaje: "Transacción registrada correctamente",
        transaccion: nuevaTransaccion
    });
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