const fs = require("fs");
const path = require("path");

const Comercio = require("../models/comercio.model");

const rutaArchivo = path.join(__dirname, "../data/comercios.json");
const rutaTiendas = path.join(__dirname, "../data/tiendas.json");


// FUNCION LEER ARCHIVO
const leerComercios = () => {
    const data = fs.readFileSync(rutaArchivo, "utf-8");
    return JSON.parse(data);
};


// FUNCION GUARDAR ARCHIVO
const guardarComercios = (comercios) => {
    fs.writeFileSync(
        rutaArchivo,
        JSON.stringify(comercios, null, 2)
    );
};


// GET ALL
const obtenerComercios = (req, res) => {
    const comercios = leerComercios();
    res.json(comercios);
};

const obtenerComerciosVista = (req, res) => {
    const comercios = leerComercios();
    res.render("comercios/list", { comercios });
};


// GET BY ID
const obtenerComercioPorId = (req, res) => {
    const comercios = leerComercios();

    const id = parseInt(req.params.id);

    const comercio = comercios.find(c => c.id === id);

    if (!comercio) {
        return res.status(404).json({
            mensaje: "Comercio no encontrado"
        });
    }

    res.json(comercio);
};

const obtenerComercioVista = (req, res) => {
    const comercios = leerComercios();

    const id = parseInt(req.params.id);
    const comercio = comercios.find(c => c.id === id);

    if (!comercio) {
        return res.status(404).send("Comercio no encontrado");
    }

    res.render("comercios/detail", { comercio });
};


// CREATE
const crearComercio = (req, res) => {

    const comercios = leerComercios();

    const nuevoId =
        comercios.length > 0
            ? comercios[comercios.length - 1].id + 1
            : 1;

    const {
        nombre_comercio,
        cuit,
        email_contacto,
        plan_suscripcion,
        comision_variable,
        estado
    } = req.body;

    const nuevoComercio = new Comercio(
        nuevoId,
        nombre_comercio,
        cuit,
        email_contacto,
        plan_suscripcion,
        comision_variable,
        estado || "Activo"
    );

    comercios.push(nuevoComercio);

    guardarComercios(comercios);

    res.status(201).json({
        mensaje: "Comercio creado correctamente",
        comercio: nuevoComercio
    });
};

const formularioNuevoComercio = (req, res) => {
    res.render("comercios/form");
};




// UPDATE
const actualizarComercio = (req, res) => {

    const comercios = leerComercios();

    const id = parseInt(req.params.id);

    const comercio = comercios.find(c => c.id === id);

    if (!comercio) {
        return res.status(404).json({
            mensaje: "Comercio no encontrado"
        });
    }

    const {
        nombre_comercio,
        cuit,
        email_contacto,
        plan_suscripcion,
        comision_variable,
        estado
    } = req.body;

    comercio.nombre_comercio = nombre_comercio ?? comercio.nombre_comercio;
    comercio.cuit = cuit ?? comercio.cuit;
    comercio.email_contacto = email_contacto ?? comercio.email_contacto;
    comercio.plan_suscripcion = plan_suscripcion ?? comercio.plan_suscripcion;
    comercio.comision_variable = comision_variable ?? comercio.comision_variable;
    comercio.estado = estado ?? comercio.estado;

    guardarComercios(comercios);

    res.json({
        mensaje: "Comercio actualizado correctamente",
        comercio
    });
};


// DELETE (BAJA LOGICA)
const eliminarComercio = (req, res) => {

    const comercios = leerComercios();

    const id = parseInt(req.params.id);

    const comercio = comercios.find(c => c.id === id);

    if (!comercio) {
        return res.status(404).json({
            mensaje: "Comercio no encontrado"
        });
    }

    // VALIDAR TIENDAS ACTIVAS
    if (fs.existsSync(rutaTiendas)) {

        const tiendas = JSON.parse(
            fs.readFileSync(rutaTiendas, "utf-8")
        );

        const tieneTiendasActivas = tiendas.some(
            t => t.comercio_id === id && t.estado === "Activa"
        );

        if (tieneTiendasActivas) {
            return res.status(400).json({
                mensaje: "No se puede desactivar el comercio porque tiene tiendas activas"
            });
        }
    }

    comercio.estado = "Inactivo";

    guardarComercios(comercios);

    res.json({
        mensaje: "Comercio dado de baja correctamente",
        comercio
    });
};


module.exports = {
    obtenerComercios,
    obtenerComercioPorId,
    crearComercio,
    actualizarComercio,
    eliminarComercio,
    obtenerComercioVista,
    obtenerComerciosVista,
    formularioNuevoComercio

};