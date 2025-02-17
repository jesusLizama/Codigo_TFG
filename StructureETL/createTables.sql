CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_ACTIVIDADES" (
    "ID_ACTIVIDAD" NUMERIC PRIMARY KEY,
    "NOMBRE_CORTO" VARCHAR(255),
    "NOMBRE_MOSTRADO" VARCHAR(255),
    "OBLIGATORIO" VARCHAR(10),
    "ESTADO" NUMERIC,
    "DURACION" NUMERIC,
    "ES_PERIODICA" VARCHAR(10),
    "PERIODICIDAD_UNIDAD" VARCHAR(10),
    "PERIODICIDAD_VALOR" NUMERIC,
    "COMPARTE_LANZADERA" VARCHAR(10),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_ARQUETIPOS" (
    "ID_ARQUETIPO" NUMERIC PRIMARY KEY,
    "TIPO_CARDINALIDAD" NUMERIC,
    "NOMBRE" VARCHAR(255),
    "ESTATICO" VARCHAR(10),
    "ID_TILE" VARCHAR(255),
    "FECHA_BAJA" TIMESTAMP,
    "CAMPO_HL7" VARCHAR(255),
    "NOMBRE_MOSTRADO" VARCHAR(255),
    "OCULTAR_NOMBRE" VARCHAR(10),
    "NIVEL_TITULO" VARCHAR(255),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_ARQUETIPOS_CARD" (
    "TIPO_CARDINALIDAD" NUMERIC PRIMARY KEY,
    "DESCRIPCION" VARCHAR(255),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_DATOBASICO" (
    "ID_DATOBASICO" NUMERIC PRIMARY KEY,
    "TIPO_BASICO" NUMERIC,
    "TIPO_CARDINALIDAD" NUMERIC,
    "NOMBRE" VARCHAR(255),
    "FECHA_BAJA" TIMESTAMP,
    "CAMPO_HL7" VARCHAR(255),
    "NOMBRE_MOSTRADO" VARCHAR(255),
    "OCULTAR_NOMBRE" VARCHAR(10),
    "ID_TILE" VARCHAR(255),
    "UNIDAD" VARCHAR(255),
    "LISTA_VALORES" NUMERIC,
    "VER_FECHA" VARCHAR(10),
    "ESTATICO" VARCHAR(10),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_DATOBASICO_CARD" (
    "TIPO_CARDINALIDAD" NUMERIC PRIMARY KEY,
    "DESCRIPCION" VARCHAR(255),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_DATOBASICO_PRUEBAS" (
    "ID_DATOBASICO" NUMERIC,
    "TIPO_BASICO" NUMERIC,
    "TIPO_CARDINALIDAD" NUMERIC,
    "NOMBRE" VARCHAR(255),
    "FECHA_BAJA" TIMESTAMP,
    "CAMPO_HL7" VARCHAR(255),
    "NOMBRE_MOSTRADO" VARCHAR(255),
    "OCULTAR_NOMBRE" VARCHAR(10),
    "ID_TILE" VARCHAR(255),
    "UNIDAD" VARCHAR(255),
    "LISTA_VALORES" NUMERIC,
    "VER_FECHA" VARCHAR(10),
    "ESTATICO" VARCHAR(10),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_DATOTABLA" (
    "ID_TABLA" NUMERIC PRIMARY KEY,
    "ID_DATOBASICO" NUMERIC,
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_DATOTABLA_COLUM" (
    "ID_TABLA" NUMERIC,
    "ID_COLUMNA" NUMERIC,
    "TEMPLATE_ID_DATOBASICO" NUMERIC,
    PRIMARY KEY ("ID_TABLA", "ID_COLUMNA"),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_DATO_CATALOGOS" (
    "ID_DATOBASICO" NUMERIC PRIMARY KEY,
    "ID_CATALOGO" NUMERIC,
    "ID_SUBSET" NUMERIC,
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_DATO_DIAGNOSTICOS" (
    "ID_DATOBASICO" NUMERIC PRIMARY KEY,
    "TIPO_DIAGNOSTICO" NUMERIC,
    "ID_CATALOGO" NUMERIC,
    "ID_SUBSET" NUMERIC,
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_DATO_ESTATICO" (
    "ID_DATOBASICO" NUMERIC PRIMARY KEY,
    "CONTENT_HTML" VARCHAR(4000),
    "FUNCTION_JS" VARCHAR(50),
    "ESTATICO_OPTIONS_JS" VARCHAR(4000),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_DATO_PLANT_DEPEND" (
    "ID_DATOBASICO" NUMERIC PRIMARY KEY,
    "ID_PLANTILLA" NUMERIC,
    "MENSAJE" VARCHAR(4000),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_DATO_REFERENCIA" (
    "ID_DATOBASICO" NUMERIC PRIMARY KEY,
    "REFERENCIA_OPTIONS_JS" VARCHAR(4000),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_LANZADERA" (
    "CATALOGO" VARCHAR(20),
    "DIAGNOSTICO" VARCHAR(2000),
    "ID_PLAN" NUMERIC,
    "EDAD_MAX" VARCHAR(20),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_LISTAVALORES" (
    "ID_LISTA" NUMERIC PRIMARY KEY,
    "DESCRIPCION" VARCHAR(50),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_LISTAVALORES_DETALLE" (
    "ID_INTERNO" NUMERIC PRIMARY KEY,
    "ID_LISTA" NUMERIC,
    "VALOR" NUMERIC,
    "DESCRIPCION" VARCHAR(1000),
    "ORDEN" NUMERIC,
    "VALOR_DEFECTO" VARCHAR(1),
    "CAMPO_HL7" VARCHAR(40),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_PLANES_PERSONALES" (
    "ID_PLAN" NUMERIC PRIMARY KEY,
    "NOMBRE_CORTO" VARCHAR(100),
    "NOMBRE_MOSTRADO" VARCHAR(100),
    "ROL_DEFINE" NUMERIC,
    "ROL_EJECUTA" NUMERIC,
    "DURACION_UNIDAD" VARCHAR(80),
    "DURACION_VALOR" NUMERIC,
    "ESTADO" NUMERIC,
    "ID_EPISODIO" NUMERIC,
    "FECHA_BAJA" TIMESTAMP,
    "VISIBILIDAD" VARCHAR(20),
    "RANGO_EDAD" VARCHAR(20),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_PLANTILLAS" (
    "ID_PLANTILLA" NUMERIC PRIMARY KEY,
    "NOMBRE" VARCHAR(200),
    "EDITABLE_SGP" VARCHAR(1),
    "FECHA_BAJA" TIMESTAMP,
    "CAMPO_HL7" VARCHAR(30),
    "RELACION_EPICON" VARCHAR(1),
    "TIPO_CARDINALIDAD" NUMERIC DEFAULT 2,
    "TIENE_ESTADO" VARCHAR(1) DEFAULT 'S',
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_PLANTILLAS_CARD" (
    "TIPO_CARDINALIDAD" NUMERIC PRIMARY KEY,
    "DESCRIPCION" VARCHAR(25),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_REL_ACTIV_TAREA" (
    "ID_INTERNO" NUMERIC PRIMARY KEY,
    "ID_ACTIVIDAD" NUMERIC,
    "ID_TAREA" NUMERIC,
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_REL_ARQUET_DATOBASIC" (
    "ID_INTERNO" NUMERIC,
    "ID_ARQUETIPO" NUMERIC,
    "ID_DATOBASICO" NUMERIC,
    "ORDEN" NUMERIC,
    "OBLIGATORIO" VARCHAR(1),
    "CM_NOMBRE_MOSTRADO" VARCHAR(100),
    "CM_VER_NOMBRE" VARCHAR(1),
    "CM_UNIDAD" VARCHAR(20),
    "CM_VER_FECHA" VARCHAR(1),
    "CM_CLASES_CSS" VARCHAR(4000),
    "CM_ESTILOS_CSS" VARCHAR(4000),
    "CM_PRE_HEADER_HTML" VARCHAR(4000),
    "CM_POST_HEADER_HTML" VARCHAR(4000),
    "CM_PRE_FOOTER_HTML" VARCHAR(4000),
    "CM_POST_FOOTER_HTML" VARCHAR(4000),
    "DT_MAXLENGTH" NUMERIC,
    "DT_ENABLE_RTF" VARCHAR(1),
    "CM_ENABLE_VALORES_PREVIOS" VARCHAR(1),
    "CM_ENABLE_PREREDACTADOS" VARCHAR(1),
    "CM_OPTIONS_JS" VARCHAR(4000),
    "DNUM_ENABLE_SPINNER" VARCHAR(1),
    "DNUM_ENABLE_SLIDER" VARCHAR(1),
    "CM_TITLE" VARCHAR(4000),
    PRIMARY KEY ("ID_INTERNO", "ID_ARQUETIPO", "ID_DATOBASICO"),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_REL_PLANT_ARQUET" (
    "ID_INTERNO" NUMERIC,
    "ID_PLANTILLA" NUMERIC,
    "ID_ARQUETIPO" NUMERIC,
    "OBLIGATORIO" VARCHAR(1),
    "ORDEN" NUMERIC,
    "ID_AGRUPADOR" NUMERIC,
    "NOMBRE_MOSTRADO" VARCHAR(100),
    "VER_NOMBRE" VARCHAR(1),
    "CLASES_CSS" VARCHAR(4000),
    "ESTILOS_CSS" VARCHAR(4000),
    "PRE_HEADER_HTML" VARCHAR(4000),
    "POST_HEADER_HTML" VARCHAR(4000),
    "PRE_FOOTER_HTML" VARCHAR(4000),
    "POST_FOOTER_HTML" VARCHAR(4000),
    PRIMARY KEY ("ID_INTERNO", "ID_PLANTILLA", "ID_ARQUETIPO"),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_REL_PLAN_ACTIV" (
    "ID_INTERNO" NUMERIC PRIMARY KEY,
    "ID_PLAN" NUMERIC,
    "ID_ACTIVIDAD" NUMERIC,
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_TAREAS" (
    "ID_TAREA" NUMERIC PRIMARY KEY,
    "NOMBRE_CORTO" VARCHAR(100),
    "NOMBRE_MOSTRADO" VARCHAR(100),
    "OBLIGATORIO" VARCHAR(1),
    "ROL_EJECUTA" NUMERIC,
    "TIPO_TAREA" NUMERIC,
    "ES_PERIODICA" VARCHAR(1),
    "PERIODICIDAD_UNIDAD" VARCHAR(80),
    "PERIODICIDAD_VALOR" NUMERIC,
    "FECHA_BAJA" DATE,
    "RANGO_EDAD" VARCHAR(20),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_TAREA_TIPO_APLICACION" (
    "ID_TAREA" NUMERIC PRIMARY KEY,
    "ID_APLICACION" NUMERIC,
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_TAREA_TIPO_APL_PARAMS" (
    "ID_TAREA" NUMERIC,
    "NOMBRE_PARAM" VARCHAR(100),
    "VALUE_PARAM" VARCHAR(500),
    "ID_PARAM" NUMERIC PRIMARY KEY,
    CHECK ("NOMBRE_PARAM" IS NOT NULL),
    CHECK ("ID_PARAM" IS NOT NULL),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_TAREA_TIPO_CHECKBOX" (
    "ID_TAREA" NUMERIC PRIMARY KEY,
    "DESCRIPCION" VARCHAR(200),
    "LISTA_VALORES" NUMERIC,
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_TAREA_TIPO_GENERICA" (
    "ID_TAREA" NUMERIC PRIMARY KEY,
    "DESCRIPCION" VARCHAR(200),
    "LISTA_VALORES" NUMERIC,
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_TAREA_TIPO_PLANTILLA" (
    "ID_TAREA" NUMERIC PRIMARY KEY,
    "ID_PLANTILLA" NUMERIC,
    "ID_DATOBASICO_RESUMEN" VARCHAR(200),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_TAREA_TIPO_SUPERPLAN" (
    "ID_TAREA" NUMERIC PRIMARY KEY,
    "ID_PLAN" NUMERIC,
    "ID_DATOBASICO_RESUMEN" VARCHAR(200),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_TIPO_APLICACION" (
    "ID_APLICACION" NUMERIC PRIMARY KEY,
    "DESCRIPCION" VARCHAR(200),
    "ACTION" VARCHAR(200),
    "NAMESPACE" VARCHAR(200),
    "OPTIONS_JS" VARCHAR(2000),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

