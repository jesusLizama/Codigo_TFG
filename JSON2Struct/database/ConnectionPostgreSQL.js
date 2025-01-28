/*
 * Autor: Jesús Lizama
 * Fecha Última Modificación: 22 de octubre de 2024
 * Nombre del archivo: ConnectionPostgreSQL.js
 * Descripción: Este archivo contiene funciones para conectarse y cerrar la
 * conexión a una base de datos PostgreSQL utilizando el módulo 'pg'. 
 * Las credenciales de la base de datos se obtienen de las variables de entorno.
 */

const { Client } = require('pg');
import winston from '../winston/logger.js';
require('dotenv').config();

// Función para conectarse a la base de datos PostgreSQL.
async function connectPostgreSQL() {
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        searchPath: process.env.DB_SCHEMA
    });
    

    try {
        await client.connect();
        winston.info('[POSTGRESQL_DB] Conectado a la base de datos.');

        
        // Devuelve el cliente conectado
        return client;
    } catch (err) {
        winston.error('[POSTGRESQL_DB] Error durante la conexión a la base de datos', err);
        throw err;
    }
}

// Función para cerrar la conexión con la base de datos.
async function closeConnection(client) {
    try {
        await client.end();
        winston.info('[POSTGRESQL_DB] Conexión cerrada correctamente.');
    } catch (err) {
        winston.error('[POSTGRESQL_DB] Error cerrando la conexión', err);
    }
}

module.exports = { connectPostgreSQL, closeConnection };
