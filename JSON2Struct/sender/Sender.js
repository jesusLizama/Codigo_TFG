/* Autor: Jesús Lizama
 * Fecha Última Modificación: 20 de Diciembre de 2024
 * Nombre del archivo: Sender.js
 * Descripción: Este archivo define una jerarquía de clases para modelar el envío de registros estructurados 
 * hacia distintos destinos, incluyendo colas Redis (`QueueSender`) y consola (`ConsoleSender`). Permite la 
 * publicación de mensajes, gestión de notificaciones de finalización y cierre de conexiones y
 * cargando configuraciones desde un archivo `.env`.
 */

import { connectRedis, disconnectRedis } from '../database/redisConnection.js';
import winston from '../winston/logger.js';
import dotenv from 'dotenv';
dotenv.config();


/**
 * Class to model any sender to send structured records
 */
class Sender {

    constructor() {
    }


    /**
     * Send a record to a sender
     * @param {any} record 
     */
    sendRow(record) {
    }

    /**
     * Send end notification message
     */
    sendEndNotification(){}

    /**
     * End queue processing
     */
    endProcessing(){}
}


/**
 * Sender modeled in a Redis queue
 */
export class QueueSender extends Sender {
    
    constructor(client) {
        super();
        this.client = client;
        this.queueList = new Set(process.env.DEFAULT_QUEUES ? process.env.DEFAULT_QUEUES.split(' '):[]);
        winston.debug(`[SENDER] Lista de colas por defecto: ${JSON.stringify(Array.from(this.queueList))}`);
    }


    static async build() {
        let client = await connectRedis();
        return new QueueSender(client);
    }


    quit() {
        disconnectRedis(this.client);
    }


    /**
     * Función para procesar un mensaje recibido de la cola y enviarlo a la cola de salida
     */
    sendRow(record) {
        try {
            const channelName = record.queue ? record.queue : 'default'; // Usamos el campo `queue` como el nombre del canal
            winston.debug(`[SENDER] Publicando mensaje en el canal ${channelName}`);

            if (!this.client || !this.client.isOpen) {
                winston.error("[SENDER] El cliente Redis no está conectado o no está definido.");
                return;
            }
            
            // Publicar el mensaje en el canal
            this.client.lPush(channelName, JSON.stringify(record));
            this.queueList.add(channelName);
            winston.debug('[SENDER] Mensaje publicado en el canal');
        } catch (error) {
            winston.error('[SENDER] Error al publicar el mensaje en el canal:', error);
        }
    }


    /**
     * Sends a message notifying the end of messages
     */
    sendEndNotification(){
        try {
            this.queueList.forEach ( q => {
                this.sendRow({
                    "target_table": -1,
                    "queue": q, 
                    "record": ""
                });
            })
            winston.info('[SENDER] Mensaje de finalización enviado por Redis');
        } catch (error) {
            winston.error('[SENDER] Error al enviar mensaje de finalización:', error);
        }
    }

    /**
     * Manages the end of processing, closing the redis connection
     */
    endProcessing() {
        // Si el contador ha llegado a 0 implica que ya se han procesado todos los JSON y se 
        // han enviado, con lo cual cerramos la conexion de escritura.
        winston.debug("[SENDER] 0 mensajes pendientes. Cerramos canal de escritura!!!");
        
        // Enviamos -1 para avisar de que hemos acabado de enviar.
        this.sendEndNotification();

        // Cerrar conexiones
        this.quit();
    }

}


/**
 * Class that sends a message to console
 */
export class ConsoleSender extends Sender {

    constructor() {
        super();
    }


    sendRow(record) {
        winston.debug("Resultado del procesamiento de la regla:", record);
        winston.debug("------------------------");
    }

    
    sendEndNotification(){
        try {
            this.sendRow({
                "target_table": -1,
                "queue": "folder",    // TODO debe enviarse a todas las colas
                "record": ""
            });
            winston.info('[CONSOLE] Mensaje de finalización enviado por consola: ' );
        } catch (error) {
            winston.error('[CONSOLE] Error al enviar mensaje de finalización:', error);
        }
    }    


    endProcessing() {
        this.sendEndNotification();
    }

}

