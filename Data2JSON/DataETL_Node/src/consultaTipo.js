/*
 * Autor: Jesús Lizama
 * Fecha Última Modificación: 5 de noviembre de 2024
 * Nombre del archivo: consultaTipo.js
 * Descripción: Este archivo contiene funciones para ejecutar consultas SQL
 * sobre diversas tablas relacionadas con SGP de instancias de Datos Básicos.
 * Los mapeos de tipos básicos y tablas específicas fueron separados en un archivo aparte.
*/

const { executeQuery_ID_DATO_BASICO, extraerMapeo } = require('./queryExecutor');
const winston = require('../winston/logger');

const tipoBasicoTablas = {
    1: "SGP_DATOTEXTO",
    2: "SGP_DATOTEXTOGRANDE",
    3: "SGP_DATOENTERO",
    4: "SGP_DATOREAL",
    5: "SGP_DATOFECHA",
    6: executeTipoEstructurado,
    7: "SGP_DATOCODIGO",
    8: executeTipoSelect,
    11: executeTipoSelect,
    12: executeTipoSelect,
    13: executeTipoSelect,
    15: "SGP_DATOCHECKBOX",
    22: "SGP_DATOFECHA",
    106: "SGP_DIAGNOSTICOS",
//    107: "SGP_DATOCATALOGO",
    107: executeTipoCatalogo,
    108: executeTipoTablaFila,
    109: executeTipoPlantillaDependiente,
    110: "SGP_DATOREFERENCIA",
    111: "SGP_DATOREFERENCIA",
    116: "SGP_DIAGNOSTICOS",
    126: "SGP_DIAGNOSTICOS"
};

/**
 * Relación de tablas específicas para tipos estructurados.
 */
const datoBasicoTablas = {
    10: "SGP_ALERGIAS",
    19: executeTipoVacunas,
    161: "SGP_DIAGNOSTICOS"
    // Falta el id_datoBasico = 171
};



const datoBasicoCatalogo = {
    27: executeTipoVacunas
}



/**
 * Función principal para realizar consultas basadas en el tipo básico de dato.
 * Dependiendo del valor de 'tipoBasico', se ejecuta una consulta en diferentes tablas
 * y se devuelve el resultado correspondiente.
 *
 * @param {object} client - Objeto de cliente de base de datos.
 * @param {number} pcia - Identificador de provincia.
 * @param {number} idInstancia - Identificador de la instancia del dato básico.
 * @param {number} tipoBasico - Tipo básico del dato.
 * @returns {Promise<object|string>} - Resultado de la consulta o mensaje de error.
 */
async function consultaPorTIPO_BASICO(client, pcia, idInstancia, tipoBasico) {
    tipoBasico = parseInt(tipoBasico, 10);

    // Verificar si el tipo básico existe en el mapeo
    if (tipoBasico in tipoBasicoTablas) {
        const tableName = tipoBasicoTablas[tipoBasico]; // Obtener el nombre de la tabla o la función

        // Ejecutar la consulta correspondiente según el tipo
        if (typeof tableName === 'string') {
            return await executeQuery(client, tableName, pcia, idInstancia);
        
        } else if (typeof tableName === 'function') {
            return await tableName(client, pcia, idInstancia);
            
        } else {
            winston.error(`[TYPEQUERY] Tipo no reconocido para el tipo básico: ${tipoBasico}`);
        }
    } else {
        winston.warn(`[TYPEQUERY] No hay consulta definida para el tipo básico: ${tipoBasico}, con idInstancia: 
            ${idInstancia} y PCIA: ${pcia}`);
    }

    return ""; 
}

/**
 * Función específica para ejecutar consultas relacionadas con el tipo estructurado (tipo 6).
 * Según el 'idDatoBasico', ejecuta una consulta en una tabla mapeada o devuelve un mensaje de error.
 *
 * @param {object} client - Objeto de cliente de base de datos.
 * @param {number} pcia - Identificador de provincia.
 * @param {number} idInstancia - Identificador de la instancia del dato básico.
 * @returns {Promise<object|string>} - Resultado de la consulta o mensaje de error.
 */
