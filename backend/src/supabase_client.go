package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

var supabaseUrl string
var supabaseKey string

func InitSupabase() {
	supabaseUrl = os.Getenv("SUPABASE_URL")
	supabaseKey = os.Getenv("SUPABASE_SERVICE_KEY")
	if supabaseKey == "" {
		supabaseKey = os.Getenv("SUPABASE_ANON_KEY")
	}
	if supabaseUrl == "" || supabaseKey == "" {
		log.Fatal("Supabase URL e Key são obrigatórias no .env")
	}
}

type MsgPayload struct {
	ChatID      string    `json:"chat_id"`
	MessageID   string    `json:"message_id"`
	SenderJID   string    `json:"sender_jid"`
	FromMe      bool      `json:"from_me"`
	Content     string    `json:"content"`
	MessageType string    `json:"message_type"`
	Timestamp   time.Time `json:"timestamp"`
}

// Exemplo simples de chamada REST via PostgREST do Supabase
func SaveMessageToSupabase(chatJID string, msgID string, senderJID string, content string, msgType string, fromMe bool) {

	// NOTA: No ambiente real, precisamos consultar na tabela "chats" o UUID (chat_id) 
	// referente a esse chatJID antes de inserir na tabela de mensagens, ou criar o chat se não existir.
	// Aqui simulamos a inserção base.

	// 1. (Omitido por concisão) Consultar Chat_ID usando chatJID

	payload := map[string]interface{}{
		//"chat_id": uuid,
		"message_id":   msgID,
		"sender_jid":   senderJID,
		"from_me":      fromMe,
		"content":      content,
		"message_type": msgType,
		"timestamp":    time.Now().Format(time.RFC3339),
	}

	jsonData, _ := json.Marshal([]interface{}{payload}) // Insere array

	req, err := http.NewRequest("POST", supabaseUrl+"/rest/v1/messages", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Println("Erro ao preparar req pro Supabase:", err)
		return
	}
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "resolution=merge-duplicates") // Faz UPSERT pra evitar duplicatas de msgID

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Erro request Supabase:", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		fmt.Println("Erro ao inserir msg no Supabase. HTTP Status:", resp.StatusCode)
	} else {
		fmt.Println("Msg persistida com sucesso no banco!")
	}
}
