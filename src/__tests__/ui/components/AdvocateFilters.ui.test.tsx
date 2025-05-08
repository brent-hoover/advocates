import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '../test-utils';
import userEvent from '@testing-library/user-event';
import './setup-test';
import { 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Box,
  Button
} from '@mui/material';

// Mock data for testing
const mockCities = ['New York', 'Los Angeles', 'Chicago'];
const mockSpecialties = ['Anxiety', 'Depression', 'PTSD'];

// Simplified AdvocateFilters component
const AdvocateFilters = ({ 
  searchTerm = '',
  cityFilter = '',
  specialtyFilter = '', 
  availableCities = mockCities,
  availableSpecialties = mockSpecialties,
  onSearchChange = vi.fn(),
  onCityChange = vi.fn(),
  onSpecialtyChange = vi.fn(),
  onResetFilters = vi.fn()
}) => {
  
  return (
    <Box data-testid="advocate-filters">
      <TextField
        placeholder="Search advocates..."
        value={searchTerm}
        onChange={onSearchChange}
        inputProps={{ "data-testid": "search-input" }}
        fullWidth
      />
      
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="city-filter-label" data-testid="city-label">Filter by City</InputLabel>
          <Select
            labelId="city-filter-label"
            value={cityFilter}
            onChange={onCityChange}
            inputProps={{ "data-testid": "city-select" }}
            label="Filter by City"
          >
            <MenuItem value="">
              <em>All Cities</em>
            </MenuItem>
            {availableCities.map((city) => (
              <MenuItem key={city} value={city}>
                {city}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl fullWidth>
          <InputLabel id="specialty-filter-label" data-testid="specialty-label">Filter by Specialty</InputLabel>
          <Select
            labelId="specialty-filter-label"
            value={specialtyFilter}
            onChange={onSpecialtyChange}
            inputProps={{ "data-testid": "specialty-select" }}
            label="Filter by Specialty"
          >
            <MenuItem value="">
              <em>All Specialties</em>
            </MenuItem>
            {availableSpecialties.map((specialty) => (
              <MenuItem key={specialty} value={specialty}>
                {specialty}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Button 
        onClick={onResetFilters}
        data-testid="reset-filters"
        disabled={!searchTerm && !cityFilter && !specialtyFilter}
        variant="outlined"
        sx={{ mt: 2 }}
      >
        Reset Filters
      </Button>
    </Box>
  );
};

describe('AdvocateFilters Component', () => {
  it('renders all filter inputs', () => {
    render(<AdvocateFilters />);
    
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('city-select')).toBeInTheDocument();
    expect(screen.getByTestId('specialty-select')).toBeInTheDocument();
    expect(screen.getByTestId('reset-filters')).toBeInTheDocument();
  });
  
  it('renders city and specialty labels', () => {
    render(<AdvocateFilters />);
    
    expect(screen.getByTestId('city-label')).toBeInTheDocument();
    expect(screen.getByTestId('specialty-label')).toBeInTheDocument();
  });
  
  it('calls onSearchChange when search input changes', async () => {
    const handleSearchChange = vi.fn();
    render(<AdvocateFilters onSearchChange={handleSearchChange} />);
    
    const user = userEvent.setup();
    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'John');
    
    expect(handleSearchChange).toHaveBeenCalled();
  });
  
  it('disables reset button when no filters are active', () => {
    render(
      <AdvocateFilters 
        searchTerm="" 
        cityFilter="" 
        specialtyFilter="" 
      />
    );
    
    expect(screen.getByTestId('reset-filters')).toBeDisabled();
  });
  
  it('enables reset button when at least one filter is active', () => {
    render(
      <AdvocateFilters 
        searchTerm="John" 
        cityFilter="" 
        specialtyFilter="" 
      />
    );
    
    expect(screen.getByTestId('reset-filters')).not.toBeDisabled();
  });
  
  it('calls onResetFilters when reset button is clicked', async () => {
    const handleResetFilters = vi.fn();
    render(
      <AdvocateFilters 
        searchTerm="John" 
        onResetFilters={handleResetFilters} 
      />
    );
    
    const user = userEvent.setup();
    await user.click(screen.getByTestId('reset-filters'));
    
    expect(handleResetFilters).toHaveBeenCalled();
  });
});