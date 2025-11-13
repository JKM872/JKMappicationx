import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import ResultsList from '../components/ResultsList';

const HomePage: React.FC = () => {
    const [results, setResults] = useState([]);

    const handleSearch = async (query: string) => {
        const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.results);
    };

    return (
        <div>
            <h1>Search Application</h1>
            <SearchBar onSearch={handleSearch} />
            <ResultsList results={results} />
        </div>
    );
};

export default HomePage;