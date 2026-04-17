<h1 align="center">🏆 Cyprus & Greece Football Gaming Hub</h1>

<p align="center">
  <strong>The Ultimate Interactive Football Experience for the Cypriot First Division & Greek Super League</strong>
</p>

---

## 📖 About the Project

This is a premium, open-source web application designed for football fans. It features highly engaging, interactive daily mini-games and challenges tailored specifically around the **Cyprus First Division** and the **Greek Super League**. 

Built with scalability and modern web design in mind, the platform includes real-time user authentication and global leaderboards to track the top football minds globally!

## 🎮 Included Mini-Games

The platform ships with a suite of complete football mini-games:

1. **Football Bingo (Grid Edition):** A dynamic 3x3 Tic-Tac-Toe grid. Click intersections (e.g. `Olympiacos` x `Attacker`) and search the database for players that fit the constraints to conquer the board!
2. **Guess the Logo:** A fast-paced reflex game. Club crests are heavily blurred and slowly come into focus. Guess them quickly for maximum points!
3. **Player ID:** Can you guess the footballer? Progressive clues (Position, Nationality, Age, Club) unlock as you guess.
4. **Who Am I? (Daily Challenge):** A global daily challenge that resets every 24 hours. Every player in the world gets one attempt to guess the identical mystery target.
5. **Stadium Guesser:** A multiple-choice trivia challenge where you must identify the home ground from a single cropped/blurred photograph.

---

## 🚀 Tech Stack

* **Frontend Framework:** Next.js 15 (React 19)
* **Styling & Animation:** Tailwind CSS v4, Framer Motion
* **Database & Authentication:** Supabase (PostgreSQL)
* **Icons:** Lucide React

---

## 🛠️ Quick Start / Local Setup

Follow these instructions to set up the Hub on your local machine.

### 1. Clone the Repository
```bash
git clone https://github.com/pchrysostomou/Cyprus-Greece-football-gaming-hub.git
cd Cyprus-Greece-football-gaming-hub
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Supabase
This project relies on Supabase for the database, user accounts, and score tracking.
1. Create a new [Supabase Project](https://supabase.com/).
2. Run the SQL schema provided in `supabase/schema.sql` within your Supabase SQL Editor. This will automatically generate all necessary tables (`teams`, `players`, `user_scores`, `daily_challenges`).

### 4. Setup Environment Variables
Create a `.env.local` file in the root directory of your project and add your Supabase connection strings:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 5. Run the Server
```bash
npm run dev
```

---

## ⚠️ IMPORTANT: Handling Images & Copyright

**Because football club crests and player portraits are protected by strict copyright laws and 3rd-party API rate limits, this repository DOES NOT ship with official images.** 

When you first clone the repository, game images will use generic placeholders. To make the interface look 100% authentic, **you must supply your own images**.

### How to map your images:

1. **Gather your Assets:** Download authentic `.png` or `.jpg` photos for the teams and players you inserted into your database.
2. **Place them in the `public/` directory:**
   * 🛡️ **For Teams:** Drop the files inside `/public/teams/` (e.g., `/public/teams/Panathinaikos.png`)
   * 👤 **For Players:** Drop the files inside `/public/players/` (e.g., `/public/players/Konstantelias.jpg`)
3. **Map them dynamically in Supabase:**
   In your database, update the `logo_url` or `photo_url` columns to point directly to your local paths!
   
   *Example SQL Query:*
   ```sql
   UPDATE teams SET logo_url = '/teams/Panathinaikos.png' WHERE name = 'Panathinaikos';
   UPDATE players SET photo_url = '/players/Konstantelias.jpg' WHERE name = 'Giannis Konstantelias';
   ```

By using local paths in the `/public` folder, you ensure the games run flawlessly at lightning speeds without ever relying on external CDNs!

### 📈 Expanding the Database
Currently, the provided `schema.sql` and seeding scripts include a base foundation of players and teams just to demonstrate the games (e.g. *Marquinhos, Konstantelias, etc.*). **There are only a few players included by default.** 

The goal of this project is to be community-driven! You can easily add more players or teams by simply adding rows to the `players` table in your Supabase database. Add your favorite team's entire roster and watch them appear in the games!

---
*Built with ❤️ for Cypriot & Greek Football.*
