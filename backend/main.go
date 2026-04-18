package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/lib/pq"
)

type User struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Photo string `json:"photo"` // Added photo field for Base64 string
}

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Ensure table exists (Now includes the 'photo' column as TEXT)
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			name VARCHAR(100),
			email VARCHAR(100) UNIQUE,
			photo TEXT
		);
	`)
	if err != nil {
		log.Fatal("Failed to setup DB: ", err)
	}

	http.HandleFunc("/api/users", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// --- HANDLE POST: Create a new user ---
		if r.Method == http.MethodPost {
			var newUser User
			// Increase max memory to handle large base64 image strings if necessary
			r.Body = http.MaxBytesReader(w, r.Body, 10<<20) // 10 MB limit

			if err := json.NewDecoder(r.Body).Decode(&newUser); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			// Insert into DB including the photo
			err := db.QueryRow(
				"INSERT INTO users (name, email, photo) VALUES ($1, $2, $3) RETURNING id",
				newUser.Name, newUser.Email, newUser.Photo,
			).Scan(&newUser.ID)

			if err != nil {
				http.Error(w, "Error saving user or email already exists", http.StatusInternalServerError)
				return
			}
			json.NewEncoder(w).Encode(newUser)
			return
		}

		// --- HANDLE GET: Fetch all users ---
		rows, err := db.Query("SELECT id, name, email, COALESCE(photo, '') FROM users ORDER BY id DESC")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var users []User
		for rows.Next() {
			var u User
			rows.Scan(&u.ID, &u.Name, &u.Email, &u.Photo)
			users = append(users, u)
		}
		json.NewEncoder(w).Encode(users)
	})

	fmt.Println("🚀 Go server running on port 8080")
	http.ListenAndServe(":8080", nil)
}
