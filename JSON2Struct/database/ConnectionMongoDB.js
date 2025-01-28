/*
 * Autor: Jesús Lizama
 * Fecha Última Modificación: 15 de noviembre de 2024
 * Nombre del archivo: ConnectionMongoDB.js
 * Descripción: Este archivo contiene funciones que gestionan la conexión
 * y desconexión de una base de datos Mongo, cuya URI se toma de la variable
 * de entorno MONGO_URI
 */

import winston from '../winston/logger.js';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config()

// Función para conectar a MongoDB y devolver el cliente
let connectToMongo = async function() {
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);

  try {
    // Conectar al cliente
    await client.connect();
    winston.info('[MONGO_DB] Conexión exitosa a MongoDB');
    return client;  // Retorna el cliente para su uso posterior
  } catch (err) {
    winston.error('[MONGO_DB] Error al conectar a MongoDB:', err);
    throw err;  // Lanza el error para que se maneje en el llamador
  }
}

// Función para cerrar la conexión de MongoDB
let closeConnection = async function(client) {
  if (client) {
    try{
      await client.close();
      winston.info('[MONGO_DB] Conexión cerrada.');
    } catch (err) {
      winston.error('[MONGO_DB] No se pudo cerrar la conexión porque no existe un cliente válido: ', err);
      throw err;  // Lanza el error para que se maneje en el llamador
    }
  }
}


// Exportar las funciones para su uso en otros archivos si es necesario
export { connectToMongo, closeConnection };
