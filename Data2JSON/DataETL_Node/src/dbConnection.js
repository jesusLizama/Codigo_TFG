/*
 * Autor: Jesús Lizama
 * Fecha Última Modificación: 15 de octubre de 2024
 * Nombre del archivo: dbConnection.js
 * Descripción: Este archivo contiene funciones para conectarse y cerrar la
 * conexión a una base de datos PostgreSQL utilizando el módulo 'pg'. 
 * Las credenciales de la base de datos se obtienen de las variables de entorno.
 */

const { Client } = require('pg');
require('dotenv').config(); 
const winston = require('../winston/logger')


/**
 * 
 * Esta función crea una instancia del cliente de PostgreSQL, establece una conexión 
 * con la base de datos y configura el esquema a utilizar. Si ocurre algún error 
 * durante la conexión, este se registra y se lanza.
 * 
 * @returns {Promise<Client>} - El cliente de PostgreSQL conectado.
 * @throws {Error} - Si ocurre un error durante la conexión.
 */
async function connectPostgreSQL() {
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    });

    try {
        await client.connect();

        // Establecer el esquema a utilizar
        await client.query('SET search_path TO hce_model');
        
        return client;

    } catch (err) {
        winston.error('Error durante la conexión a la base de datos', err);
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
async function closeConnection(client) {
    try {
        await client.end();
    } catch (err) {
        winston.error('Error cerrando la conexión a PostgreSQL ', err);
    }
}

module.exports = { connectPostgreSQL, closeConnection };
