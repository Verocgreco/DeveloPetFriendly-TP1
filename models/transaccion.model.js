class Transaccion {
    constructor(
        id,
        tienda_id,
        comercio_id,
        fecha,
        monto_total,
        monto_informado_pasarela,
        split_pagos,
        estado_conciliacion,
        observacion
    ) {
        this.id = id;
        this.tienda_id = tienda_id;
        this.comercio_id = comercio_id;
        this.fecha = fecha;
        this.monto_total = monto_total;
        this.monto_informado_pasarela = monto_informado_pasarela;
        this.split_pagos = split_pagos;
        this.estado_conciliacion = estado_conciliacion;
        this.observacion = observacion;
    }
}

module.exports = Transaccion;