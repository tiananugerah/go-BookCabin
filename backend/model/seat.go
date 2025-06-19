package model

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

// StringArray adalah custom type untuk menangani array string di PostgreSQL
type StringArray []string

// Value mengimplementasikan driver.Valuer interface
func (a StringArray) Value() (driver.Value, error) {
	return json.Marshal(a)
}

// Scan mengimplementasikan sql.Scanner interface
func (a *StringArray) Scan(value interface{}) error {
	if value == nil {
		*a = StringArray{}
		return nil
	}
	return json.Unmarshal(value.([]byte), a)
}

type Seat struct {
	ID        uint           `gorm:"primaryKey"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
	SeatCode  string         `json:"code" gorm:"unique;not null"`
	Available bool           `json:"available" gorm:"default:true"`
	Price     float64        `json:"price" gorm:"not null"`
	Currency  string         `json:"currency" gorm:"not null"`
	RowNumber int            `json:"row" gorm:"not null"`
	Segment   string         `json:"segment" gorm:"not null"`
	IsWindow  bool           `json:"is_window" gorm:"default:false"`
	IsAisle   bool           `json:"is_aisle" gorm:"default:false"`
	Aircraft  string         `json:"aircraft" gorm:"not null"`
	Characteristics StringArray `json:"characteristics" gorm:"type:jsonb"`
	Bookings  []Booking      `gorm:"foreignKey:SeatID"`
}
