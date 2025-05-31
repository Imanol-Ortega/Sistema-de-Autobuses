use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;
use futures::{StreamExt, SinkExt};
use std::sync::{Arc, Mutex};
use std::collections::HashSet;
use tokio::sync::broadcast;

#[tokio::main]
async fn main() {
    let addr = "0.0.0.0:8765";
    let listener = TcpListener::bind(&addr).await.expect("Falló el bind");
    println!("🚀 Servidor WebSocket corriendo en {}", addr);

    let (tx, _) = broadcast::channel(100);
    let clients = Arc::new(Mutex::new(HashSet::new()));

    // Lanzar tarea para enviar mensajes cada 5 segundos
    {
        let tx_clone = tx.clone();
        tokio::spawn(async move {
            loop {
                let msg = format!("🕒 Timestamp: {:?}", chrono::Utc::now());
                let _ = tx_clone.send(tokio_tungstenite::tungstenite::Message::Text(msg));
                tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
            }
        });
    }

    while let Ok((stream, _)) = listener.accept().await {
        let peer = stream.peer_addr().expect("no peer addr");
        let tx = tx.clone();
        let mut rx = tx.subscribe();
        let clients = clients.clone();

        tokio::spawn(async move {
            let ws_stream = accept_async(stream).await.expect("Fallo el handshake");
            println!("🧩 Cliente conectado: {}", peer);

            let (mut write, _) = ws_stream.split();
            clients.lock().unwrap().insert(peer);

            while let Ok(msg) = rx.recv().await {
                if write.send(msg.clone()).await.is_err() {
                    break;
                }
            }

            println!("❌ Cliente desconectado: {}", peer);
            clients.lock().unwrap().remove(&peer);
        });
    }
}
