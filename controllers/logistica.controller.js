const fs = require("fs");
const path = require("path");

const Logistica = require("../models/logistica.model");

const rutaArchivo = path.join(__dirname, "../data/logistica.json");
const rutaTransacciones = path.join(__dirname, "../data/transacciones.json");


// LEER ARCHIVO
const leerOperaciones = () => {
    const data = fs.readFileSync(rutaArchivo, "utf-8");
    return JSON.parse(data);
};


// GUARDAR ARCHIVO
const guardarOperaciones = (operaciones) => {
    fs.writeFileSync(
        rutaArchivo,
        JSON.stringify(operaciones, null, 2)
    );
};


// GET ALL
const obtenerLogistica = (req, res) => {
    const operaciones = leerOperaciones();
    res.json(operaciones);
};


// GET BY ID
const obtenerOperacionPorId = (req, res) => {

    const operaciones = leerOperaciones();

    const id = parseInt(req.params.id);

    const operacion = operaciones.find(o => o.id === id);

    if (!operacion) {
        return res.status(404).json({
            mensaje: "Operación logística no encontrada"
        });
    }

    res.json(operacion);
};


// CREATE
const crearOperacion = (req, res) => {

    const operaciones = leerOperaciones();

    const {
        transaccion_id,
        empresa_transporte,
        direccion_destino
    } = req.body;

    // VALIDAR TRANSACCION EXISTENTE
    if (fs.existsSync(rutaTransacciones)) {

        const transacciones = JSON.parse(
            fs.readFileSync(rutaTransacciones, "utf-8")
        );

        const existe = transacciones.find(
            t => t.id === parseInt(transaccion_id)
        );

        if (!existe) {
            return res.status(400).json({
                mensaje: "La transacción indicada no existe"
            });
        }
    }

    const nuevoId =
        operaciones.length > 0
            ? operaciones[operaciones.length - 1].id + 1
            : 1;

    const nuevaOperacion = new Logistica(
        nuevoId,
        parseInt(transaccion_id),
        "Pendiente de despacho",
        empresa_transporte || "Logística General",
        direccion_destino,
        new Date().toISOString()
    );

    operaciones.push(nuevaOperacion);

    guardarOperaciones(operaciones);

    res.status(201).json({
        mensaje: "Operación logística creada correctamente",
        logistica: nuevaOperacion
    });
};


// UPDATE
const actualizarOperacion = (req, res) => {

    const operaciones = leerOperaciones();

    const id = parseInt(req.params.id);

    const operacion = operaciones.find(o => o.id === id);

    if (!operacion) {
        return res.status(404).json({
            mensaje: "Operación logística no encontrada"
        });
    }

    const {
        estado_envio,
        empresa_transporte,
        direccion_destino
    } = req.body;

    operacion.estado_envio = estado_envio ?? operacion.estado_envio;
    operacion.empresa_transporte = empresa_transporte ?? operacion.empresa_transporte;
    operacion.direccion_destino = direccion_destino ?? operacion.direccion_destino;

    guardarOperaciones(operaciones);

    res.json({
        mensaje: "Operación logística actualizada correctamente",
        logistica: operacion
    });
};


// DELETE
const eliminarOperacion = (req, res) => {

    const operaciones = leerOperaciones();

    const id = parseInt(req.params.id);

    const nuevasOperaciones = operaciones.filter(
        o => o.id !== id
    );

    if (operaciones.length === nuevasOperaciones.length) {
        return res.status(404).json({
            mensaje: "Operación logística no encontrada"
        });
    }

    guardarOperaciones(nuevasOperaciones);

    res.json({
        mensaje: "Operación logística eliminada correctamente"
    });
};


module.exports = {
    obtenerLogistica,
    obtenerOperacionPorId,
    crearOperacion,
    actualizarOperacion,
    eliminarOperacion
};