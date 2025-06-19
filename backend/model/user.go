package model

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint           `gorm:"primaryKey"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
	Email     string         `gorm:"unique;not null"`
	Password  string         `gorm:"not null"`
	Name      string         `gorm:"not null"`
	Bookings  []Booking      `gorm:"foreignKey:UserID"`
}