package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/tiananugerah/go-BookCabin/service"
)

type SeatController struct {
	seatService *service.SeatService
}

func NewSeatController(seatService *service.SeatService) *SeatController {
	return &SeatController{seatService: seatService}
}

func (c *SeatController) ImportSeats(ctx *gin.Context) {
	seats, err := c.seatService.ImportSeatMapFromFile("/app/data/SeatMapResponse.json")
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, seats)
}

func (c *SeatController) GetSeats(ctx *gin.Context) {
	seats, err := c.seatService.GetAllSeats()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, seats)
}