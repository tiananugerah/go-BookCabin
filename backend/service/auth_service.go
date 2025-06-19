package service

import (
	"errors"
	"time"

	"github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"github.com/tiananugerah/go-BookCabin/model"
)

type AuthService struct {
	db     *gorm.DB
	jwtKey []byte
}

type Claims struct {
	UserID uint `json:"user_id"`
	jwt.StandardClaims
}

func NewAuthService(db *gorm.DB, jwtKey []byte) *AuthService {
	return &AuthService{
		db:     db,
		jwtKey: jwtKey,
	}
}

func (s *AuthService) Register(email, password, name string) (*model.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &model.User{
		Email:    email,
		Password: string(hashedPassword),
		Name:     name,
	}

	result := s.db.Create(user)
	if result.Error != nil {
		return nil, result.Error
	}

	return user, nil
}

func (s *AuthService) Login(email, password string) (string, error) {
	var user model.User
	result := s.db.Where("email = ?", email).First(&user)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return "", errors.New("invalid email or password")
		}
		return "", result.Error
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return "", errors.New("invalid email or password")
	}
    
    // Ubah waktu expired token menjadi 1 jam
    expirationTime := time.Now().Add(1 * time.Hour)
    claims := &Claims{
        UserID: user.ID,
        StandardClaims: jwt.StandardClaims{
            ExpiresAt: expirationTime.Unix(),
            IssuedAt:  time.Now().Unix(), // Tambahkan waktu issued
        },
    }

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(s.jwtKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func (s *AuthService) ValidateToken(tokenStr string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return s.jwtKey, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}