# Backend README

# My Full Stack App - Backend

This is the backend part of the My Full Stack App project, which includes a Node.js server built with Express. The backend provides an API for searching and scraping data, as well as integrating with Google AI for generating captions.

## Features

- **Search Endpoint**: A `/search` endpoint that allows users to query data.
- **Web Scraping**: A service that fetches and parses data from Nitter based on user queries.
- **AI Integration**: Utilizes Google AI to generate captions and hashtags based on search topics.
- **TypeScript**: The backend is written in TypeScript for better type safety and development experience.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd my-full-stack-app/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

### Running the Application

To start the server, run:
```
npm start
```

The server will be running on `http://localhost:3000`.

### API Documentation

- **POST /search**: Accepts a search query and returns the search results.

### Directory Structure

- `src/`: Contains the source code for the backend.
  - `server.ts`: Entry point of the application.
  - `routes/`: Contains route definitions.
  - `controllers/`: Contains request handling logic.
  - `services/`: Contains business logic for scraping and AI integration.
  - `types/`: Contains TypeScript interfaces.
  - `middleware/`: Contains middleware functions.

## License

This project is licensed under the MIT License. See the LICENSE file for details.