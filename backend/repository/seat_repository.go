package repository

import (
	"github.com/tiananugerah/go-BookCabin/config"
	"github.com/tiananugerah/go-BookCabin/model"
)

func SaveSeats(seats []model.Seat) {
	for _, seat := range seats {
		config.DB.Create(&seat)
	}
}

func GetAllSeats() []model.Seat {
	var seats []model.Seat
	config.DB.Find(&seats)
	return seats
}
