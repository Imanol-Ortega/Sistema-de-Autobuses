from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, LongType

# 1) Spark
spark = (SparkSession.builder
         .appName("BusProcessor")
         .config("spark.driver.memory", "1g")
         .getOrCreate())
spark.sparkContext.setLogLevel("WARN")

# 2) Esquema
schema = StructType([
  StructField("bus_id", StringType()),
  StructField("route_id", StringType()),
  StructField("timestamp", LongType()),
  StructField("lat", DoubleType()),
  StructField("lon", DoubleType()),
  StructField("speed", DoubleType())
])

# 3) Lectura de Kafka
# df = (spark.readStream
#       .format("kafka")
#       .option("kafka.bootstrap.servers", "localhost:9092")
#       .option("subscribe", "bus-updates")
#       .option("startingOffsets", "latest")
#       .load())
df = (
    spark.readStream
         .format("kafka")
         .option("kafka.bootstrap.servers", "localhost:9092")
         .option("subscribe", "bus-updates")
         .option("startingOffsets", "latest")
         .load()
)

parsed = df.select(from_json(col("value").cast("string"), schema).alias("data")).select("data.*")

# 4) Simple print por ahora
query = (parsed.writeStream
         .outputMode("append")
         .format("console")
         .start())

query.awaitTermination()
