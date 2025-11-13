import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SearchBar from './components/SearchBar';
import ResultsList from './components/ResultsList';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <h1>My Full Stack App</h1>
        <SearchBar />
        <Switch>
          <Route path="/" exact component={Dashboard} />
          <Route path="/results" component={ResultsList} />
        </Switch>
      </div>
    </Router>
  );
};

export default App;