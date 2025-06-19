package router

import (
	"github.com/gin-gonic/gin"
	"github.com/tiananugerah/go-BookCabin/controller"
	"github.com/tiananugerah/go-BookCabin/middleware"
	"github.com/tiananugerah/go-BookCabin/service"
)

func SetupRoutes(r *gin.Engine, authService *service.AuthService, bookingService *service.BookingService, seatService *service.SeatService) {
	// ✅ CORS middleware harus paling atas
	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin == "http://localhost:3000" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, Accept, Cache-Control, X-Requested-With")
			c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		}

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	authController := controller.NewAuthController(authService)
	bookingController := controller.NewBookingController(bookingService)
	seatController := controller.NewSeatController(seatService)

	// 🔐 Auth routes
	auth := r.Group("/auth")
	{
		auth.POST("/register", authController.Register)
		auth.POST("/login", authController.Login)
	}

	// 🔐 Protected routes
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware(authService))
	{
		api.GET("/seats", seatController.GetSeats)
		api.POST("/seats/import", seatController.ImportSeats)
		api.GET("/seats/available", bookingController.GetAvailableSeats)

		// 📦 Booking routes (perbaikan: tanpa trailing slash di path)
		bookings := api.Group("/bookings")
		{
			bookings.POST("", bookingController.CreateBooking)
			bookings.GET("", bookingController.GetUserBookings) // ⬅️ FIXED: hilangkan "/" supaya tidak redirect 301
			bookings.POST("/:bookingID/cancel", bookingController.CancelBooking)
		}
	}
}
