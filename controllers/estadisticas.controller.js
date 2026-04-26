const fs = require("fs");
const path = require("path");

// Ruta al archivo de transacciones
const rutaTransacciones = path.join(__dirname, "../data/transacciones.json");

const obtenerReporteHotSale = (req, res) => {
    try {
        // 1. Leemos el archivo de transacciones
        const data = fs.readFileSync(rutaTransacciones, "utf-8");
        const transacciones = JSON.parse(data);

        // 2. Variables para acumular los cálculos
        let volumenMovido = 0;
        let gananciaPlataforma = 0;
        let cantidadInconsistencias = 0;

        // 3. Recorremos todas las ventas para hacer las sumas
        transacciones.forEach(venta => {
            // Sumamos el volumen total
            volumenMovido += venta.monto_total;
            
            // Sumamos la ganancia de la plataforma sacándola del objeto split_pagos
            if (venta.split_pagos && venta.split_pagos.comision_techretail) {
                gananciaPlataforma += venta.split_pagos.comision_techretail;
            }

            // Contamos cuántas fallaron en la pasarela
            if (venta.estado_conciliacion === "Inconsistencia Detectada") {
                cantidadInconsistencias++;
            }
        });

        // 4. Calculamos la Tasa de Error en porcentaje
        const ventasTotales = transacciones.length;
        let tasaError = "0.00%";
        if (ventasTotales > 0) {
            tasaError = ((cantidadInconsistencias / ventasTotales) * 100).toFixed(2) + "%";
        }

        // 5. Armamos el objeto final del reporte
        const reporte = {
            evento: "Campaña Hot Sale - TechRetail Solutions",
            ventas_totales: ventasTotales,
            volumen_movido: `$${volumenMovido.toFixed(2)}`,
            ganancia_plataforma: `$${gananciaPlataforma.toFixed(2)}`,
            tasa_de_error: tasaError,
            estado_del_sistema: cantidadInconsistencias > 0 ? "Alerta: Revisar Pasarela" : "Operando con normalidad"
        };

        // Devolvemos el reporte exitoso
        res.status(200).json(reporte);

    } catch (error) {
        //  Imprimimos el error real en la consola para saber qué falló
        console.log("Error detallado en el backend:", error);
        res.status(500).json({ 
            mensaje: "Error al generar el reporte", 
            detalle: error.message 
        });
    }
};

module.exports = { obtenerReporteHotSale };