async function executeTipoEstructurado(client, pcia, idInstancia) {
    
    const idDatoBasico = await executeQuery_ID_DATO_BASICO(client, pcia, idInstancia);
    const nIdDatoBasico = parseInt(idDatoBasico, 10);


    // Verificar si el dato básico existe en el mapeo
    if (nIdDatoBasico in datoBasicoTablas) {
        const tableName = datoBasicoTablas[nIdDatoBasico]; // Obtener el nombre de la tabla o función

        // Ejecutar la consulta correspondiente según el tipo
        if (typeof tableName === 'string') {
            // Si es una cadena, ejecuta la consulta directamente
            return await executeQuery(client, tableName, pcia, idInstancia);
        
        } else if (typeof tableName === 'function') {
            // Si es una función, ejecútala
            return await tableName(client, pcia, idInstancia);
        
        } else {
            winston.error(`[TYPEQUERY] Tipo no reconocido para el dato básico: ${idDatoBasico}`);
            return "";
        }
    } else {
        winston.warn(`[TYPEQUERY] No hay consulta definida para el dato básico: ${JSON.stringify(idDatoBasico)} en instancia ${idInstancia}`);
        return "";
    }

}

/**
 * Función para ejecutar una consulta y obtener mapeo de valores adicionales en el caso de tipo 13.
 * @param {object} client - Objeto de cliente de base de datos.
 * @param {number} pcia - Identificador de provincia.
 * @param {number} idInstancia - Identificador de la instancia del dato básico.
 * @returns {Promise<object[]>} - Resultado del mapeo completo con nombres y descripciones.
 */
async function executeTipoSelect(client, pcia, idInstancia) {
    let resultado = await executeQuery(client, "SGP_DATOSELECT", pcia, idInstancia);
    let mapeo = await extraerMapeo(client, resultado[0].ID_LISTA, resultado[0].VALOR);

    // Concatenación y devolución del conjunto completo
    let conjuntoCompleto = {
        ...resultado[0],
        NOMBRE_LISTA: mapeo.nombreLista,
        DESCRIPCION_VALOR: mapeo.descripcionValor
    };

    return [conjuntoCompleto];
}

/**
 * Función para manejar el tipo 108 (tipo tabla fila).
 * Esta función retorna una explicación sobre el comportamiento para este tipo básico.
 *
 * @returns {string} - Mensaje informativo.
 */
async function executeTipoTablaFila() {
    return "Para el tipo_basico = 108 no hay que hacer nada porque" 
         + "es elemento visual de agrupacion de instancias de datos básico";
}

/**
 * Función para ejecutar consultas relacionadas con el tipo plantilla dependiente (tipo 109).
 * Filtra el campo 'ID_INST_PLANTILLA' y devuelve los otros campos de cada fila.
 *
 * @param {object} client - Objeto de cliente de base de datos.
 * @param {number} pcia - Identificador de provincia.
 * @param {number} idInstancia - Identificador de la instancia del dato básico.
 * @returns {Promise<object[]>} - Resultado de la consulta con campos filtrados.
 */
async function executeTipoPlantillaDependiente(client, pcia, idInstancia) {
    let resultado = await executeQuery(client, "SGP_DATOPLANTDEPEND", pcia, idInstancia);

    // Filtrar los datos para excluir la columna 'ID_INST_PLANTILLA'
    let vectorFiltrado = resultado.map(row => {
        let { ID_INST_PLANTILLA, ...restoComponentes } = row;
        return restoComponentes;
    });

    return vectorFiltrado;
}


/**
 * Función para manejar consultas específicas para el tipo básico 19 (SGP_VACUNAS).
 * Ejecuta la consulta en SGP_VACUNAS y luego realiza consultas adicionales
 * en AUX_CODIF_VACUNAS, HCE_REL_VACUNAS_ENFERMEDAD y HC_LOTES_VACUNAS
 * para consolidar toda la información relevante.
 *
 * @param {object} client - Objeto de cliente de base de datos.
 * @param {number} pcia - Identificador de provincia.
 * @param {number} idInstancia - Identificador de la instancia del dato básico.
 * @returns {Promise<object[]>} - Resultado consolidado de todas las consultas.
 */
