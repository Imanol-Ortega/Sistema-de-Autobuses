package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	"sync"
)

var clients = make(map[*websocket.Conn]bool)
var mutex = sync.Mutex{}
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Error al hacer upgrade: %v\n", err)
		return
	}
	defer ws.Close()

	mutex.Lock()
	clients[ws] = true
	mutex.Unlock()

	log.Printf("✅ Cliente conectado: %v\n", ws.RemoteAddr())

	for {
		_, _, err := ws.ReadMessage()
		if err != nil {
			mutex.Lock()
			delete(clients, ws)
			mutex.Unlock()
			log.Printf("❌ Cliente desconectado: %v\n", ws.RemoteAddr())
			break
		}
	}
}

func broadcastLoop() {
	for {
		time.Sleep(5 * time.Second)
		message := fmt.Sprintf("🕒 Mensaje del servidor: %v", time.Now().Format(time.RFC3339))
		mutex.Lock()
		for client := range clients {
			err := client.WriteMessage(websocket.TextMessage, []byte(message))
			if err != nil {
				log.Printf("Error al enviar mensaje: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
		mutex.Unlock()
	}
}

func main() {
	http.HandleFunc("/ws", handleConnections)

	go broadcastLoop()

	log.Println("🚀 Servidor WebSocket en http://localhost:8080/ws")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("Error al iniciar el servidor:", err)
	}
}
