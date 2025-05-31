# docker/spark/Dockerfile

# Base: Spark with Python support
FROM bitnami/spark:3.4.0

# Ivy and Hadoop need absolute directories and user to avoid Kerberos errors
env HOME=/app
env SPARK_IVY_HOME=/app/.ivy2

# Working directory
WORKDIR /app

# Create Ivy cache and checkpoints directories
RUN mkdir -p /app/.ivy2 /app/checkpoints

# Copy application code and configuration
COPY src/ ./src/
COPY config/ ./config/
COPY graphs/route_graph.gpickle ./graphs/route_graph.gpickle
COPY requirements.txt ./

# Install Python dependencies as root
USER root
RUN pip install --no-cache-dir -r requirements.txt

# Fix ownership so spark user can access files
RUN chown -R 1001:0 /app && chown -R 1001:0 /app/.ivy2

# Switch back to spark user
USER 1001

# ENTRYPOINT: submit the Spark job with Kafka support and disable Hadoop Kerberos login by setting user.name
ENTRYPOINT [ \
  "/opt/bitnami/spark/bin/spark-submit", \
  "--packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.4.0", \
  "--master", "local[*]", \
  "--conf", "spark.jars.ivy=/app/.ivy2", \
  "--conf", "spark.sql.shuffle.partitions=2", \
  "--conf", "spark.driver.memory=1g", \
  "--conf", "spark.driver.extraJavaOptions=-Duser.name=spark", \
  "--conf", "spark.executor.extraJavaOptions=-Duser.name=spark", \
  "--py-files", "src/traffic_analysis.py,src/eta_estimator.py,src/routing.py", \
  "src/streaming_job.py" \
]
