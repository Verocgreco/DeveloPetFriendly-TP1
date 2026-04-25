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
    try {
        // 1. Leemos el archivo de transacciones para hacer la validación
        const dataTransacciones = fs.readFileSync(rutaTransacciones, "utf-8");
        const transacciones = JSON.parse(dataTransacciones);

        // 2. Convertimos el dato que llega a número con parseInt
        const idTransaccionBuscado = parseInt(req.body.id_transaccion);

        // 3. Buscamos si la transacción realmente existe
        const transaccionExiste = transacciones.find(t => t.id === idTransaccionBuscado);

        if (!transaccionExiste) {
            // Si NO existe, bloqueamos la acción y devolvemos 400 Bad Request
            return res.status(400).json({ error: "La transacción indicada no existe" });
        }

        // 4. Si la transacción SÍ existe, continuamos con la creación del envío
        const operaciones = leerOperaciones();
        const nuevoId = operaciones.length > 0 ? operaciones[operaciones.length - 1].id + 1 : 1;

        // Instanciamos el objeto usando la clase Logistica
        const nuevaOperacion = new Logistica(
            nuevoId,
            idTransaccionBuscado,
            req.body.empresa_transporte,
            req.body.direccion_destino
        );

        operaciones.push(nuevaOperacion);
        guardarOperaciones(operaciones); // Guardamos en logistica.json

        // 5. Devolvemos el código de éxito
        res.status(201).json(nuevaOperacion);

    } catch (error) {
        res.status(500).json({ error: "Error interno al crear el registro de logística" });
    }
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