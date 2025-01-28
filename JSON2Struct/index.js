/*
 * Autor: Jesús Lizama
 * Fecha Última Modificación: 18 de noviembre de 2024
 * Nombre del archivo: main_automatico.js
 * Descripción: Este archivo contiene las funciones principales para procesar plantillas 
 * JSON. Incluye la lógica para leer y aplicar reglas definidas en archivos JSON para 
 * diferentes arquetipos y datos básicos. Procesa cada plantilla y almacena los resultados 
 * basados en las reglas establecidas.
 */

import * as fs from 'fs/promises';
import rulesLoader from "./procedureRules/rulesLoader.js"; 
import path from 'path';
import processor from "./process/json2rowProcess.js"
// importamos el sender deseado
import { QueueSender, ConsoleSender } from "./sender/Sender.js";
import { Sema } from 'async-sema';
import { connectRedis, disconnectRedis } from './database/redisConnection.js';
import winston from './winston/logger.js';


// Crear un semáforo que permita una sola ejecución crítica a la vez
const sema = new Sema(1);
//Para el contador
const semaResta = new Sema(1);
// Objeto de cache en memoria
const rulesCache = {};
// Cola desde la que leemos mensajes (Redis)
const inputQueueName="ehr_json";
const inputFolder="./JSON";
// Contador para los mensajes en procesamiento
let pendingMessages = 0; 





/**
 * Ejecutar el procesamiento de todos los ficheros en la carpeta especificada
 * @param {*} message 
 * @param {*} sender 
 * @returns 
 */
async function processMessage(message, sender) {


    try {

        // Por ejemplo, si el id = 0 significaria que es el mensaje que nos indica el numero de 
        // JSON a profesar e igualariamos la variable de plantillas a procesar con el valor enviado por la cola.
        if (message.id == '0') {
            winston.info(`[PROCESS] Mensaje recibido con el número de plantillas a procesar. Vamos a procesar ${message.numPlantillasProcesar} plantillas.`);

            pendingMessages = message.numPlantillasProcesar;
            return;
        } else {
            winston.info(`[PROCESS] Procesando JSON con ID_INSTANCIA: ${message.ID_INSTANCIA_PLANT}`);

            if (!rulesCache[message.id]) {
                // Intentar adquirir el semáforo si las reglas no están mapeadas
                await sema.acquire();
                try {
                    if (!rulesCache[message.id]) {
                        // Consultar reglas en Mongo
                        const rules = await rulesLoader.getRules(message.id);
                        winston.debug("Reglas leídas:", JSON.stringify(rules));

                        // Almacenar en caché si las reglas existen
                        if (rules) {
                            rulesCache[message.id] = rules;
                            winston.debug(`[PROCESS] Cargadas reglas ${message.id} en cache`);
                        } else {
                            winston.warn(` [PROCESS] No se encontraron reglas para la plantilla con ID ${message.id}.`);
                        }
                    }
                } finally {
                    sema.release();  
                }
            }


            // Verificar si las reglas ya están en la caché
            if (rulesCache[message.id]) {
                winston.debug(`[PROCESS] Reglas para la plantilla ${message.id} obtenidas desde la caché.`);
                await processor.processElement(message, rulesCache[message.id], message, sender); // TODO el sender debería manejarse aqui
            }
        
            // decrementamos el número de mensajes pendientes
            await semaResta.acquire(); // Espera aquí hasta que pueda adquirir el semáforo
            try {
                winston.debug("[PROCESS] Semáforo adquirido. Ejecutando sección crítica: Restar 1 al contador!");
                pendingMessages--;
                winston.debug(`[PROCESS] Quedan  ${pendingMessages} mensajes por procesar`);
                if(pendingMessages == 0) {
                    sender.endProcessing();
                }
            } finally {
                winston.debug("[PROCESS] Liberando el semáforo...");
                semaResta.release(); // Asegúrate de liberar el semáforo al finalizar
            }


        
        }
    } catch (error) {
        winston.error(`[PROCESS] Error al procesar el JSON: ${error.message}`);
    }

    winston.debug(`[PROCESS] Procesado JSON con ID_INSTANCIA_PLANTILLA: ${data.ID_INSTANCIA_PLANT}`);
}




/**
 * Process a single JSON file
 * @param {String} filepath 
 * @returns 
 */
async function processFile(filepath) {
    try {
        // Leer el contenido de cada archivo JSON
        const fileContent = await fs.readFile(filepath, 'utf-8');
        const data = JSON.parse(fileContent);

        await processMessage(data, sender);

    } catch (error) {
        winston.error(`[PROCESS] Error al procesar el fichero ${filepath}: ${error.message}`);
    }
}




/**
 * Process all the JSON files in the input folder, applyin corresponding rules
 * @param {*} input 
 * @param {*} sender 
 */
async function processFolder(input, sender) {
    try {
        // Obtener todos los ficheros de la carpeta
        const fileList = await fs.readdir(input);

        // Enviamos un primer mensaje con el tamaño de la carpeta
        const startMessage = {
            id: 0,
            numPlantillasProcesar: fileList.length,
        };
        await processMessage(startMessage, sender);

        // Cogemos la fecha para calcular el tiempo de ejecución
        const fech = new Date();

        // Procesar cada fichero en paralelo utilizando Promise.all
        await Promise.all(fileList.map(async (f) => {
            const fullPath = path.join(input, f);
            processFile(fullPath);
        }));

        // Medir el tiempo de ejecución total
        const fin = new Date();
        winston.info(`[TIME] Tiempo total de procesamiento: ${(fin - fech) / 1000} segundos`);

    } catch (error) {
        winston.error(`[PROCESS] Error al leer la carpeta: ${error.message}`);
    }
}




/**
 * Listen a Redis channel and process messages
 * @param {*} channelName Redis channel to subscribe to
 * @param {*} sender Message sender to send messages to
 */
async function listenChannelAndProcess(input, sender) {
    // Crear el cliente de Redis y especificar el host
    const redisClientListen = await connectRedis();       //Esto es lo que hemos eliminado porque no lo necesitamos ya que lo estamos creando en el constructor!!!

    // Suscribirse al canal 'channel_prueba'
    await redisClientListen.subscribe(input, async (message) => {
        winston.debug(`[PROCESS] Mensaje recibido en el canal ${inputQueueName}`);
        const data = JSON.parse(message);

        try {
            // Para terminar el proceso
            if (data.id == '-1') {
                winston.info('[PROCESS] Proceso finalizado. Cerrando suscriptor...');
                await redisClientListen.unsubscribe(input);
                disconnectRedis(redisClientListen);           
            } else {
                await processMessage(data, sender);
            }         
        } catch {

        }
    });
    winston.info(`[PROCESS] Suscrito al canal "${input}"`);
}




/**
 * Función principal
 */
async function main() {
    let sender;
    if ( process.env.OUTPUT == 'redis' ) {
        sender = await QueueSender.build();
        //console.log(JSON.stringify(sender));
    } else {
        sender = new ConsoleSender();
    }

    if ( process.env.INPUT == 'redis' ) {
        listenChannelAndProcess(inputQueueName, sender);        
    } else {
        processFolder(inputFolder, sender);
    }
}

await main();