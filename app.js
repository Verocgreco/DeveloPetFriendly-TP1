const express = require("express");
const app = express();

// IMPORTACIÓN DE RUTAS
const comerciosRoutes = require("./routes/comercios.routes");
const tiendasRoutes = require("./routes/tiendas.routes");
const transaccionesRoutes = require("./routes/transacciones.routes");
const estadisticasRoutes = require("./routes/estadisticas.routes");
const logisticaRoutes = require("./routes/logistica.routes");
const usuariosRoutes = require("./routes/usuarios.routes");

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CONFIGURACIÓN DE PUG
app.set("view engine", "pug");
app.set("views", "./views");

// RUTA PRINCIPAL
app.get("/", (req, res) => {
    res.render("index");
});

// RUTAS DEL SISTEMA
app.use("/comercios", comerciosRoutes);
app.use("/tiendas", tiendasRoutes);
app.use("/transacciones", transaccionesRoutes);
app.use("/estadisticas", estadisticasRoutes);
app.use("/logistica", logisticaRoutes);
app.use("/usuarios", usuariosRoutes);

// PUERTO
const PORT = 8000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});