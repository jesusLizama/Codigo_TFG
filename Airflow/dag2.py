from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash_operator import BashOperator
from airflow.providers.docker.operators.docker import DockerOperator
from datetime import datetime, timedelta
from docker.types import Mount
import time


# Función para imprimir un mensaje en los logs
def esperar(num_seg):
    print("Vamos a hacer una espera de {num_seg} segundos para arrancar el contenedor!")
    time.sleep(num_seg)


# Definir el DAG
with DAG(
    'EHR_a_estructurado',
    default_args={
        'owner': 'airflow',
        'retries': 1,
        'retry_delay': timedelta(minutes=5),
    },
    description='Extracción de datos de Historia Clínica a repositorio estructurado',
    schedule_interval=None,  # No tiene horario de ejecución, se ejecutará manualmente
    start_date=datetime(2024, 12, 4),
    catchup=False,
) as dag:


    lectura_ehr = BashOperator(
        task_id='lectura_ehr',
        bash_command='/opt/airflow/lib/scripts/execute_knime.sh ',
        #run_as_user="airflow",
        queue='bigan-syn-01.bigan.eu', # es imprescindible que lo ejecute un worker distinto de syn-02, que es quien tiene knime
    )

    # Tarea para ejecutar el contenedor Data_2_JSON
    task_docker_data = DockerOperator(
        task_id='data_2_json',
        queue='bigan-syn-01.bigan.eu', # es imprescindible que lo ejecute un worker distinto de syn-02, que es quien tiene knime
        image='nexus.bigan.eu:8443/bigan/node:1.0.0',  # Nombre de la imagen Docker
        command="/bin/sh -c 'npm i && node index.js'",
        docker_url='http://X.X.X.X:2375',  # Docker API URL (puerto expuesto del host)
        network_mode='bridge',  # Usar la red predeterminada. Docker trabaja con bridge
        mounts=[Mount(source="/data/ehr2struct/Data2JSON/DataETL_Node", target="/usr/src/app", type="bind")],
        auto_remove=True,  # Eliminar el contenedor después de su ejecución
        environment={
            'DB_USER':'xxx',
            'DB_HOST':'xxx',
            'DB_NAME':'xxx',
            'DB_PASSWORD':'xxx',
            'DB_PORT':'5432',
            'QUERY_WHERE':'"ID_PLANTILLA" = 582 LIMIT 100',
            'NOMBRE':'false',
            'REDIS':'true',
            'FICHERO':'false',
            'REDIS_PASSWORD':'xxx',
            'REDIS_USER':'xxx',
            'REDIS_HOST':'xxx',
            'REDIS_PORT':'6379',
            'LOG_TO_CONSOLE': 'true',
            'LOG_TO_FILE' : 'false',
            'LOG_FILENAME': '/tmp/data2json/data2json.log',
            'LOG_LEVEL' : 'info', # debug|info|warn|error
        }
    )

    # Tarea para ejecutar el contenedor JSON_2_struct
    task_docker_json = DockerOperator(
        task_id='json_2_struct',
        queue='bigan-syn-01.bigan.eu', # es imprescindible que lo ejecute 01 para enviarlo a 03
        image='xxx.xxx.xxx:8443/bigan/node:1.0.0',  # Nombre de la imagen Docker
        command='node index.js',  # Comando a ejecutar dentro del contenedor
        docker_url='http://X.X.X.X:2375',  # Docker API URL (puerto expuesto del host)
        network_mode='bridge',  # Usar la red predeterminada. Docker trabaja con bridge
        mounts=[Mount(source="/data/ehr2struct/JSON2Struct", target="/usr/src/app", type="bind")],
        auto_remove=True,  # Eliminar el contenedor después de su ejecución
        environment={
            'DB_USER':'xxx',
            'DB_HOST':'xxx',
            'DB_NAME':'xxx',
            'DB_PASSWORD':'xxx',
            'DB_PORT':'5432',
            'DB_SCHEMA':'xxx',
            'NOMBRE':'false',
            'RULES':'mongo',
            'MONGO_URI':'mongodb://xxx:27017/',
            'INPUT':'redis', # [ redis, console ]
            'OUTPUT':'redis', # [ redis, console ]
            'REDIS_PASSWORD':'xxx',
            'REDIS_USER':'xxx',
            'REDIS_HOST':'xxx',
            'REDIS_PORT':'6379',
            'LOG_TO_CONSOLE': 'true',
            'LOG_TO_FILE' : 'false',
            'LOG_FILENAME': '/tmp/json2omop/json2omop.log',
            'LOG_LEVEL' : 'info', # debug|info|warn|error
        }
    )


    # Tarea para ejecutar el contenedor Prisma Omop
    task_docker_omop = DockerOperator(
        task_id='struc_to_omop',
        queue='bigan-syn-01.bigan.eu', # es imprescindible que lo ejecute 01 para enviarlo a 03
        image='nexus.bigan.eu:8443/bigan/node:1.0.0',  # Nombre de la imagen Docker
        command='node index.js',  # Comando a ejecutar dentro del contenedor
        docker_url='http://X.X.X.X:2375',  # Docker API URL (puerto expuesto del host)
        network_mode='bridge',  # Usar la red predeterminada. Docker trabaja con bridge
        mounts=[Mount(source="/data/ehr2struct/Prisma_Omop", target="/usr/src/app", type="bind")],
        auto_remove=True,  # Eliminar el contenedor después de su ejecución
        environment={
            'DATABASE_URL' : 'postgresql://xxx:xxx@xxx:5432/xxx?schema=xxx',
            'REDIS_PASSWORD':'xxx',
            'REDIS_USER':'xxx',
            'REDIS_HOST':'xxx',
            'REDIS_PORT':'6379',
            'LOG_TO_CONSOLE': 'true',
            'LOG_TO_FILE' : 'false',
            'LOG_FILENAME': '/tmp/prisma_omop/prisma_omop.log',
            'LOG_LEVEL' : 'info', # debug|info|warn|error
            'QUEUE' : 'omop',
        }
    )

    # Fijamos la precedencia de las tareas
    task_docker_json
    task_docker_omop
    lectura_ehr >> task_docker_data

