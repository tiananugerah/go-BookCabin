package service

import (
	"encoding/json"
	"os"

	"gorm.io/gorm"

	"github.com/tiananugerah/go-BookCabin/model"
)

type SeatService struct {
	db *gorm.DB
}

func NewSeatService(db *gorm.DB) *SeatService {
	return &SeatService{db: db}
}

type SeatMapResponse struct {
	SeatsItineraryParts []struct {
		SegmentSeatMaps []struct {
			PassengerSeatMaps []struct {
				SeatMap struct {
					Aircraft string `json:"aircraft"`
					Cabins []struct {
						Deck string `json:"deck"`
						SeatColumns []string `json:"seatColumns"`
						SeatRows []struct {
							RowNumber int `json:"rowNumber"`
							SeatCodes []string `json:"seatCodes"`
							Seats []struct {
								Code string `json:"code"`
								Available bool `json:"available"`
								StorefrontSlotCode string `json:"storefrontSlotCode"`
								SeatCharacteristics []string `json:"seatCharacteristics"`
								Designations []string `json:"designations"`
								Prices struct {
									Alternatives [][]struct {
										Amount float64 `json:"amount"`
										Currency string `json:"currency"`
									} `json:"alternatives"`
								} `json:"prices"`
							} `json:"seats"`
						} `json:"seatRows"`
					} `json:"cabins"`
				} `json:"seatMap"`
			} `json:"passengerSeatMaps"`
		} `json:"segmentSeatMaps"`
	} `json:"seatsItineraryParts"`
}

func (s *SeatService) ImportSeatMapFromFile(path string) ([]model.Seat, error) {
	file, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var response SeatMapResponse
	if err := json.Unmarshal(file, &response); err != nil {
		return nil, err
	}

    // Delete existing seats before importing new ones
    if err := s.db.Exec("DELETE FROM seats").Error; err != nil {
        return nil, err
    }

    var seats []model.Seat

    for _, part := range response.SeatsItineraryParts {
        for _, segMap := range part.SegmentSeatMaps {
            for _, paxMap := range segMap.PassengerSeatMaps {
                aircraft := paxMap.SeatMap.Aircraft
                for _, cabin := range paxMap.SeatMap.Cabins {
                    for _, row := range cabin.SeatRows {
                        for _, seat := range row.Seats {
                            if seat.StorefrontSlotCode == "SEAT" {
                                // Determine segment based on row number
                                segment := "ECONOMY"
                                if row.RowNumber <= 2 {
                                    segment = "FIRST"
                                } else if row.RowNumber <= 7 {
                                    segment = "BUSINESS"
                                }

                                // Get price and currency from the first alternative
                                var price float64
                                var currency string
                                if len(seat.Prices.Alternatives) > 0 && len(seat.Prices.Alternatives[0]) > 0 {
                                    price = seat.Prices.Alternatives[0][0].Amount
                                    currency = seat.Prices.Alternatives[0][0].Currency
                                }

                                // Check for window or aisle seat
                                isWindow := false
                                isAisle := false
                                for _, char := range seat.SeatCharacteristics {
                                    if char == "W" {
                                        isWindow = true
                                    } else if char == "A" {
                                        isAisle = true
                                    }
                                }

                                newSeat := model.Seat{
                                    SeatCode:        seat.Code,
                                    Available:       seat.Available,
                                    Price:          price,
                                    Currency:       currency,
                                    RowNumber:      row.RowNumber,
                                    Segment:        segment,
                                    IsWindow:       isWindow,
                                    IsAisle:        isAisle,
                                    Aircraft:       aircraft,
                                    Characteristics: model.StringArray(seat.SeatCharacteristics),
                                }
                                seats = append(seats, newSeat)
                            }
                        }
                    }
                }
            }
        }
    }

    result := s.db.Create(&seats)
    if result.Error != nil {
        return nil, result.Error
    }

    return seats, nil
}

func (s *SeatService) GetAllSeats() ([]model.Seat, error) {
	var seats []model.Seat
	result := s.db.Find(&seats)
	return seats, result.Error
}

func (s *SeatService) GetSeatByID(id uint) (*model.Seat, error) {
	var seat model.Seat
	result := s.db.First(&seat, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &seat, nil
}
