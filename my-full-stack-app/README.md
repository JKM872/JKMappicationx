# My Full Stack App

This project is a full-stack application that includes a Node.js backend and a React frontend. The application features a web scraper, a search endpoint, integration with Google AI, and a simple dashboard for displaying results.

## Project Structure

```
my-full-stack-app
├── backend
│   ├── src
│   │   ├── server.ts
│   │   ├── routes
│   │   │   └── search.ts
│   │   ├── controllers
│   │   │   └── searchController.ts
│   │   ├── services
│   │   │   ├── scraperService.ts
│   │   │   └── aiService.ts
│   │   ├── types
│   │   │   └── index.ts
│   │   └── middleware
│   │       └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── frontend
│   ├── src
│   │   ├── App.tsx
│   │   ├── components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── ResultsList.tsx
│   │   ├── pages
│   │   │   └── index.tsx
│   │   ├── types
│   │   │   └── index.ts
│   │   └── index.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
└── README.md
```

## Features

- **Web Scraper**: Fetches data from Nitter based on user queries.
- **Search Endpoint**: A `/search` endpoint that processes incoming search requests.
- **Google AI Integration**: Generates captions and hashtags based on topics using Google AI.
- **Dashboard**: Displays metrics and visualizations of the search results.

## Getting Started

### Prerequisites

- Node.js
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd my-full-stack-app
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm start
   ```

2. Start the frontend application:
   ```
   cd frontend
   npm start
   ```

### Usage

- Navigate to `http://localhost:3000` to access the application.
- Use the search bar to input keywords and view the results in the dashboard.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.