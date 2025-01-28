/*
 * Autor: Jesús Lizama
 * Fecha Ultima Modificación: 15 de octubre de 2024
 * Nombre del archivo: queryExecutor.js
 * Descripción: Este archivo contiene una serie de funciones para interactuar con una base de datos 
 * PostgreSQL en el contexto del sistema SGP. Proporciona métodos específicos para ejecutar consultas 
 * SQL sobre tablas relacionadas con plantillas, arquetipos, datos básicos y listas de valores, 
 * permitiendo la extracción, filtrado y mapeo de información relevante. 
*/

const winston = require('../winston/logger');


const queryInstTemplates = 'SELECT * FROM hce_stage."SGP_INST_PLANTILLA" WHERE "PCIA" = $1 AND "ID_INSTANCIA_PLANT" = $2'; // pcia, instPlant
const queryInstTemplateByType = 'SELECT sip."PCIA", sip."ID_INSTANCIA_PLANT", sip."ID_PLANTILLA" FROM hce_stage."SGP_INST_PLANTILLA" sip WHERE sip."ID_PLANTILLA" = $1 ORDER BY RANDOM() LIMIT 1'; //id_plantilla
const queryInstArchetypesInTemplate = 'SELECT * FROM hce_stage."SGP_INST_ARQUETIPO" WHERE "PCIA" = $1 AND "ID_INSTANCIA_PLANT" = $2'; //pcia, instPlant
const queryInstDatumInArchetype = 'SELECT * FROM hce_stage."SGP_INST_DATOBASICO" WHERE "PCIA" = $1 AND "ID_INSTANCIA_ARQ" = $2'; // pcia, instArq
const queryInstDatumById = 'SELECT sid."ID_DATOBASICO" FROM hce_stage."SGP_INST_DATOBASICO" sid WHERE "PCIA" = $1 AND "ID_INSTANCIA_DATO" = $2'; //pcia, idInstanciaDato
const queryDefDatum = 'SELECT * FROM hce_model."SGP_DEF_DATOBASICO" WHERE "ID_DATOBASICO" = $1'; // id_datobasico
const queryDefTemplate = 'SELECT * FROM hce_model."SGP_DEF_PLANTILLAS" WHERE "ID_PLANTILLA" = $1'; // id_plantilla
const queryDefArchetype = 'SELECT * FROM hce_model."SGP_DEF_ARQUETIPOS" WHERE "ID_ARQUETIPO" = $1'; // id_arquetipo


/**
 * Ejecucion estandar de consulta
 */
async function executeQuery(client, query, ...args) {
    try {
        const values = args;
        const result = await client.query(query, values);
        return result.rows;
    } catch (err) {
        winston.error('[QUERY] Error durante la consulta ${query}', err);
        throw err;
    }    
}


// Función para ejecutar una consulta en la tabla "SGP_INST_ARQUETIPO"
// dado el PCIA y el ID_INSTANCIA_PLANT
async function executeQuery_SGP_INST_ARQUETIPO(client, pcia, idInstanciaPLANT) {
    return executeQuery(client, queryInstArchetypesInTemplate, pcia, idInstanciaPLANT)
}
  
// Función para ejecutar una consulta en la tabla "SGP_INST_PLANTILLA"
// dado el PCIA y el ID_INSTANCIA_PLANT
async function executeQuery_SGP_INST_PLANTILLA(client, pcia, idInstanciaPLANT) {
    return executeQuery(client, queryInstTemplates, pcia, idInstanciaPLANT)
}
  
// Función para ejecutar una consulta en la tabla "SGP_INST_DATOBASICO"
// dado el PCIA y el ID_INSTANCIA_ARQ
async function executeQuery_SGP_INST_DATOBASICO(client, pcia, idInstanciaARQ) {
    return executeQuery(client, queryInstDatumInArchetype, pcia, idInstanciaARQ)
}
  
// Función para ejecutar una consulta en la tabla "SGP_DEF_DATOBASICO"
// dado el ID_DATOBASICO
async function executeQuery_SGP_DEF_DATOBASICO(client, id_datobasico) {
    return executeQuery(client, queryDefDatum, id_datobasico)
}


