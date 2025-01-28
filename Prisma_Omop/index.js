/*
 * Autor: Jesús Lizama
 * Fecha Última Modificación: 26 de noviembre de 2024
 * Nombre del archivo: index.js
 * Descripción: Este archivo contiene el programa principal que maneja la lectura de mensajes
 * desde una cola en Redis y procesa los mensajes recibidos. Los mensajes son en formato JSON
 * y contienen información para insertar o actualizar registros en una base de datos utilizando Prisma.
 * El flujo se basa en una conexión a Redis para recibir mensajes de la cola y realizar operaciones
 * de inserción o actualización en las tablas correspondientes.
 */

import { PrismaClient } from '@prisma/client';
import { connectRedis, disconnectRedis } from './database/redisConnection.js';
import winston from './winston/logger.js';

// Crear una instancia del cliente Prisma
const prisma = new PrismaClient()
let endFlag = false;




/**
 * Función para manejar los mensajes recibidos y realizar el mapeo de claves primarias.
 * 
 * @param {Object} parsedMessage - Mensaje recibido desde la cola de Redis, ya parseado como JSON.
 */
async function handleMessage (parsedMessage) {
    // Si el mensaje recibido es -1, cerramos conexion con redis y acabamos
    if (parsedMessage.target_table == -1) {
        winston.info('Proceso finalizado. Cerrando suscriptor...');
        endFlag = true;
        return;
    }


    try {
        
        const { target_table, record } = parsedMessage;
        winston.debug(`Tabla destino: ${target_table}`);
        const primaryKeyMapping = {
            preg_chart_prisma : 'id'
        };

        const primaryKey = primaryKeyMapping[target_table];
        const keyValue = record[primaryKey];
        winston.debug(`Clave upsert: ${primaryKey}:${keyValue}`);

        winston.debug(`Nombre de la clave primaria: ${primaryKey} con valor: ${keyValue}`);

        // Insertar o actualizar los datos en la base de datos utilizando Prisma
        await prisma[target_table].upsert({
            where: {
                [primaryKey]: keyValue
            },
            create: record,
            update: record,
        });

        winston.debug(`Registro ${primaryKey} procesado correctamente`);
    } catch (error) {
        winston.error(`Error al procesar el registro: ${error}`);
    }
}



/**
 * Función que procesa los mensajes de la cola de Redis de manera bloqueante.
 * 
 * @param {string} queueName - Nombre de la cola de Redis desde la que leer los mensajes.
 */
async function processQueue(client, queueName) {
    try {
        winston.info(`Esperando mensajes en la cola "${queueName}"...`);
        await client.del(queueName);

        while (!endFlag) {
            // Leer un mensaje de la cola de manera no bloqueante. Podriamos hacerla bloqueante o no, como veamos que funciona mejor
            const message = await client.brPop(queueName, 0); 
            const parsedMessage = JSON.parse(message.element);
            
            // Procesar el mensaje
            winston.debug(`Mensaje recibido en la cola ${queueName}: ${JSON.stringify(parsedMessage)} !!!`);
            await handleMessage(parsedMessage, queueName); 
            winston.debug(`Mensaje procesado correctamente de la cola "${queueName}"`);
        }
    } catch (error) {
        winston.error(`Error al procesar el mensaje de la cola "${queueName}": ${error}`);
    } finally {
        winston.info("Conexiones cerradas.");
    }
}



// Programa principal
(async () => {
    const redisClient = await connectRedis(); 

    // Procesar mensajes de las colas de manera concurrente usando promesas. Si no usamos promesas
    // de esta manera no podemos escuchar de varias colas a la vez
    await Promise.all([
        processQueue(redisClient, process.env.QUEUE)
    ]);

    disconnectRedis(redisClient);
})();
