# Namra Classes — Expense Management System

A full-stack expense management system built for **Namra Classes** to track Cash, Bank, and Online finances.

## Features
- 💵 3-Wallet System (Cash / Bank / Online) with real-time balances
- 💸 Add Expenses & Deposits with category selection
- 🔄 Transfer between wallets (e.g., ATM withdrawal)
- 📋 Transaction history with search, filters & pagination
- 🔔 Reminders for recurring payments (Rent, Salary, etc.)
- 📊 Reports with charts (category-wise, daily trends)
- 👥 Multi-user auth (Admin & Staff roles)
- 📱 Mobile-first responsive dark theme

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Auth:** JWT + bcrypt

## Setup

1. Clone this repo
2. Run `npm install`
3. Create a `.env` file:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secret_key
   ```
4. Run `npm run dev`
5. Open `http://localhost:5000`
....


