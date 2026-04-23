const fs = require("fs");
const path = require("path");

const Tienda = require("../models/tienda.model");

const rutaArchivo = path.join(__dirname, "../data/tiendas.json");
const rutaComercios = path.join(__dirname, "../data/comercios.json");


// LEER ARCHIVO
const leerTiendas = () => {
    const data = fs.readFileSync(rutaArchivo, "utf-8");
    return JSON.parse(data);
};


// GUARDAR ARCHIVO
const guardarTiendas = (tiendas) => {
    fs.writeFileSync(
        rutaArchivo,
        JSON.stringify(tiendas, null, 2)
    );
};


// GET ALL
const obtenerTiendas = (req, res) => {
    const tiendas = leerTiendas();
    res.json(tiendas);
};


// GET BY ID
const obtenerTiendaPorId = (req, res) => {

    const tiendas = leerTiendas();

    const id = parseInt(req.params.id);

    const tienda = tiendas.find(t => t.id === id);

    if (!tienda) {
        return res.status(404).json({
            mensaje: "Tienda no encontrada"
        });
    }

    res.json(tienda);
};


// CREATE
const crearTienda = (req, res) => {

    const tiendas = leerTiendas();

    const {
        nombre,
        comercio_id,
        ubicacion
    } = req.body;

    // VALIDAR COMERCIO EXISTENTE Y ACTIVO
    if (fs.existsSync(rutaComercios)) {

        const comercios = JSON.parse(
            fs.readFileSync(rutaComercios, "utf-8")
        );

        const comercio = comercios.find(
            c =>
                c.id === parseInt(comercio_id) &&
                c.estado === "Activo"
        );

        if (!comercio) {
            return res.status(400).json({
                mensaje: "El comercio indicado no existe o está inactivo"
            });
        }
    }

    const nuevoId =
        tiendas.length > 0
            ? tiendas[tiendas.length - 1].id + 1
            : 1;

    const nuevaTienda = new Tienda(
        nuevoId,
        nombre,
        parseInt(comercio_id),
        ubicacion,
        "Activa"
    );

    tiendas.push(nuevaTienda);

    guardarTiendas(tiendas);

    res.status(201).json({
        mensaje: "Tienda creada correctamente",
        tienda: nuevaTienda
    });
};


// UPDATE
const actualizarTienda = (req, res) => {

    const tiendas = leerTiendas();

    const id = parseInt(req.params.id);

    const tienda = tiendas.find(t => t.id === id);

    if (!tienda) {
        return res.status(404).json({
            mensaje: "Tienda no encontrada"
        });
    }

    const {
        nombre,
        comercio_id,
        ubicacion,
        estado
    } = req.body;

    // VALIDAR NUEVO COMERCIO SI VIENE EN REQUEST
    if (comercio_id) {

        const comercios = JSON.parse(
            fs.readFileSync(rutaComercios, "utf-8")
        );

        const comercio = comercios.find(
            c =>
                c.id === parseInt(comercio_id) &&
                c.estado === "Activo"
        );

        if (!comercio) {
            return res.status(400).json({
                mensaje: "El nuevo comercio indicado no existe o está inactivo"
            });
        }

        tienda.comercio_id = parseInt(comercio_id);
    }

    tienda.nombre = nombre ?? tienda.nombre;
    tienda.ubicacion = ubicacion ?? tienda.ubicacion;
    tienda.estado = estado ?? tienda.estado;

    guardarTiendas(tiendas);

    res.json({
        mensaje: "Tienda actualizada correctamente",
        tienda
    });
};


// DELETE (BAJA LOGICA)
const eliminarTienda = (req, res) => {

    const tiendas = leerTiendas();

    const id = parseInt(req.params.id);

    const tienda = tiendas.find(t => t.id === id);

    if (!tienda) {
        return res.status(404).json({
            mensaje: "Tienda no encontrada"
        });
    }

    tienda.estado = "Inactiva";

    guardarTiendas(tiendas);

    res.json({
        mensaje: "Tienda dada de baja correctamente",
        tienda
    });
};


module.exports = {
    obtenerTiendas,
    obtenerTiendaPorId,
    crearTienda,
    actualizarTienda,
    eliminarTienda
};