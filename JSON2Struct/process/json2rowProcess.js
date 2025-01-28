/*
 * Autor: Jesús Lizama
 * Fecha Última Modificación: 30 de noviembre de 2024
 * Nombre del archivo: json2rowProcess.js
 * Descripción: Este módulo contienes las funciones que permiten, de una forma
 * recursiva tanto sobre los nodos del árbol de la estructura de un documento como de la 
 * estructura de las reglas de mapeo, transformar un documento JSON con una estructura 
 * jerárquica (informe clínico) en un documento JSON con la estructura de un registro
 * estructurado plano (SQL), de acuerdo con un conjunto de reglas de mapeo.
 * El método "processRules" finalmente envía los documentos resultantes a través del Sender
 * especificado. Esto se hace así, porque un mismo documento puede dar lugar a n documentos
 * finales, y por tanto enviar esos n documentos a través de m canales de salida, y 
 * resulta más sencillo procesarlo así, que devolver un array de documentos a enviar.
 */

import winston from '../winston/logger.js';

/**
 * Array Prototype Function to allow easy filtering by "id"
 * Handles null or undefined arrays gracefully
 */
Object.defineProperty(Array.prototype, "id", {
    enumerable: false,
    writable: false,
    value: function(i) {
        if (!this || !Array.isArray(this)) {
            return null; 
        }
        return this.find(e => e.id == i) || null; 
    }
});

/**
 * Array Prototype Function to allow easy filtering by "id"
 * Handles null or undefined arrays gracefully
 * Filters by id and ESTADO === 'C'
 */
Object.defineProperty(Array.prototype, "idDato", {
    enumerable: false,
    writable: false,
    value: function(i) {
        if (!this || !Array.isArray(this)) {
            return null; 
        }
        return this.find(e => e.id == i && e.ESTADO === 'C') || null; 
    }
});


/**
 * Recursive processing a set of rules over a single element and a tree of rules
 * @param {Object} tree Whole tree with data to be extracted
 * rulesDef: rulesDef  Whole set of rules for a given level and sublevels. rulesDef contains [rule_set] and [child_rules] 
 * ruleSet (rule_set): Complete map definition from a rules/element level to table records
 * field_map: Mapping between specific tree elements (identified by path) and table fields
 * 
 * @param {Object} rulesDef  Whole set of rules for a given level and sublevels
 * @param {Object} element Specific branch to which we are applying the ruleSet
 */
async function processElement(tree, rulesDef, element, sender) {
    winston.debug(`Procesando elemento '${element.level}' '${element.id}'`);
   
    // Si hay conjunto de reglas, ejecutamos reglas sobre el elemento
    if (rulesDef.rule_set) {
        processRules(tree, rulesDef.rule_set, element, sender)
    }
    
    // Si hay subreglas, ejecutamos recursivamente
    if (rulesDef.child_rules) {
        winston.debug("Hay hijos a este nivel.");
        rulesDef.child_rules.map(r => processContentArray(tree, r, element.content.filter(e => e.id == r.id), sender))
    }
}



/**
 * Recursive processing a set of rules over an array of elements
 * @param {Object} tree Whole tree with data to be extracted
 * @param {Object} rulesDef Whole set of rules for a given level
 * @param {array} contentArray Array of data elements in a givel level
 */
async function processContentArray(tree, rulesDef, elements, sender) {
    winston.debug(`Procesando reglas de '${rulesDef.level}' '${rulesDef.id}'`);

    if (rulesDef) {
        elements.map(e => processElement(tree, rulesDef, e, sender))
    }
}



/**
 * Process the mapping of an element and a set of rules
 * In the field_map of the ruleSet:
 *  - t refers to the target table
 *  - d refers to the whole data tree
 *  - e refers to the current element in the tree, particularly when e is an element in an iterator
 * 
 * @param {Object} tree Whole tree with data to be extracted
 * @param {Array} ruleSet  Complete map definition from a rules/element level to table records
 * @param {Object} element Specific branch to which we are applying the ruleSet
 */
async function processRules(tree, ruleSet, element, sender){
    const d = tree;
    const e = element;

    for (const rule of ruleSet) {
        // Verificamos si la condición de la regla se cumple
        if ((rule.condition != undefined) & eval(rule.condition)) {
            const t = {}; //Para almacenar los resultados

            winston.debug(`Aplicando mapeos para la regla con 'tabla_destino': ${rule.target_table}`);    
            // Procesar cada mapeo dentro de la regla
            for (const m of rule.field_map) {
                try {
                    eval(m); 
                } catch (error) {
                    winston.warn(`Error al aplicar el mapeo al campo: ${m} - ${error.message}`);
                }
            }
            // sender.sendRow({
            //         "target_table":rule.target_table,
            //         "queue": rule.queue,
            //         "record": t
            // });

            // Guarda el objeto en una variable
            const message = {
                "target_table": rule.target_table,
                "queue": rule.queue,
                "record": t
            };

            // Muestra el contenido de la variable en formato JSON
            winston.debug('[DEBUG] Enviando mensaje:', JSON.stringify(message, null, 2));

            // Envía el mensaje utilizando la variable
            sender.sendRow(message);



        } else {
            winston.info(`Condición de la regla con ID ${rule.id} no cumplida. No se aplica.`);
        }
    }    
}

export default { processElement };