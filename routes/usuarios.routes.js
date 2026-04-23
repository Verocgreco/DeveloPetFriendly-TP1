const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/usuarios.controller.js");

// GET ALL
router.get("/", usuarioController.obtenerUsuarios);

// GET BY ID
router.get("/:id", usuarioController.obtenerUsuarioPorId);

// CREATE
router.post("/", usuarioController.crearUsuario);

// UPDATE
router.put("/:id", usuarioController.actualizarUsuario);

// DELETE (baja lógica)
router.delete("/:id", usuarioController.eliminarUsuario);

module.exports = router;