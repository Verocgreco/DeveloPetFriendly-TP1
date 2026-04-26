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

const leerComercios = () => { 
    const data = fs.readFileSync(rutaComercios, "utf-8"); 
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
    // A. Traemos todos los comercios a la memoria
    const comercios = leerComercios();

    // B. Convertimos el ID que llega de Thunder Client a número
    const idComercioBuscado = parseInt(req.body.id_comercio);

    // C. Validamos si el comercio realmente existe
    const comercioExiste = comercios.find(c => c.id === idComercioBuscado);

    if (!comercioExiste) {
        return res.status(400).json({ error: "El comercio indicado no existe" });
    }

    // D. Si existe, procedemos a crear la tienda
    const tiendas = leerTiendas();
    const nuevaTienda = new Tienda(
        tiendas.length > 0 ? tiendas[tiendas.length - 1].id + 1 : 1,
        req.body.nombre_sucursal,
        idComercioBuscado, // Usamos el ID numérico validado
        req.body.ubicacion
    );

    tiendas.push(nuevaTienda);
    guardarTiendas(tiendas);

    res.status(201).json(nuevaTienda);
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