# My Full Stack App - Frontend

This is the frontend part of the My Full Stack App project, built with React and TypeScript. The frontend interacts with the Node.js backend to provide a seamless user experience.

## Project Structure

- `src/`: Contains all the source code for the frontend application.
  - `App.tsx`: Main component that sets up routing and layout.
  - `components/`: Contains reusable components.
    - `Dashboard.tsx`: Displays metrics and visualizations.
    - `SearchBar.tsx`: Allows users to input keywords for searching.
    - `ResultsList.tsx`: Displays the list of search results.
  - `pages/`: Contains the main pages of the application.
    - `index.tsx`: Main page integrating `SearchBar` and `ResultsList`.
  - `types/`: Contains TypeScript interfaces for the frontend.
  - `index.tsx`: Entry point of the React application.

## Getting Started

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd my-full-stack-app/frontend
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the application:**
   ```
   npm start
   ```

The application will be available at `http://localhost:3000`.

## Features

- Search functionality to query data from the backend.
- Dashboard to visualize metrics and results.
- Responsive design for a better user experience.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes. 

## License

This project is licensed under the MIT License.