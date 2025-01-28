/*
 * Autor: Jesús Lizama
 * Fecha Última Modificación: 26 de noviembre de 2024
 * Nombre del archivo: index.js
 * Descripción: Este archivo contiene el programa principal que ejecuta un flujo de procesamiento
 * para las plantillas leidas. El proceso toma las plantillas, las convierte a formato 
 * '.JSON', y dependiendo de las configuraciones, las almacena en una carpeta o las envía a una 
 * cola Redis para procesamiento asíncrono.
 */

const fs = require('fs');
const { connectPostgreSQL, closeConnection } = require('./src/dbConnection');
const { connectRedis, disconnectRedis } = require('./src/redisConnection');
const queryExecutor = require('./src/queryExecutor');
const processFunctions = require('./src/processFunctions');
const winston = require('./winston/logger')


// Variables de entorno
require('dotenv').config();
const sendToQueue = process.env.REDIS === 'true'; 
const sendToFile = process.env.FICHERO === 'true';
const queueName="ehr_json";
const outputFolder="./JSON";
const queryWhere = process.env.QUERY_WHERE;

//test queries
// ejecucion: executeQuery(client, <query>, ...args)
const queryInstPlantilla3_10 = 'SELECT sip."PCIA", sip."ID_INSTANCIA_PLANT" , sip."ID_PLANTILLA" FROM hce_stage."SGP_INST_PLANTILLA" sip WHERE "ID_PLANTILLA" = 3 OR "ID_PLANTILLA" = 10 LIMIT 1'; //no param
const queryInstPlantillaTotalLimit = 'SELECT sip."PCIA", sip."ID_INSTANCIA_PLANT" , sip."ID_PLANTILLA" FROM hce_stage."SGP_INST_PLANTILLA" sip LIMIT 5'; //no param
const queryInstPlantilla10 = 'SELECT sip."PCIA", sip."ID_INSTANCIA_PLANT" , sip."ID_PLANTILLA" FROM hce_stage."SGP_INST_PLANTILLA" sip WHERE "ID_PLANTILLA" = 10 ORDER BY RANDOM() LIMIT 10'; //no param
const queryInstPlantilla763 = 'SELECT sip."PCIA", sip."ID_INSTANCIA_PLANT" , sip."ID_PLANTILLA" FROM hce_stage."SGP_INST_PLANTILLA" sip WHERE "ID_PLANTILLA" = 763 ORDER BY RANDOM() LIMIT 10'; //no param
const queryInstPlantilla750 = 'SELECT sip."PCIA", sip."ID_INSTANCIA_PLANT" , sip."ID_PLANTILLA" FROM hce_stage."SGP_INST_PLANTILLA" sip WHERE "ID_PLANTILLA" = 750 ORDER BY RANDOM() LIMIT 10'; //no param
const queryInstPlantilla121 = 'SELECT sip."PCIA", sip."ID_INSTANCIA_PLANT" , sip."ID_PLANTILLA" FROM hce_stage."SGP_INST_PLANTILLA" sip WHERE "ID_PLANTILLA" = 121 ORDER BY RANDOM() LIMIT 10'; //no param
const queryInstPlantilla21 = 'SELECT sip."PCIA", sip."ID_INSTANCIA_PLANT" , sip."ID_PLANTILLA" FROM hce_stage."SGP_INST_PLANTILLA" sip WHERE "ID_PLANTILLA" = 21 ORDER BY RANDOM() LIMIT 10'; //no param
const queryInstPlantilla582 = 'SELECT sip."PCIA", sip."ID_INSTANCIA_PLANT" , sip."ID_PLANTILLA" FROM hce_stage."SGP_INST_PLANTILLA" sip WHERE "ID_PLANTILLA" = 582 ORDER BY RANDOM() LIMIT 1'; //no param
const queryBase = 'SELECT sip."PCIA", sip."ID_INSTANCIA_PLANT" , sip."ID_PLANTILLA" FROM hce_stage."SGP_INST_PLANTILLA" sip WHERE ';

// Fijamos la consulta a utilizar en pruebas o en producción
let queryGetDocuments = queryInstPlantilla10;



/** * 
 * Esta función utiliza un cliente de Redis para publicar un mensaje en un canal específico.
 * El mensaje se convierte a formato JSON antes de enviarse. Si la publicación es exitosa, 
 * se registra en la consola un mensaje indicando el canal y el contenido publicado.
 * 
 * @param {RedisClient} redisClient - El cliente de Redis utilizado para la publicación.
 * @param {string} channelName - El nombre del canal donde se publicará el mensaje.
 * @param {Object} message - El contenido del mensaje a publicar. Será convertido a JSON.
 * @returns {Promise<void>}
 */
