#!/usr/bin/env python3
from cassandra.cluster import Cluster
import uuid, random, time
from faker import Faker

KEYSPACE = 'transit'
fake = Faker()

def wait_for_cassandra():
    while True:
        try:
            cluster = Cluster(['cassandra'], port=9042)
            session = cluster.connect()
            session.execute("SELECT now() FROM system.local")
            print("Cassandra is up!")
            return cluster, session
        except Exception:
            print("Waiting for Cassandra to start...")
            time.sleep(5)

def insert_seed_data(session):
    session.set_keyspace(KEYSPACE)

    # Solo si no hay buses aún
    count = session.execute("SELECT COUNT(*) FROM buses").one()[0]
    if count > 0:
        print("Datos existentes; seed omitido.")
        return

    print("Insertando seed data...")

    # 1) Choferes
    driver_ids = []
    for _ in range(5):
        did = uuid.uuid4()
        driver_ids.append(did)
        session.execute("""
            INSERT INTO choferes (driver_id, nombre, licencia, telefono, fecha_ingreso)
            VALUES (%s, %s, %s, %s, toTimestamp(now()))
        """, (did, fake.name(), fake.bothify(text='LIC-####'), fake.phone_number()))

    # 2) Buses (uno por chofer)
    for i, did in enumerate(driver_ids, start=1):
        bid = f"BUS{i}"
        session.execute("""
            INSERT INTO buses (bus_id, plate, route_id, route_name, route_color, capacity, status, driver_id, saldo)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            bid,
            fake.bothify(text='??-####'),
            f"R{i}",
            f"Route {i}",
            random.choice(['Red','Blue','Green','Yellow']),
            random.randint(30,80),
            random.choice(['active','inactive']),
            did,
            0
        ))

    # 3) Paradas
    for _ in range(10):
        pid = uuid.uuid4()
        session.execute("""
            INSERT INTO paradas (parada_id, nombre, latitude, longitude, direccion)
            VALUES (%s, %s, %s, %s, %s)
        """, (pid, fake.street_name(), fake.latitude(), fake.longitude(), fake.address()))

    # 4) Usuarios
    for _ in range(10):
        uid = uuid.uuid4()
        session.execute("""
            INSERT INTO usuarios (user_id, nombre, password, email, telefono, fecha_reg, saldo)
            VALUES (%s, %s, %s, %s, %s, toTimestamp(now()), %s)
        """, (uid, fake.name(), fake.password(), fake.email(), fake.phone_number(), "0"))


    print("Seed data insertado exitosamente (❁´◡`❁)(❁´◡`❁).")

if __name__ == "__main__":
    cluster, session = wait_for_cassandra()
    insert_seed_data(session)
    cluster.shutdown()