// Función para ejecutar una consulta en la tabla "SGP_DEF_PLANTILLA"
// dado el ID_PLANTILLA
async function executeQuery_SGP_DEF_PLANTILLA(client, id_plantilla) {
    return executeQuery(client, queryDefTemplate, id_plantilla)
}

// Función para ejecutar una consulta en la tabla "SGP_DEF_PLANTILLA"
// dado el ID_ARQUETIPO
async function executeQuery_SGP_DEF_ARQUETIPO(client, id_arquetipo) {
    return executeQuery(client, queryDefArchetype, id_arquetipo)
}
  

// Función para ejecutar una consulta en la tabla "SGP_INST_PLANTILLA"
// para obtener un registro con ID_PLANTILLA igual al parámetro pasado, aleatoriamente
async function executeQuery_SGP_INST_PLANTILLA_ID_PLANTILLA(client, id_plantilla) {
    return executeQuery(client, queryInstTemplateByType, id_plantilla)
}


// Función para obtener el valor de ID_DATOBASICO dado el PCIA y el
// ID_INSTANCIA_DATO
async function executeQuery_ID_DATO_BASICO(client, pcia, idInstanciaDato) {
    return executeQuery(client, queryInstDatumById, pcia, idInstanciaDato)
}


// Función para obtener el nombre real para pode determinar el mapeo correctamente de las listas
async function extraerMapeo(client, idLista, valor) {
    try {
        // Obtiene el nombre de la lista desde SGP_DEF_LISTAVALORES
        const queryLista = `
            SELECT "DESCRIPCION" 
            FROM hce_model."SGP_DEF_LISTAVALORES" 
            WHERE "ID_LISTA" = $1
        `;
        const valuesLista = [idLista];
        const resultLista = await client.query(queryLista, valuesLista);

        let nombreLista = null;
        if (resultLista.rows.length > 0) {
            nombreLista = resultLista.rows[0].DESCRIPCION;
        }

        // Obtiene la descripción del valor en la lista desde SGP_DEF_LISTAVALORES_DETALLEADO
        const queryDetalle = `
            SELECT "DESCRIPCION" 
            FROM hce_model."SGP_DEF_LISTAVALORES_DETALLE" 
            WHERE "ID_LISTA" = $1 AND "VALOR" = $2
        `;
        const valuesDetalle = [idLista, valor];
        const resultDetalle = await client.query(queryDetalle, valuesDetalle);

        let descripcionValor = null;
        if (resultDetalle.rows.length > 0) {
            descripcionValor = resultDetalle.rows[0].DESCRIPCION;
        }

        // Devuelve solo los dos valores necesarios para concatenación
        return { nombreLista, descripcionValor };
    } catch (err) {
        winston.error('[QUERY] Error durante la consulta', err);
        throw err;
    }
}

// Función para obtener codigos de una lista de valores
async function buscarCodigosListavalores(client, id_lista, valor) {
    const query = `
        SELECT "SOURCE_CD", "SOURCE_CONCEPT_ID", "CONCEPT_ID" 
        FROM hce_model."SGP_DEF_LISTAVALORES_DETALLE" 
        WHERE "ID_LISTA" = $1 AND "VALOR" = $2
    `;
    const result = await client.query(query, [id_lista, valor]);

    if (result.rows.length > 0) {
        return result.rows[0];
    } else {
        return {
            source_cd: null,
            source_concept_id: null,
            concept_id: null,
        };
    }
}


  
module.exports = {
    executeQuery,
    executeQuery_SGP_INST_ARQUETIPO,
    executeQuery_SGP_INST_PLANTILLA,
    executeQuery_SGP_INST_DATOBASICO,
    executeQuery_SGP_DEF_DATOBASICO,
    executeQuery_SGP_DEF_ARQUETIPO,
    executeQuery_SGP_DEF_PLANTILLA,
    executeQuery_ID_DATO_BASICO,
    executeQuery_SGP_INST_PLANTILLA_ID_PLANTILLA,
    extraerMapeo,
    buscarCodigosListavalores
};
  