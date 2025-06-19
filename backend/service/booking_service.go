package service

import (
	"errors"
	"time"

	"gorm.io/gorm"

	"github.com/tiananugerah/go-BookCabin/model"
)

type BookingService struct {
	db *gorm.DB
}

func NewBookingService(db *gorm.DB) *BookingService {
	return &BookingService{db: db}
}

func (s *BookingService) CreateBooking(userID, seatID uint) (*model.Booking, error) {
	var seat model.Seat
	if err := s.db.First(&seat, seatID).Error; err != nil {
		return nil, errors.New("seat not found")
	}

	// Cek apakah kursi sudah dibooking
	var existingBooking model.Booking
	if err := s.db.Where("seat_id = ? AND status = ? AND deleted_at IS NULL", seatID, model.StatusConfirmed).First(&existingBooking).Error; err == nil {
		return nil, errors.New("seat is already booked")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	booking := &model.Booking{
		UserID:   userID,
		SeatID:   seatID,
		Status:   model.StatusConfirmed,
		BookedAt: time.Now(),
		Price:    seat.Price,
		Currency: seat.Currency,
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(booking).Error; err != nil {
			return err
		}

		if err := tx.Model(&seat).Update("available", false).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Load seat data
	if err := s.db.Preload("Seat").First(booking, booking.ID).Error; err != nil {
		return nil, err
	}

	return booking, nil
}

func (s *BookingService) CancelBooking(userID, bookingID uint) error {
    var booking model.Booking
    if err := s.db.Where("id = ? AND user_id = ?", bookingID, userID).First(&booking).Error; err != nil {
        return err
    }

    if booking.Status == model.StatusCancelled {
        return errors.New("booking is already cancelled")
    }

    err := s.db.Transaction(func(tx *gorm.DB) error {
        // Update status booking menjadi cancelled
        if err := tx.Model(&booking).Update("status", model.StatusCancelled).Error; err != nil {
            return err
        }

        // Update kursi menjadi available = true
        if err := tx.Model(&model.Seat{}).Where("id = ?", booking.SeatID).Update("available", true).Error; err != nil {
            return err
        }

        return nil
    })

    return err
}

func (s *BookingService) GetUserBookings(userID uint) ([]model.Booking, error) {
	var bookings []model.Booking
	err := s.db.Where("user_id = ?", userID).Preload("Seat").Find(&bookings).Error
	return bookings, err
}

func (s *BookingService) GetAvailableSeats() ([]model.Seat, error) {
    var seats []model.Seat
    err := s.db.Where(
        "id NOT IN (SELECT seat_id FROM bookings WHERE status = ? AND deleted_at IS NULL)",
        model.StatusConfirmed,
    ).Find(&seats).Error
    return seats, err
}