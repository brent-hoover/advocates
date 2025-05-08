import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import './setup-test';
import { TextField, Button } from '@mui/material';

// Simple Search component for testing
const SearchBar = ({ onSearch, onReset }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const searchTerm = e.target.elements.search.value;
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} data-testid="search-form">
      <TextField 
        name="search"
        placeholder="Search advocates..."
        inputProps={{ 'data-testid': 'search-input' }}
      />
      <Button type="submit" data-testid="search-button">Search</Button>
      <Button 
        type="button" 
        onClick={onReset}
        data-testid="reset-button"
      >
        Reset
      </Button>
    </form>
  );
};

describe('SearchBar Component', () => {
  it('should render search input and buttons', () => {
    render(<SearchBar onSearch={() => {}} onReset={() => {}} />);
    
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
    expect(screen.getByTestId('reset-button')).toBeInTheDocument();
  });

  it('should call onSearch with input value when form is submitted', () => {
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} onReset={() => {}} />);
    
    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'John' } });
    
    const form = screen.getByTestId('search-form');
    fireEvent.submit(form);
    
    expect(handleSearch).toHaveBeenCalledWith('John');
  });

  it('should call onReset when reset button is clicked', () => {
    const handleReset = vi.fn();
    render(<SearchBar onSearch={() => {}} onReset={handleReset} />);
    
    const resetButton = screen.getByTestId('reset-button');
    fireEvent.click(resetButton);
    
    expect(handleReset).toHaveBeenCalled();
  });
});