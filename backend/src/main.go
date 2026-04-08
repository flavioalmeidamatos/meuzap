package main

import (
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Aviso: arquivo .env não encontrado, usando variáveis de ambiente do SO")
	}

	// Inicializa conexão com Supabase
	InitSupabase()

	// Inicializa e conecta o Whatsmeow
	wac, err := InitWhatsApp()
	if err != nil {
		log.Fatalf("Falha ao inicializar WhatsApp: %v", err)
	}

	// Endpoints simples para interagir via REST
	http.HandleFunc("/api/qr", func(w http.ResponseWriter, r *http.Request) {
		// Retorna o estado atual ou solicita novo QR se desconectado
		if wac.IsConnected() && wac.IsLoggedIn() {
			w.Write([]byte(`{"status":"connected"}`))
			return
		}
		// Na prática, o evento de QR code (qrChannel) deve ser exposto via Websocket ou Long Polling
		w.Write([]byte(`{"status":"pairing"}`))
	})

	http.HandleFunc("/api/send", func(w http.ResponseWriter, r *http.Request) {
		// Endpoint webhook para a Vercel chamar e disparar uma mensagem ativamente
		// Recebe jid, text e type
		w.Write([]byte(`{"status":"queued"}`))
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Servidor Bridge rodando na porta %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
