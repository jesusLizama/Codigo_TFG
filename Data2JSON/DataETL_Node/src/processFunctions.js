/*
 * Autor: Jesús Lizama
 * Fecha Última Modificación: 6 de noviembre de 2024
 * Nombre del archivo: processFunction.js
 * Descripción: 
 * Este archivo contiene funciones para procesar estructuras de datos en un sistema de plantillas, 
 * arquetipos y datos básicos, obteniendo información desde una base de datos y estructurándola en formato JSON. 
 * Las funciones realizan consultas a la base de datos a través de un cliente y vinculan los datos procesados
 * con sus respectivas definiciones, relaciones y estados. El procesamiento incluye plantillas, arquetipos
 * y datos básicos, manejando dinámicamente los contenidos asociados, como códigos fuente y conceptos.
 */

const { consultaPorTIPO_BASICO } = require('./consultaTipo');
const queryExecutor = require('./queryExecutor');
const winston = require('../winston/logger')
require('dotenv').config();

const includeNombre = process.env.NOMBRE === 'true';

/**
 * Procesa un dato básico consultando la base de datos para obtener los valores correspondientes.
 * @param {object} client - Cliente de la base de datos.
 * @param {string} PCIA - Identificador de la PCIA.
 * @param {string} id_datobasico - ID del dato básico.
 * @param {string} id_instancia_dato - ID de la instancia del dato básico.
 * @param {string} estado - Estado del dato básico.
 * @returns {Promise<object>} - JSON con los datos básicos procesados.
 */
async function processDatoBasico(client, PCIA, id_datobasico, id_instancia_dato, estado) {
    winston.debug(`[PROCESS] Iniciando procesamiento de dato básico - ID Dato Básico: ${id_datobasico}, ID Instancia Dato Basico: ${id_instancia_dato}`);
    const resultadosDef = await queryExecutor.executeQuery_SGP_DEF_DATOBASICO(client, id_datobasico);
    let datoBasicoJson = {};

    if (includeNombre && resultadosDef.length > 0) {
        const nombre = resultadosDef[0].NOMBRE;
        datoBasicoJson["NOMBRE"] = nombre.toString();
    }

    datoBasicoJson["id"] = id_datobasico.toString();
    datoBasicoJson["level"] = "DATO";
    datoBasicoJson["ESTADO"] = estado;
    datoBasicoJson["ID_INSTANCIA_DATO"] = id_instancia_dato.toString();

    datoBasicoJson["source_cd"] = resultadosDef[0].SOURCE_CD;
    datoBasicoJson["source_concept_id"] = resultadosDef[0].SOURCE_CONCEPT_ID;
    datoBasicoJson["concept_id"] = resultadosDef[0].CONCEPT_ID;

    datoBasicoJson["content"] = {};

    if (resultadosDef.length > 0) {
        const tipoBasico = resultadosDef[0].TIPO_BASICO;
        const resultadosFinales = await consultaPorTIPO_BASICO(client, PCIA, id_instancia_dato, tipoBasico);
        if (resultadosFinales.length > 0) {
            datoBasicoJson["content"] = resultadosFinales[0];
        } else {
            datoBasicoJson["content"] = { "mensaje": "No se encontraron valores." };
        }
    }

    // Si content tiene id_lista y valor, llamar a buscarCodigosListavalores
    if (datoBasicoJson["content"].ID_LISTA && datoBasicoJson["content"].VALOR) {
        const codigos = await queryExecutor.buscarCodigosListavalores(client, datoBasicoJson["content"].ID_LISTA, datoBasicoJson["content"].VALOR);

        // Añadir source_cd, source_concept_id, y concept_id al content
        datoBasicoJson["content"]["source_cd"] = codigos.source_cd || null;
        datoBasicoJson["content"]["source_concept_id"] = codigos.source_concept_id || null;
        datoBasicoJson["content"]["concept_id"] = codigos.concept_id || null;
    }

    winston.debug(`[PROCESS] Finalizado procesamiento de dato básico - ID Dato Básico: ${id_datobasico}, ID Instancia Dato Basico: ${id_instancia_dato}`);
    return datoBasicoJson;
}


/**
 * Procesa un arquetipo obteniendo los datos básicos asociados y estructurándolos en JSON.
 * @param {object} client - Cliente de la base de datos.
 * @param {string} PCIA - Identificador de la PCIA.
 * @param {object} resultadoArq - Datos del arquetipo incluyendo ID de instancia y arquetipo.
 * @returns {Promise<object>} - JSON con los datos del arquetipo y los datos básicos asociados.
 */
