#!/usr/bin/env python3
import math
from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col, window, avg, udf
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, LongType

# -------------------------
# 1. Haversine y UDF
# -------------------------
def haversine(lat1, lon1, lat2, lon2):
    # Convierte grados a radianes
    rlat1, rlon1, rlat2, rlon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = rlat2 - rlat1
    dlon = rlon2 - rlon1
    a = math.sin(dlat/2)**2 + math.cos(rlat1) * math.cos(rlat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return 6371 * c  # Distancia en km

haversine_udf = udf(haversine, DoubleType())

# -------------------------
# 2. Coordenadas de próxima parada (broadcast)
# -------------------------
NEXT_STOP_COORDS = {
    'R1': (-25.2617, -57.5810),
    'R2': (-25.2700, -57.5800),
}
# La UDF utilizará este broadcast
def make_distance_udf(bc_stops):
    @udf(DoubleType())
    def distance_remaining(lat, lon, route_id):
        stops = bc_stops.value
        coords = stops.get(route_id)
        if coords:
            return haversine(lat, lon, coords[0], coords[1])
        else:
            return None
    return distance_remaining

# -------------------------
# 3. Schema del JSON de Kafka
# -------------------------
schema = StructType([
    StructField("bus_id",    StringType()),
    StructField("route_id",  StringType()),
    StructField("timestamp", LongType()),   # Epoch (segundos o ms)
    StructField("lat",       DoubleType()),
    StructField("lon",       DoubleType()),
    StructField("speed",     DoubleType()), # km/h
])

def main():
    # -------------------------
    # 4. Spark session
    # -------------------------
    spark = (
        SparkSession.builder
            .appName("BusETAProcessor")
            .master("local[*]")
            .config("spark.sql.shuffle.partitions", "2")
            .config("spark.driver.memory", "1g")
            .getOrCreate()
    )
    spark.sparkContext.setLogLevel("WARN")

    # Broadcast
    bc_stops = spark.sparkContext.broadcast(NEXT_STOP_COORDS)
    distance_remaining_udf = make_distance_udf(bc_stops)

    # -------------------------
    # 5. Leer stream de Kafka y parsear JSON
    # -------------------------
    raw = (
        spark.readStream
            .format("kafka")
            .option("kafka.bootstrap.servers", "kafka:9092")
            .option("subscribe", "bus-updates")
            .option("startingOffsets", "latest")
            .load()
    )

    buses = (
        raw
            .selectExpr("CAST(value AS STRING) AS json_str")
            .select(from_json("json_str", schema).alias("data"))
            .select("data.*")
    )

    # -------------------------
    # 6. Enriquecer con distancia y timestamp
    # -------------------------
    enriched = (
        buses
            .withColumn("dist_km", distance_remaining_udf(col("lat"), col("lon"), col("route_id")))
            # Ajusta según tu epoch: si es ms, usar col("timestamp")/1000
            .withColumn("event_time", col("timestamp").cast("timestamp"))
    )

    # -------------------------
    # 7. Ventana y cálculo de ETA
    # -------------------------
    etas = (
        enriched
            .groupBy(
                window("event_time", "30 seconds", "10 seconds"),
                col("bus_id"),
                col("route_id")
            )
            .agg(
                avg("speed").alias("avg_speed_kmh"),
                avg("dist_km").alias("avg_dist_km")
            )
            .selectExpr(
                "bus_id",
                "route_id",
                "window.start AS window_start",
                "(avg_dist_km / avg_speed_kmh) * 60 AS eta_minutes"
            )
    )

    # -------------------------
    # 8. Salida a consola para pruebas
    # -------------------------
    console_query = (
        etas.writeStream
            .outputMode("update")   # "complete" también funciona, pero "update" evita reimprimir todo cada batch
            .format("console")
            .option("truncate", False)
            .option("numRows", 20)
            .start()
    )

    console_query.awaitTermination()


if __name__ == "__main__":
    main()
