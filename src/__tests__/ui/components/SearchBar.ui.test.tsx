import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import './setup-test';
import { TextField, Button, Box } from '@mui/material';

// Simple Search component for testing
const SearchBar = ({ onSearch, onReset }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const searchTerm = e.target.elements.search.value;
    onSearch(searchTerm);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} data-testid="search-form" sx={{ display: 'flex', gap: 2 }}>
      <TextField 
        name="search"
        placeholder="Search advocates..."
        inputProps={{ 'data-testid': 'search-input' }}
        fullWidth
      />
      <Button type="submit" data-testid="search-button" variant="contained">Search</Button>
      <Button 
        type="button" 
        onClick={onReset}
        data-testid="reset-button"
        variant="outlined"
      >
        Reset
      </Button>
    </Box>
  );
};

describe('SearchBar Component', () => {
  it('should render search input and buttons', () => {
    render(<SearchBar onSearch={() => {}} onReset={() => {}} />);
    
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
    expect(screen.getByTestId('reset-button')).toBeInTheDocument();
  });

  it('should call onSearch with input value when form is submitted', async () => {
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} onReset={() => {}} />);
    
    const user = userEvent.setup();
    const input = screen.getByTestId('search-input');
    await user.type(input, 'John');
    
    const form = screen.getByTestId('search-form');
    await user.type(input, '{enter}');
    
    expect(handleSearch).toHaveBeenCalledWith('John');
  });

  it('should call onReset when reset button is clicked', async () => {
    const handleReset = vi.fn();
    render(<SearchBar onSearch={() => {}} onReset={handleReset} />);
    
    const user = userEvent.setup();
    const resetButton = screen.getByTestId('reset-button');
    await user.click(resetButton);
    
    expect(handleReset).toHaveBeenCalled();
  });
});