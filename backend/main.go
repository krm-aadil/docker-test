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
}

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Ensure table exists
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			name VARCHAR(100),
			email VARCHAR(100) UNIQUE
		);
	`)
	if err != nil {
		log.Fatal("Failed to setup DB: ", err)
	}

	// The upgraded API Endpoint
	http.HandleFunc("/api/users", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// --- HANDLE POST: Create a new user ---
		if r.Method == http.MethodPost {
			var newUser User
			json.NewDecoder(r.Body).Decode(&newUser)

			// Insert into DB and grab the new ID
			err := db.QueryRow(
				"INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id",
				newUser.Name, newUser.Email,
			).Scan(&newUser.ID)

			if err != nil {
				http.Error(w, "Error saving user or email already exists", http.StatusInternalServerError)
				return
			}
			json.NewEncoder(w).Encode(newUser)
			return
		}

		// --- HANDLE GET: Fetch all users ---
		rows, err := db.Query("SELECT id, name, email FROM users ORDER BY id DESC")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var users []User
		for rows.Next() {
			var u User
			rows.Scan(&u.ID, &u.Name, &u.Email)
			users = append(users, u)
		}
		json.NewEncoder(w).Encode(users)
	})

	fmt.Println("🚀 Go server running on port 8080")
	http.ListenAndServe(":8080", nil)
}
