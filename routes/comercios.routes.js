const express = require("express");
const router = express.Router();

const comercioController = require("../controllers/comercios.controller.js");

// ---------- VISTAS PUG ----------
router.get("/vista", comercioController.obtenerComerciosVista);
router.get("/nuevo", comercioController.formularioNuevoComercio);
router.get("/vista/:id", comercioController.obtenerComercioVista);

// ---------- API JSON ----------
router.get("/", comercioController.obtenerComercios);
router.get("/:id", comercioController.obtenerComercioPorId);
router.post("/", comercioController.crearComercio);
router.put("/:id", comercioController.actualizarComercio);
router.delete("/:id", comercioController.eliminarComercio);

module.exports = router;