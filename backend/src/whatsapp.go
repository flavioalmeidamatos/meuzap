package main

import (
	"context"
	"fmt"
	"log"

	_ "github.com/mattn/go-sqlite3"
	"google.golang.org/protobuf/proto"
	"go.mau.fi/whatsmeow"
	waE2E "go.mau.fi/whatsmeow/proto/waE2E"
	"go.mau.fi/whatsmeow/store/sqlstore"
	"go.mau.fi/whatsmeow/types"
	"go.mau.fi/whatsmeow/types/events"
	waLog "go.mau.fi/whatsmeow/util/log"
)

func InitWhatsApp() (*whatsmeow.Client, error) {
	ctx := context.Background()
	dbLog := waLog.Stdout("Database", "DEBUG", true)
	// SQLite local para guardar tokens do Whatsmeow apenas
	container, err := sqlstore.New(ctx, "sqlite3", "file:store.db?_foreign_keys=on", dbLog)
	if err != nil {
		return nil, err
	}

	deviceStore, err := container.GetFirstDevice(ctx)
	if err != nil {
		panic(err)
	}

	clientLog := waLog.Stdout("Client", "DEBUG", true)
	client := whatsmeow.NewClient(deviceStore, clientLog)

	// Callback de Eventos
	client.AddEventHandler(func(evt interface{}) {
		switch v := evt.(type) {
		case *events.Message:
			log.Printf("Mensagem Recebida de %s: %s", v.Info.Sender.String(), v.Message.GetConversation())
			
			// Enviar pro Supabase
			SaveMessageToSupabase(v.Info.Chat.String(), v.Info.ID, v.Info.Sender.String(), v.Message.GetConversation(), "text", v.Info.IsFromMe)
		
		case *events.Receipt:
			log.Printf("Recibo recebido: %v", v.MessageIDs)
			// Atualizar status da msg no supabase para lida/entregue

		case *events.HistorySync:
			log.Printf("Sincronizando histórico inicial...")
			// Importante: parsear v.Data e fazer BULK INSERT no Supabase
		}
	})

	if client.Store.ID == nil {
		// Sem sessão => Pedir QR Code
		qrChan, _ := client.GetQRChannel(context.Background())
		err = client.Connect()
		if err != nil {
			return nil, err
		}
		for evt := range qrChan {
			if evt.Event == "code" {
				// No cenário real em produção, você expõe este `evt.Code` no endpoint GET /api/qr para o React renderizar
				fmt.Println("QR code obtido:", evt.Code)
			} else {
				fmt.Println("Login event:", evt.Event)
			}
		}
	} else {
		// Já tem sessão
		err = client.Connect()
		if err != nil {
			return nil, err
		}
	}

	return client, nil
}

// SendTextMessage envia uma msg usando o client ativo
func SendTextMessage(client *whatsmeow.Client, jid string, text string) error {
	targetJID, _ := types.ParseJID(jid)
	_, err := client.SendMessage(context.Background(), targetJID, &waE2E.Message{
		Conversation: proto.String(text),
	})
	// Construção correta da msg text seria adicionada aqui.
	return err
}
