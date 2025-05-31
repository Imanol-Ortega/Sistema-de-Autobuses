package main

import (
	"log"
	"net/http"
	"sync"
	"github.com/gorilla/websocket"
	"github.com/IBM/sarama"
)

var clients = make(map[*websocket.Conn]bool)
var mutex = sync.Mutex{}
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("❌ Error al hacer upgrade: %v", err)
		return
	}
	defer ws.Close()

	mutex.Lock()
	clients[ws] = true
	mutex.Unlock()

	log.Printf("✅ Cliente conectado: %v", ws.RemoteAddr())

	for {
		_, _, err := ws.ReadMessage()
		if err != nil {
			mutex.Lock()
			delete(clients, ws)
			mutex.Unlock()
			log.Printf("❌ Cliente desconectado: %v", ws.RemoteAddr())
			break
		}
	}
}

func kafkaConsumerLoop() {
	config := sarama.NewConfig()
	config.Consumer.Return.Errors = true

	brokers := []string{"localhost:29092"} // adaptalo si estás en docker
	topic := "bus-updates"

	consumer, err := sarama.NewConsumer(brokers, config)
	if err != nil {
		log.Fatalf("❌ Error al crear consumidor: %v", err)
	}
	defer consumer.Close()

	partitionConsumer, err := consumer.ConsumePartition(topic, 0, sarama.OffsetNewest)
	if err != nil {
		log.Fatalf("❌ Error al consumir partición: %v", err)
	}
	defer partitionConsumer.Close()

	for msg := range partitionConsumer.Messages() {
		log.Printf("📥 Mensaje Kafka: %s", string(msg.Value))

		mutex.Lock()
		for client := range clients {
			err := client.WriteMessage(websocket.TextMessage, msg.Value)
			if err != nil {
				log.Printf("❌ Error al enviar WS: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
		mutex.Unlock()
	}
}

func main() {
	http.HandleFunc("/ws", handleConnections)

	go kafkaConsumerLoop()

	log.Println("🚀 Servidor WebSocket activo en http://localhost:8080/ws")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("❌ Error al iniciar el servidor:", err)
	}
}
