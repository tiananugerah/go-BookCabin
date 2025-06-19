package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/tiananugerah/go-BookCabin/service"
)

type BookingController struct {
	bookingService *service.BookingService
}

func NewBookingController(bookingService *service.BookingService) *BookingController {
	return &BookingController{bookingService: bookingService}
}

type CreateBookingRequest struct {
	SeatID uint `json:"seat_id" binding:"required"`
}

func (c *BookingController) CreateBooking(ctx *gin.Context) {
	userID := ctx.GetUint("userID")

	var req CreateBookingRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	booking, err := c.bookingService.CreateBooking(userID, req.SeatID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, booking)
}

func (c *BookingController) CancelBooking(ctx *gin.Context) {
    userID := ctx.GetUint("userID")
    bookingIDStr := ctx.Param("bookingID")
    
    bookingID, err := strconv.ParseUint(bookingIDStr, 10, 32)
    if err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid booking ID"})
        return
    }

    err = c.bookingService.CancelBooking(userID, uint(bookingID))
    if err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    ctx.JSON(http.StatusOK, gin.H{"message": "booking cancelled successfully"})
}

func (c *BookingController) GetUserBookings(ctx *gin.Context) {
	userID := ctx.GetUint("userID")

	bookings, err := c.bookingService.GetUserBookings(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, bookings)
}

func (c *BookingController) GetAvailableSeats(ctx *gin.Context) {
	seats, err := c.bookingService.GetAvailableSeats()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, seats)
}