package model

import (
	"time"

	"gorm.io/gorm"
)

type BookingStatus string

const (
	StatusPending   BookingStatus = "pending"
	StatusConfirmed BookingStatus = "confirmed"
	StatusCancelled BookingStatus = "cancelled"
)

type Booking struct {
	ID        uint           `gorm:"primaryKey"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
	UserID    uint           `gorm:"not null"`
	User      User           `gorm:"foreignKey:UserID"`
	SeatID    uint           `gorm:"not null"`
	Seat      Seat           `gorm:"foreignKey:SeatID"`
	Status    BookingStatus  `gorm:"type:varchar(20);not null;default:'pending'"`
	BookedAt  time.Time      `gorm:"not null"`
	Price     float64        `gorm:"not null"`
	Currency  string         `gorm:"not null"`
}