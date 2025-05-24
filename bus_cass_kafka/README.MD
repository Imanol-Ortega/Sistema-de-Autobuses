# Bus Cassandra Kafka Ingestor

Este proyecto implementa un sistema distribuido para la ingestión, procesamiento y almacenamiento de datos relacionados con el transporte público. Utiliza **Apache Kafka** como sistema de mensajería, **Cassandra** como base de datos distribuida y un conjunto de scripts y servicios para simular, procesar y almacenar datos en tiempo real.

## Funcionalidad Principal

El software está diseñado para procesar datos de transporte público, como información de choferes, usuarios, paradas, buses, pagos, recorridos y viajes. Los datos se generan de manera simulada, se envían a través de Kafka y se almacenan en Cassandra para su posterior análisis.

### Flujo de Datos

1. **Generación de Datos**: 
   - El script [`testeanding/enviar_msg.py`](testeanding/enviar_msg.py) genera datos simulados utilizando la librería `Faker` y los envía a los tópicos de Kafka.

2. **Procesamiento de Datos**:
   - El servicio principal, implementado en [`connectors/black_magic.js`](connectors/black_magic.js), consume mensajes de los tópicos de Kafka, los procesa y los inserta en las tablas correspondientes de Cassandra.

3. **Almacenamiento de Datos**:
   - Los datos procesados se almacenan en un clúster de Cassandra, utilizando un esquema definido en [`init-scripts/cassandra/init.cql`](init-scripts/cassandra/init.cql).

## Arquitectura del Clúster

El sistema utiliza un clúster distribuido compuesto por los siguientes servicios:

### 1. **Cassandra**
   - Base de datos distribuida para almacenar los datos procesados.
   - Configurada con dos nodos (`cassandra` y `cassandra2`) para alta disponibilidad.
   - El esquema de la base de datos se inicializa con [`init-scripts/cassandra/init.cql`](init-scripts/cassandra/init.cql).
   - Datos iniciales se insertan con [`init-scripts/cassandra/seed_data.py`](init-scripts/cassandra/seed_data.py).

### 2. **Kafka**
   - Sistema de mensajería distribuido para manejar los datos en tiempo real.
   - Configurado con tres nodos (`kafka1`, `kafka2`, `kafka3`) para tolerancia a fallos.
   - Los tópicos de Kafka se crean automáticamente con el servicio `topic-creator`.

### 3. **Ingestores**
   - Servicios Node.js implementados en [`connectors/black_magic.js`](connectors/black_magic.js).
   - Consumen mensajes de Kafka y los almacenan en Cassandra.
   - Se ejecutan en contenedores Docker (`ingestor1`, `ingestor2`) para escalabilidad.

### 4. **Simulador de Datos**
   - Script Python [`testeanding/enviar_msg.py`](testeanding/enviar_msg.py) que genera datos simulados y los envía a Kafka.

## Como iniciar los servicios

En una terminal, una vez en el directorio del proyecto, ejecutar "docker compose up -d"
Si tienen instalado Docker Desktop pueden ver los logs de los distintos contenedores, tarda aproximadamente unos 5 minutos en terminar de encenderse.
Una vez que diga "(～￣▽￣)～(～￣▽￣)～ Ingestor corriendo …" en ambos contenedores ingestores, el sistema de ingesta y guardado de datos mediante mensajes ya debería funcionar en ambos contenedores Cassandra.

### Requisitos Previos

- Docker y Docker Compose instalados.
- Python 3.10 o superior (para ejecutar scripts locales).

### Variables de Entorno

El archivo [`.env`](.env) contiene las configuraciones necesarias para Kafka y Cassandra, incluyendo:

- Brokers de Kafka.
- Puntos de contacto y credenciales de Cassandra.
- Nombres de los tópicos.
