CREATE KEYSPACE IF NOT EXISTS transit
  WITH replication = {'class':'SimpleStrategy','replication_factor':1};

CREATE TABLE IF NOT EXISTS transit.bus_metadata (
  bus_id      text PRIMARY KEY,
  plate       text,
  route_id    text,
  route_name  text,
  route_color text,
  capacity    int,
  status      text
);

CREATE TABLE IF NOT EXISTS transit.bus_location (
  bus_id     text,
  date       date,
  ts         timestamp,
  latitude   double,
  longitude  double,
  speed      double,
  passengers int,
  PRIMARY KEY ((bus_id, date), ts)
) WITH CLUSTERING ORDER BY (ts ASC);