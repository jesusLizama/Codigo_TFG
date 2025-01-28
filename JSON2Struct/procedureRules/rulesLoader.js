/*
 * Autor: Jesús Lizama
 * Fecha Última Modificación: 15 de noviembre de 2024
 * Nombre del archivo: rulesLoader.js
 * Descripción: Este archivo contiene funciones que procesan todos los ficheros de reglas 
 * JSON ubicados en una carpeta especificada y devuelve un array con todas las reglas cargadas. 
 * También incluye funciones adicionales para consultar información de base de datos y realizar 
 * mapeos necesarios.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import winston from '../winston/logger.js';
import { connectToMongo, closeConnection } from '../database/ConnectionMongoDB.js'; 
import dotenv from 'dotenv';
dotenv.config();


const folderPath='./rules';
let allRules;
const mongoRules = process.env.RULES === 'mongo'



/**
 * Función que lee todos los archivos JSON en una carpeta y devuelve un array con su contenido. 
 * Si el archivo contiene un array, sus elementos se añaden al array de salida. Si el archivo contiene 
 * un objeto individual, se añade tal cual al array de salida.
 * 
 * @param {string} folderPath - Ruta de la carpeta donde se encuentran los archivos JSON.
 * @returns {Array} - Array con el contenido de todos los archivos JSON leídos.
 */
async function readRulesFolder() {
    winston.debug("Leyendo todas las reglas desde carpeta")
    try {
        // Obtener todos los ficheros de la carpeta especificada
        const files = await fs.readdir(folderPath);

        // Filtrar solo los archivos con extensión '.json'
        const jsonFiles = files.filter(file => path.extname(file) === '.json');
        const data = [];

        // Leer y procesar cada archivo JSON
        for (const file of jsonFiles) {

            const filePath = path.join(folderPath, file);
            const fileData = await fs.readFile(filePath, 'utf8');
            const jsonData = JSON.parse(fileData);

            // Si el contenido es un array, añadir sus elementos al array de salida
            if (Array.isArray(jsonData)) {
                data.push(...jsonData); 
            } else {
                // Si no es un array, añadir el objeto individual al array
                data.push(jsonData);
            }
        }
        return data;
    } catch (error) {
        winston.error('Error leyendo los ficheros:', error); 
        throw error;
    }
}


/**
 * Returns a rulesDef for a given template from file
 * @param {number} id ID of the selected template 
 * @returns rulesDef object
 */
async function getRulesFromFile(id) {
    winston.debug(`Buscando reglas de plantilla ${id}`)
    if (allRules == undefined) 
        allRules = await readRulesFolder()
    return allRules.find((r) => r.id == id);
}




/**
 * Función para obtener las reglas desde MongoDB por ID.
 * @param {number} id - El ID de la plantilla.
 * @returns {object} - El documento con las reglas en formato JSON.
 */
async function getRulesFromMongo(id) {
    let client

    try {
        winston.debug(`[RULES] Buscando reglas desde MongoDB para plantilla ${id}`);

        // Conectar a MongoDB
        client = await connectToMongo();
        const database = client.db('ehr2omop');
        const collection = database.collection('rules');
        id = parseInt(id, 10);

        // Buscar el documento por ID
        const document = await collection.findOne({ plantilla_id: id });
        if (document) {
            const parsedCode = JSON.parse(document.code);  // Convierte la cadena a un objeto JSON para que no pete
            winston.debug("[RULES] El contenido de la regla después de parsearla: ", parsedCode);

            return parsedCode;  // Devuelve el objeto JSON parseado
        } else {
            winston.warn(`[RULES] No se encontró documento con plantilla_id: ${id}`);
            return {id:id};
        }
    
    } catch (error) {
        winston.error('[RULES] Error buscando en MongoDB:', error);
        throw error;
    
    } finally {
        if (client) {
            // Cerrar la conexión a MongoDB
            await closeConnection(client);
        }
    }
}

/**
* Función para obtener las reglas asociadas a una plantilla según su ID.
* Determina la fuente de las reglas basándose en la configuración del sistema.
* Si `mongoRules` está activado, busca las reglas en una base de datos MongoDB.
* En caso contrario, las obtiene desde un archivo local.
* 
* @param {number} id - El ID único de la plantilla para la que se buscan las reglas.
* @returns {Promise<object>} - Un objeto JSON que representa las reglas asociadas a la plantilla.
* 
*/  
async function getRules(id) {
    if (mongoRules) {
        return getRulesFromMongo(id);
    } else {
        return getRulesFromFile(id);
    }
}


export default { getRules };
