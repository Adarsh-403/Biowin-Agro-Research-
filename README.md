# Biowin

Biowin is a full-stack web application built using the MERN stack (MongoDB, Express, React, Node.js).

## Tech Stack
- **Frontend**: React (Vite)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB

## Project Structure
The project is organized into two main workspaces:
- `/frontend`: Contains the React web application.
- `/backend`: Contains the Node.js/Express server API and database connection logic.

## Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your local machine.

## Getting Started

### 1. Installation
To install the dependencies for the root, frontend, and backend simultaneously, run the following command in the root directory:

```bash
npm run install-all
```

*(Alternatively, you can navigate to `frontend` and `backend` directories respectively and run `npm install` in each).*

### 2. Running the Application
To start both the React frontend and the Node backend concurrently, run the following command from the root directory:

```bash
npm run dev
```

- The **frontend** will be available at: `http://localhost:5173/`
- The **backend** will be available at port `5000` (or the port specified in your environment).

## Additional Information
- **Database**: The backend currently connects to MongoDB Atlas using the provided connection string in `server.js`.
- **Concurrent Execution**: The root directory utilizes `concurrently` to run both servers with a single command.
