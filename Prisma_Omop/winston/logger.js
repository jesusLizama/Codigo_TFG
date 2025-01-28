/*
 * Autor: Jesús Lizama
 * Fecha Última Modificación: 27 de diciembre de 2024
 * Nombre del archivo: logger.js
 * Descripción: Este archivo contiene la configuracion necesaria para la creacion de logs
 * mediante winston. Especificamos los 4 niveles de depuracion necesarios y la posibilidad de 
 * mostrarlo por termnal y/o en fichero.
 */

import winston from 'winston';
import dotenv from 'dotenv';
dotenv.config();

// Leer configuraciones desde el archivo .env
let logToConsole = process.env.LOG_TO_CONSOLE === 'true';
const logToFile = process.env.LOG_TO_FILE === 'true';
const logLevel = process.env.LOG_LEVEL || 'error';
const logFilename = process.env.LOG_FILENAME;
// Crear transportes dinámicos según configuración
const transports = [];

// Transport para consola
if (logToConsole) {
  transports.push(
    new winston.transports.Console({
      level: logLevel, 
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), 
        winston.format.printf(({ level, timestamp, message }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
      ),
    })
  );
}

// Transportes para archivos según el nivel configurado
if (logToFile) {
  // Siempre incluir 'error.log'
  transports.push(
    new winston.transports.File({
      filename: logFilename,
      level: 'error',
    })
  );

  // Incluir 'warn.log' si el nivel es 'warn', 'info' o 'debug'
  if (logLevel === 'warn' || logLevel === 'debug' || logLevel === 'info') {
    transports.push(
      new winston.transports.File({
        filename: logFilename,
        level: 'warn',
      })
    );
  }

  // Incluir 'warn.log' si el nivel es 'info' o 'debug'
  if (logLevel === 'info' || logLevel === 'debug') {
    transports.push(
      new winston.transports.File({
        filename: logFilename,
        level: 'info',
      })
    );
  }

  // Incluir 'debug.log' si el nivel es 'debug'
  if (logLevel === 'debug') {
    transports.push(
      new winston.transports.File({
        filename: logFilename,
        level: 'debug', 
      })
    );
  }
}

// Verificar si el vector de transports está vacío
if (transports.length === 0) {
  // Añadir un transport por defecto a la consola para que no de error
  transports.push(
    new winston.transports.Console({
      level: 'error', // Nivel predeterminado
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ level, timestamp, message }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
      ),
    })
  );
}

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), 
    winston.format.printf(({ level, timestamp, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports,
});


export default logger; 