//DESDE AQUI PARA ABAJO LAS NUEVAS!!!

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_PLANES_PERSONALES" (
    "ID_PLAN" NUMERIC PRIMARY KEY,
    "NOMBRE_CORTO" VARCHAR(100),
    "NOMBRE_MOSTRADO" VARCHAR(100),
    "ROL_DEFINE" NUMERIC,
    "ROL_EJECUTA" NUMERIC,
    "DURACION_UNIDAD" VARCHAR(80),
    "DURACION_VALOR" NUMERIC,
    "ESTADO" NUMERIC,
    "ID_EPISODIO" NUMERIC,
    "FECHA_BAJA" DATE,
    "VISIBILIDAD" VARCHAR(20),
    "RANGO_EDAD" VARCHAR(20),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_REL_PLAN_ACTIV" (
    "ID_INTERNO" NUMERIC PRIMARY KEY,
    "ID_PLAN" NUMERIC,
    "ID_ACTIVIDAD" NUMERIC,
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_TAREA_TIPO_APLICACION" (
    "ID_TAREA" NUMERIC PRIMARY KEY,
    "ID_APLICACION" NUMERIC,
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_TAREA_TIPO_APL_PARAMS" (
    "ID_TAREA" NUMERIC,
    "NOMBRE_PARAM" VARCHAR(100),
    "VALUE_PARAM" VARCHAR(500),
    "ID_PARAM" NUMERIC PRIMARY KEY,
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_TAREA_TIPO_CHECKBOX" (
    "ID_TAREA" NUMERIC PRIMARY KEY,
    "DESCRIPCION" VARCHAR(200),
    "LISTA_VALORES" NUMERIC,
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_TAREA_TIPO_GENERICA" (
    "ID_TAREA" NUMERIC PRIMARY KEY,
    "DESCRIPCION" VARCHAR(200),
    "LISTA_VALORES" NUMERIC,
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_TAREA_TIPO_PLANTILLA" (
    "ID_TAREA" NUMERIC PRIMARY KEY,
    "ID_PLANTILLA" NUMERIC,
    "ID_DATOBASICO_RESUMEN" VARCHAR(200),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);

CREATE TABLE IF NOT EXISTS "hce_model"."SGP_DEF_TAREA_TIPO_SUPERPLAN" (
    "ID_TAREA" NUMERIC PRIMARY KEY,
    "ID_PLAN" NUMERIC,
    "ID_DATOBASICO_RESUMEN" VARCHAR(200),
    "ULTIMA_ACTUALIZACION" TIMESTAMP,
    "REVISADO" BOOLEAN,
    "SOURCE_CD" VARCHAR(50),
    "SOURCE_CONCEPT_ID" INTEGER,
    "CONCEPT_ID" INTEGER
);




