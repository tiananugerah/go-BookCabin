package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/tiananugerah/go-BookCabin/config"
	"github.com/tiananugerah/go-BookCabin/model"
	"github.com/tiananugerah/go-BookCabin/router"
	"encoding/json"
	"log"
	"os"
)

func main() {
	app := fiber.New(fiber.Config{
		JSONEncoder: json.Marshal,
		JSONDecoder: json.Unmarshal,
	})

	// Enable CORS
	app.Use(cors.New())

	// Initialize database
	config.InitDatabase()
	config.DB.AutoMigrate(&model.Seat{})

	// Setup routes
	router.SetupRoutes(app)

	// Start server
	port := ":" + os.Getenv("APP_PORT")
	if port == ":" {
		port = ":3000"
	}
	log.Fatal(app.Listen(port))
}