async function processArquetipo(client, PCIA, resultadoArq) {
    winston.debug(`[PROCESS] Iniciando procesamiento de arquetipo - ID Arquetipo: ${resultadoArq.ID_ARQUETIPO}, ID Instancia Arquetipo: ${resultadoArq.ID_INSTANCIA_ARQ}`);
    const { ID_INSTANCIA_ARQ: id_inst_arq, ID_ARQUETIPO: id_arq } = resultadoArq;

    const resultadosDef = await queryExecutor.executeQuery_SGP_DEF_ARQUETIPO(client, id_arq);
    let arquetipoJson = {};

    if (includeNombre && resultadosDef.length > 0) {
        const nombre = resultadosDef[0].NOMBRE;
        arquetipoJson["NOMBRE"] = nombre.toString();
    }

    arquetipoJson["id"] = id_arq.toString();
    arquetipoJson["level"] = "ARQUETIPO";
    arquetipoJson["ID_INSTANCIA_ARQ"] = id_inst_arq.toString();

    arquetipoJson["source_cd"] = resultadosDef[0].SOURCE_CD;
    arquetipoJson["source_concept_id"] = resultadosDef[0].SOURCE_CONCEPT_ID;
    arquetipoJson["concept_id"] = resultadosDef[0].CONCEPT_ID;

    arquetipoJson["content"] = [];

    const resultadosInstDatobasico = await queryExecutor.executeQuery_SGP_INST_DATOBASICO(client, PCIA, id_inst_arq);
    if (resultadosInstDatobasico.length > 0) {
        arquetipoJson["content"] = await Promise.all(resultadosInstDatobasico.map(
            async (resultadoDato) => {
                const { ID_DATOBASICO: id_datobasico, 
                        ID_INSTANCIA_DATO: id_instancia_dato, 
                        ESTADO: estado } = resultadoDato;

                return await processDatoBasico(client, PCIA, id_datobasico, 
                    id_instancia_dato, estado);
            }));
    }

    winston.debug(`[PROCESS] Finalizado procesamiento de arquetipo - ID Arquetipo: ${id_arq}, ID Instancia Arquetipo: ${id_inst_arq}`);
    return arquetipoJson;
}


/**
 * Procesa una plantilla consultando los datos y arquetipos asociados en la base de datos.
 * @param {object} client - Cliente de la base de datos.
 * @param {object} elemento - Elemento de la plantilla con datos de PCIA, ID de instancia y plantilla.
 * @returns {Promise<object>} - JSON con los datos de la plantilla y sus arquetipos asociados.
 * @throws Error si no se encuentra el ID de la plantilla.
 */
async function processPlantilla(client, elemento) {
    winston.debug(`[PROCESS] Iniciando procesamiento de plantilla - ID Instancia Plantilla: ${elemento.ID_INSTANCIA_PLANT}`);
    const { PCIA, ID_INSTANCIA_PLANT, ID_PLANTILLA } = elemento;

    const resultadosDef = await queryExecutor.executeQuery_SGP_DEF_PLANTILLA(client, ID_PLANTILLA);
    const resultadosInstPlantilla = await queryExecutor.executeQuery_SGP_INST_PLANTILLA(client, PCIA, ID_INSTANCIA_PLANT);

    if (resultadosInstPlantilla.length === 0) throw new Error('No se encontró el ID_PLANTILLA.');

    let resultadoJSON = {};

    if (includeNombre && resultadosDef.length > 0) {
        const nombre = resultadosDef[0].NOMBRE;
        resultadoJSON["NOMBRE"] = nombre.toString();
    }

    resultadoJSON["id"] = resultadosInstPlantilla[0].ID_PLANTILLA.toString();
    resultadoJSON["level"] = "PLANTILLA";
    resultadoJSON["ID_INSTANCIA_PLANT"] = ID_INSTANCIA_PLANT.toString();
    resultadoJSON["FECHA_INSTANCIA"] = resultadosInstPlantilla[0].FECHA_INSTANCIA;           //esto es lo nuevo añadido PARA TENER FECHA INSTANCIA EN LA PLANTILLA!!
    resultadoJSON["ID_PACIENTE"] = resultadosInstPlantilla[0].CIA.toString();

    resultadoJSON["source_cd"] = resultadosDef[0].SOURCE_CD;
    resultadoJSON["source_concept_id"] = resultadosDef[0].SOURCE_CONCEPT_ID;
    resultadoJSON["concept_id"] = resultadosDef[0].CONCEPT_ID;

    resultadoJSON["content"] = [];

    const resultadosInstArquetipo = await queryExecutor.executeQuery_SGP_INST_ARQUETIPO(client, PCIA, ID_INSTANCIA_PLANT);
    if (resultadosInstArquetipo.length > 0) {
        resultadoJSON["content"] = await Promise.all(resultadosInstArquetipo.map(async (resultadoArq) => {
            return await processArquetipo(client, PCIA, resultadoArq);
        }));
    }

    winston.debug(`[PROCESS] Finalizado procesamiento de plantilla - ID Instancia Plantilla: ${ID_INSTANCIA_PLANT}`);
    return resultadoJSON;
}


module.exports = {
    processPlantilla
};