async function sendToRedisQueueSingle(message, redisClient) {
    try {
        winston.debug(`[DATAETL] Publicador conectado a Redis a la cola: ${queueName}`);
        // Publicar cada plantilla procesada en el canal
        redisClient.publish(queueName, JSON.stringify(message));

    } catch (error) {
        winston.error(`[DATAETL] Error al enviar a Redis en la cola ${queueName} : `, error);
    } 
}



// Publicar un mensaje de finalización al final del flujo
async function sendEndNotification(redisClient) {
    try {
        const completionMessage = {
            id: "-1",
        };
        redisClient.publish(queueName, JSON.stringify(completionMessage));
        winston.info(`[DATAETL] ¡Mensaje de finalización publicado por Redis, en la cola: ${queueName} !`);
    } catch (error) {
        winston.error(`[DATAETL] Error al enviar mensaje de finalización en la cola ${queueName}: `, error);
    }
}



// Publicar un mensaje de finalización al final del flujo
async function sendStartNotification(redisClient, numberOfDocuments) {
    try {
        const startMessage = {
            id: 0,
            numPlantillasProcesar: numberOfDocuments,
        };
        // Enviamos por la cola el numero de JSON a procesar
        redisClient.publish(queueName, JSON.stringify(startMessage));
        winston.info(`[DATAETL] ¡Mensaje de inicio publicado por Redis en la cola ${queueName}!`);
    } catch (error) {
        winston.error(`[DATAETL] Error al enviar mensaje de finalización en la cola ${queueName}: `, error);
    }
}



/**
 * Función principal que ejecuta el flujo de trabajo.
 */
async function main() {
    let client; 
    let redisClient;
    try {
        winston.debug(`[DATAETL] Iniciando conexión a la base de datos...`);
        client = await connectPostgreSQL();
        winston.info(`[DATAETL] ¡Conexión a la base de datos Postgres establecida!`);


        // Realizar una consulta para obtener plantillas del tipo 10 o generales, dependiendo de 
        // la función a llamar.
        const startTime = new Date();
        if (queryWhere != undefined) {
            queryGetDocuments = queryBase + queryWhere;
        }
        winston.info(`[DATAETL] Ejecutando consulta: ${queryGetDocuments}`);
        const resultset = await queryExecutor.executeQuery(client, queryGetDocuments);
        winston.info(`[DATAETL] Numero de plantillas a procesar: ${resultset.length}` );

        // Crear el cliente de Redis y especificar el host
        if (sendToQueue) {
            redisClient = await connectRedis();
            await sendStartNotification(redisClient, resultset.length);
            winston.debug(`[DATAETL] Cliente redis conectado, listo para enviar mensajes.`);
        }

        // Procesar todas las plantillas obtenidas secuencialmente
        for (const [index, element] of resultset.entries()) {
            winston.debug(`[DATAETL] Iniciando procesamiento de plantilla ${index + 1} - ID Instancia: ${element.ID_INSTANCIA_PLANT}`);
            try {
                const res = await processFunctions.processPlantilla(client, element);
                winston.info(`[DATAETL] Plantilla procesada - ID Instancia: ${res.ID_INSTANCIA_PLANT}`);
        
                if (sendToQueue) {
                    await sendToRedisQueueSingle(res, redisClient);
                    winston.debug(`[DATAETL] Mensaje enviado a la cola - ID Instancia Plantilla: ${res.ID_INSTANCIA_PLANT}`);
                }
        
                if (sendToFile) {
                    const filePath = `${outputFolder}/${res.ID_INSTANCIA_PLANT}.json`;
                    await fs.promises.writeFile(filePath, JSON.stringify(res, null, 2));
                    winston.debug(`[DATAETL] Archivo guardado - Path: ${filePath}`);
                }
        
            } catch (error) {
                winston.error(`[PROCESS] Error procesando plantilla ${index + 1} - ID Instancia Plantilla: ${element.ID_INSTANCIA_PLANT}: ${error.message}`, { stack: error.stack });
            }
        }
        

        if (sendToQueue) {
            await sendEndNotification(redisClient);
            winston.debug(`[DATAETL] ¡Mensaje de finalización enviado!`);
        }

        const endTime = new Date();
        winston.info(`[TIME] Tiempo total de ejecución: ${(endTime - startTime) / 1000}s`);

    } catch (error) {
        winston.error(`[DATAETL] Error en el flujo de trabajo: ${error.message}`, { stack: error.stack });
    } finally {
        if (client) {
            await closeConnection(client);
            winston.info(`[DATAETL] Conexión a la base de datos cerrada.`);
        }
        if (redisClient) {
            await disconnectRedis(redisClient);
            winston.debug(`[DATAETL] Cliente Redis desconectado.`);
        }
    }
}


// Programa principal
main();
