/*
 * Autor: Jesús Lizama
 * Fecha Última Modificación: 22 de octubre de 2024
 * Nombre del archivo: Querys.js
 * Descripción: Este archivo contiene funciones las cuales acceden a una base de datos y devuelven los datos
 * pertinenetes dependiendo de cada consulta
 */

// Función de ejemplo para ejecutar consulta sobre conexion a base de datos.
async function executeQuery(client, tableName, pcia, idInstancia) {
    const query = `SELECT * FROM "${tableName}" WHERE "PCIA" = $1 AND "ID_INSTANCIA_DATO" = $2`;
    const values = [pcia, idInstancia];
    const result = await client.query(query, values);

    if (result.rows.length === 0) {
        return [];
    }
    return result.rows;

}

// Función la cual dada una conexiona la base, el id de arquetipo y el de instancia de dato, te extrae
// los resutados la funcion
async function executeQueryParameters(client, id_arq, id_plant) {
    
    return "ID_ARQ: " + id_arq + " ID_PLANT: " + id_plant;
}

module.exports = { executeQuery, executeQueryParameters };
