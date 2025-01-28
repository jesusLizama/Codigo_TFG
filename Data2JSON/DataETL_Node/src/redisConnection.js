/*
 * Autor: Jesús Lizama
 * Fecha Última Modificación: 15 de octubre de 2024
 * Nombre del archivo: redisConnection.js
 * Descripción: Este archivo contiene funciones para gestionar la conexión a una cola Redis 
 * utilizando el módulo 'redis'. Proporciona métodos para establecer y cerrar conexiones con Redis. 
 * Las credenciales y la configuración del cliente se obtienen de las variables de entorno definidas 
 * en un archivo .env. Además, se implementa manejo de errores y se registran eventos mediante el módulo 'winston'.
 */


const { createClient } = require('redis');
const winston = require('../winston/logger')

require('dotenv').config(); 



/**
 * 
 * Esta función crea una instancia del cliente de PostgreSQL, establece una conexión 
 * con la base de datos y configura el esquema a utilizar. Si ocurre algún error 
 * durante la conexión, este se registra y se lanza.
 * 
 * @returns {Promise<Client>} - El cliente de PostgreSQL conectado.
 * @throws {Error} - Si ocurre un error durante la conexión.
 */
async function connectRedis() {

    const redisClient = createClient({
        //username: process.env.REDIS_USER,
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,  // Nombre del contenedor Redis
            port: process.env.REDIS_PORT   // Puerto por defecto de Redis 6379
        }
    });    

    // Manejo de errores del cliente Redis
    redisClient.on('error', (err) => winston.error('[REDIS] Error en Redis:', err));

    try {
        // Conectar al cliente Redis
        await redisClient.connect();
        winston.info('[REDIS] Conectado correctamente a Redis');

        return redisClient;

    } catch (err) {
        winston.error('[REDIS] Error durante la conexión a Redis', err);
        throw err;
    }
}

/**
 * 
 * Esta función finaliza la conexión activa del cliente. Si ocurre algún error
 * durante el cierre, este se registra en la consola.
 * 
 * @param {Client} client - El cliente de PostgreSQL cuya conexión será cerrada.
 * @returns {Promise<void>}
 */
async function disconnectRedis(redisClient) {
    try {
        if (redisClient) {
            // Hacer fichero para abrir y cerrar conexion a redis al igual que con postgreSQL
            await redisClient.quit();
            winston.debug('[REDIS] ¡Conexión a Redis cerrada!');
        }        
    } catch (err) {
        winston.error('[REDIS] Error cerrando la conexión a Redis ', err);
    }
}


module.exports = { connectRedis, disconnectRedis };
