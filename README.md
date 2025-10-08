# Flashy
*A simple flashcard web app built with Next.js, NextAuth, and MongoDB.*

## Table of Contents

- [Overview](#overview)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Database Schema](#database-schema)  
- [Project Structure](#project-structure-key-files)  
- [Pages](#pages)  
- [Setup & Installation](#setup--installation)  
- [Authentication](#authentication)  
- [Spaced Repetition System (SRS)](#spaced-repetition-system-srs)  
- [Screenshots](#screenshots)  
- [License & Notes](#license--notes) 

## Overview
Flashy is a flashcard maker web app with a simple spaced repetition system.  
This is the **public MVP version**, intended as a portfolio project.  

## Features
- Create and manage custom flashcard decks  
- Review decks with a spaced repetition method  
- Test through simple multichoice quiz  
- Authentication via GitHub (NextAuth)  
- Responsive design (desktop & mobile friendly)  
- Clean and simple UI  

## Tech Stack
- **Frontend:** Next.js (App Router), React, TailwindCSS  
- **Auth:** NextAuth (GitHub provider)  
- **Database:** MongoDB (native driver)  

## Database Schema
- Three main collections:
   - Users
   - Decks
   - DecksProgress

## Project Structure (key files)
- **./app:** (pages and api routes)
- **./types:** (type definitions)
- **./services/requests:** (requests) 
- **./services/systems:** (core services)
- **./lib/auth.ts:** (auth config)
- **./lib/db.ts:** (db config)
- **./lib/validations.ts:** (zod validations)
- **./helpers:** (helper utilities)  
- **./scripts:** (useful scripts)
- **./components:** (UI components) 
- **./constants:** (app constants)  
- **./middleware.ts:** (Next.js middleware)  
- **./.env.example:** (environment variable sample)
- **./\_\_tests\_\_:** (test folder)

## Pages
- **/:** (placeholder for home page)
- **/auth/login:** (login page, ***requires guest***)
- **/decks:** (list decks created by current auth user, ***requires auth***)
- **/decks/{deck_id}:** (display deck cards and allow edit, ***requires auth***)
- **/review/{deck_id}:** (review page)
- **/test/{deck_id}:** (test page)
- **/common/{misc_page}:** (placeholders for other pages)

## Setup & Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/YOUR_USERNAME/flashy-public.git
   ```
2. **Install dependencies**
   ```bash
   npm i
   ```
3. **Setup environment variables**  
Copy .env.example into .env.local and fill in the required values.
4. **Requirements**  
   - Mongodb Compass (for local/dev environement)
   - Mongosh (to run scripts)
5. **Run utility scripts**  
   - Setup db collections
      ```bash
      ./scripts/initDB.bat
      ```
   - Seed db
      ```bash
      ./scripts/seedDB.bat
      ```
   ⚠️ These scripts are Windows-specific (.bat).  
   On macOS/Linux, run the corresponding .js files manually with mongosh.
6. **Run server**
   ```bash
   npm run dev
   ```

## Authentication
Uses GitHub OAuth (NextAuth v5 beta).

Make sure to configure your GitHub OAuth app with the correct Authorization callback URL:
http://localhost:3000/api/auth/callback/github

## Spaced Repetition System (SRS)
- This app implements a simple priority-based SRS
- Cards gain/lose priority based on review history and a score
- Cards not seen in a while and with low score will surface first
- Small randomness is applied to avoid repetition bias

## Screenshots
![login page](./public/screenshots/ss%201.jpeg "Login page")
![decks page](./public/screenshots/ss%202.jpeg "Decks page")
![decks page light theme](./public/screenshots/ss%203.jpeg "Decks page light theme")
![deck page](./public/screenshots/ss%204.jpeg "Deck page")
![deck page light theme](./public/screenshots/ss%205.jpeg "Deck page light theme")
![review page](./public/screenshots/ss%206.jpeg "Review page")
![test page](./public/screenshots/ss%207.jpeg "Test page")

## License & Notes
This version is mainly for portfolio purposes.  
Feel free to fork and experiment, the planned full SaaS version will remain private.
