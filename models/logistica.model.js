class Logistica {
    constructor(
        id,
        transaccion_id,
        estado_envio,
        empresa_transporte,
        direccion_destino,
        fecha_creacion
    ) {
        this.id = id;
        this.transaccion_id = transaccion_id;
        this.estado_envio = estado_envio;
        this.empresa_transporte = empresa_transporte;
        this.direccion_destino = direccion_destino;
        this.fecha_creacion = fecha_creacion;
    }
}

module.exports = Logistica;