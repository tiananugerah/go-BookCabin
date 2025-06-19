package router

import (
	"github.com/gin-gonic/gin"

	"github.com/tiananugerah/go-BookCabin/controller"
	"github.com/tiananugerah/go-BookCabin/middleware"
	"github.com/tiananugerah/go-BookCabin/service"
)

func SetupRoutes(r *gin.Engine, authService *service.AuthService, bookingService *service.BookingService, seatService *service.SeatService) {
    // CORS middleware harus menjadi middleware pertama
    r.Use(func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
        c.Writer.Header().Set("Access-Control-Expose-Headers", "Authorization")

        // Handle preflight requests
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(200)
            return
        }

        c.Next()
    })
	authController := controller.NewAuthController(authService)
	bookingController := controller.NewBookingController(bookingService)

	// Auth routes
	auth := r.Group("/auth")
	{
		auth.POST("/register", authController.Register)
		auth.POST("/login", authController.Login)
	}

	// Protected routes
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware(authService))
	{
		// Seat routes
	seatController := controller.NewSeatController(seatService)
	api.GET("/seats", seatController.GetSeats)
	api.POST("/seats/import", seatController.ImportSeats)
	api.GET("/seats/available", bookingController.GetAvailableSeats)

		// Booking routes
		bookings := api.Group("/bookings")
		{
			bookings.POST("/", bookingController.CreateBooking)
			bookings.GET("/", bookingController.GetUserBookings)
			bookings.POST("/:bookingID/cancel", bookingController.CancelBooking)
		}
	}
}