async function executeTipoVacunas(client, pcia, idInstancia) {
    // 1. Consulta principal en SGP_VACUNAS
    const vacunasResult = await executeQuery(client, "SGP_VACUNAS", pcia, idInstancia);
    
    // Si no se encuentran resultados en SGP_VACUNAS, retornamos vacío
    if (vacunasResult.length === 0) {
        return [];
    }
    
    // Extraemos el código de vacuna y el lote del primer resultado
    const codigoVacuna = vacunasResult[0].COD_VACUNA;
    const loteVacuna = vacunasResult[0].LOTE;
    
    // 2. Consulta en AUX_CODIF_VACUNAS usando el código de vacuna
    const auxCodifVacunasResult = await client.query(`
        SELECT * FROM hce_model."AUX_CODIF_VACUNAS"
        WHERE "CODIGO" = $1
    `, [codigoVacuna]);

    // 3. Consulta en HCE_REL_VACUNAS_ENFERMEDAD para obtener el campo 'DOSIS'
    const relVacunasEnfermedadResult = await client.query(`
        SELECT "DOSIS" FROM hce_stage."HCE_REL_VACUNA_ENFERMEDAD"
        WHERE "ID_INSTANCIA_DATO" = $1
    `, [idInstancia]);

    // 4. Consulta en HC_LOTES_VACUNAS para obtener la fecha de caducidad usando el lote
    const lotesVacunasResult = await client.query(`
        SELECT "FECHA_CADUCIDAD" FROM hce_model."HCE_LOTES_VACUNAS"
        WHERE "ID_LOTE" = $1
    `, [loteVacuna]);

    // Consolidar todos los resultados en un solo objeto
    const resultadoConsolidado = {
        ...vacunasResult[0],
        ...auxCodifVacunasResult.rows[0],
        DOSIS: relVacunasEnfermedadResult.rows[0]?.DOSIS || null,
        FECHA_CADUCIDAD: lotesVacunasResult.rows[0]?.FECHA_CADUCIDAD || null
    };
    
    return [resultadoConsolidado];
}


/**
 * 
 * @param {*} client 
 * @param {*} pcia 
 * @param {*} idInstancia 
 * @returns 
 */
async function executeTipoCatalogo(client, pcia, idInstancia) {
    // 1. Consulta principal en SGP_DATOSCATALOGO
    const basicResult = await executeQuery(client, "SGP_DATOCATALOGO", pcia, idInstancia);
    
    // Si no se encuentran resultados en SGP_DATOSCATALOGO, retornamos vacío
    if (basicResult.length === 0) {
        return [];
    }

    const codigoCatalogo = basicResult[0].ID_CATALOGO;
    
     // Verificar si el tipo básico existe en el mapeo
     if (codigoCatalogo in datoBasicoCatalogo) {
        const delegatedFunction = datoBasicoCatalogo[codigoCatalogo]; 
        return await delegatedFunction(client, pcia, idInstancia);
     } else {
        return basicResult;
     }
}



/**
 * Función para ejecutar una consulta en una tabla específica, según el nombre de la tabla,
 * la provincia y el ID de la instancia de dato.
 *
 * @param {object} client - Objeto de cliente de base de datos.
 * @param {string} tableName - Nombre de la tabla donde se ejecutará la consulta.
 * @param {number} pcia - Identificador de provincia.
 * @param {number} idInstancia - Identificador de la instancia del dato básico.
 * @returns {Promise<object[]>} - Resultado de la consulta.
 */
async function executeQuery(client, tableName, pcia, idInstancia) {
    const query = `SELECT * FROM hce_stage."${tableName}" WHERE "PCIA" = $1 AND "ID_INSTANCIA_DATO" = $2`;
    const values = [pcia, idInstancia];
    const result = await client.query(query, values);

    if (result.rows.length === 0) {
        return [];
    }
    return result.rows;
}


module.exports = { 
    consultaPorTIPO_BASICO
};

