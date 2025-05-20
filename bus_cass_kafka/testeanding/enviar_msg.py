#!/usr/bin/env python3
import json
import time
import random
import uuid
import datetime
from confluent_kafka import Producer
from faker import Faker

#faker la cabra
fake = Faker()

def current_timestamp_ms():
    return int(datetime.datetime.utcnow().timestamp() * 1000)


producer_conf = {
    'bootstrap.servers': 'localhost:29092,localhost:29093,localhost:29094',
    'client.id': 'test-producer'
}
producer = Producer(producer_conf)



def produce_choferes():
    return {
        "driver_id": str(uuid.uuid4()),
        "nombre": fake.name(),
        "licencia": fake.bothify(text="LIC####"),
        "telefono": fake.phone_number(),
        "fecha_ingreso": current_timestamp_ms()
    }

def produce_usuarios():
    return {
        "user_id": str(uuid.uuid4()),
        "nombre": fake.name(),
        "email": fake.email(),
        "telefono": fake.phone_number(),
        "fecha_reg": current_timestamp_ms()
    }

def produce_paradas():
    return {
        "parada_id": str(uuid.uuid4()),
        "nombre": fake.street_name(),
        "latitude": float(fake.latitude()),
        "longitude": float(fake.longitude()),
        "direccion": fake.address()
    }

def produce_buses():
    return {
        "bus_id": fake.bothify(text="BUS-###"),
        "plate": fake.license_plate(),
        "route_id": fake.bothify(text="RT-###"),
        "route_name": fake.word().title(),
        "route_color": fake.color_name(),
        "capacity": random.randint(20, 60),
        "status": random.choice(["active", "inactive", "maintenance"]),
        "driver_id": str(uuid.uuid4())
    }

def produce_historial_pagos():
    return {
        "user_id": str(uuid.uuid4()),
        "fecha_hora": current_timestamp_ms(),
        "pago_id": str(uuid.uuid1()),
        "bus_id": fake.bothify(text="BUS-###"),
        "monto": round(random.uniform(1.0, 50.0), 2), 
        "parada_ini": str(uuid.uuid4()),
        "parada_fin": str(uuid.uuid4())
    }

def produce_historial_recorrido_real():
    return {
        "bus_id": fake.bothify(text="BUS-###"),
        "recorrido_id": str(uuid.uuid1()),
        "ts": current_timestamp_ms(),
        "latitude": float(fake.latitude()),
        "longitude": float(fake.longitude()),
        "parada_ini": str(uuid.uuid4()),
        "parada_fin": str(uuid.uuid4())
    }

def produce_viajes():
    return {
        "bus_id": fake.bothify(text="BUS-###"),
        "user_id": str(uuid.uuid4()),
        "ts": current_timestamp_ms(),
        "viaje_id": str(uuid.uuid1()),
        "parada_ini": str(uuid.uuid4()),
        "parada_fin": str(uuid.uuid4()),
        "cobro": round(random.uniform(1.0, 100.0), 2)
    }

topic_generators = {
    "choferes": produce_choferes,
    "usuarios": produce_usuarios,
    "paradas": produce_paradas,
    "buses": produce_buses,
    "historial_pagos": produce_historial_pagos,
    "historial_recorrido_real": produce_historial_recorrido_real,
    "viajes": produce_viajes
}


def delivery_report(err, msg):
    if err:
        print(f"Error al enviar mensaje: {err}")
    else:
        print(f"Mensaje enviado a {msg.topic()} [partición {msg.partition()}]")

if __name__ == '__main__':
    topics = list(topic_generators.keys())
    message_count = 0
    print("Iniciando...")
    try:
        while True:
            topic = random.choice(topics)
            data = topic_generators[topic]()
            payload = json.dumps(data, default=str)
            producer.produce(topic, payload.encode('utf-8'), callback=delivery_report)
            producer.poll(0)
            message_count += 1
            if message_count % 10 == 0:
                print(f"{message_count} mensajes enviados.")
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nInterrumpido. Cerrando...")
    finally:
        producer.flush()
        print(f"Total de mensajes enviados: {message_count}")
