const fs = require("fs");
const path = require("path");

const Usuario = require("../models/usuario.model");

const rutaArchivo = path.join(__dirname, "../data/usuarios.json");


// LEER ARCHIVO
const leerUsuarios = () => {
    const data = fs.readFileSync(rutaArchivo, "utf-8");
    return JSON.parse(data);
};


// GUARDAR ARCHIVO
const guardarUsuarios = (usuarios) => {
    fs.writeFileSync(
        rutaArchivo,
        JSON.stringify(usuarios, null, 2)
    );
};


// GET ALL
const obtenerUsuarios = (req, res) => {
    const usuarios = leerUsuarios();
    res.json(usuarios);
};


// GET BY ID
const obtenerUsuarioPorId = (req, res) => {

    const usuarios = leerUsuarios();

    const id = parseInt(req.params.id);

    const usuario = usuarios.find(
        u => u.id === id
    );

    if (!usuario) {
        return res.status(404).json({
            mensaje: "Usuario no encontrado"
        });
    }

    res.json(usuario);
};


// CREATE
const crearUsuario = (req, res) => {

    const usuarios = leerUsuarios();

    const {
        nombre,
        email,
        rol,
        estado
    } = req.body;

    const nuevoId =
        usuarios.length > 0
            ? usuarios[usuarios.length - 1].id + 1
            : 1;

    const nuevoUsuario = new Usuario(
        nuevoId,
        nombre,
        email,
        rol || "Administrador",
        estado || "Activo"
    );

    usuarios.push(nuevoUsuario);

    guardarUsuarios(usuarios);

    res.status(201).json({
        mensaje: "Usuario creado correctamente",
        usuario: nuevoUsuario
    });
};


// UPDATE
const actualizarUsuario = (req, res) => {

    const usuarios = leerUsuarios();

    const id = parseInt(req.params.id);

    const usuario = usuarios.find(
        u => u.id === id
    );

    if (!usuario) {
        return res.status(404).json({
            mensaje: "Usuario no encontrado"
        });
    }

    const {
        nombre,
        email,
        rol,
        estado
    } = req.body;

    usuario.nombre =
        nombre ?? usuario.nombre;

    usuario.email =
        email ?? usuario.email;

    usuario.rol =
        rol ?? usuario.rol;

    usuario.estado =
        estado ?? usuario.estado;

    guardarUsuarios(usuarios);

    res.json({
        mensaje: "Usuario actualizado correctamente",
        usuario
    });
};


// DELETE (BAJA LOGICA)
const eliminarUsuario = (req, res) => {

    const usuarios = leerUsuarios();

    const id = parseInt(req.params.id);

    const usuario = usuarios.find(
        u => u.id === id
    );

    if (!usuario) {
        return res.status(404).json({
            mensaje: "Usuario no encontrado"
        });
    }

    usuario.estado = "Inactivo";

    guardarUsuarios(usuarios);

    res.json({
        mensaje: "Usuario dado de baja correctamente",
        usuario
    });
};


module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
};