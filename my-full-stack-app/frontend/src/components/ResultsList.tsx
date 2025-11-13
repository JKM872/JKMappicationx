import React from 'react';
import { SearchResult } from '../../types';

interface ResultsListProps {
  results: SearchResult[];
}

const ResultsList: React.FC<ResultsListProps> = ({ results }) => {
  return (
    <div>
      <h2>Search Results</h2>
      {results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <ul>
          {results.map((result) => (
            <li key={result.id}>
              <h3>{result.title}</h3>
              <p>{result.content}</p>
              <span>{result.date}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResultsList;