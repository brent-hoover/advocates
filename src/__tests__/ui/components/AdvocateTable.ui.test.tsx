import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import './setup-test';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Typography } from '@mui/material';

// Simple advocate table component for testing
const AdvocateTable = ({ advocates = [], loading = false, error = null }) => {
  if (loading) {
    return <Typography data-testid="loading">Loading advocates...</Typography>;
  }

  if (error) {
    return <Typography data-testid="error">{error}</Typography>;
  }

  if (advocates.length === 0) {
    return <Typography data-testid="no-results">No advocates found</Typography>;
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>First Name</TableCell>
            <TableCell>Last Name</TableCell>
            <TableCell>City</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {advocates.map((advocate) => (
            <TableRow key={advocate.id} data-testid="advocate-row">
              <TableCell>{advocate.firstName}</TableCell>
              <TableCell>{advocate.lastName}</TableCell>
              <TableCell>{advocate.city}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Sample data for testing
const sampleAdvocates = [
  { id: 1, firstName: 'John', lastName: 'Doe', city: 'New York' },
  { id: 2, firstName: 'Jane', lastName: 'Smith', city: 'Los Angeles' },
];

describe('AdvocateTable Component', () => {
  it('should render loading state correctly', () => {
    render(<AdvocateTable loading={true} />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText('Loading advocates...')).toBeInTheDocument();
  });

  it('should render error state correctly', () => {
    const errorMessage = 'Failed to load advocates';
    render(<AdvocateTable error={errorMessage} />);
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should render empty state correctly', () => {
    render(<AdvocateTable advocates={[]} />);
    expect(screen.getByTestId('no-results')).toBeInTheDocument();
    expect(screen.getByText('No advocates found')).toBeInTheDocument();
  });

  it('should render advocates correctly', () => {
    render(<AdvocateTable advocates={sampleAdvocates} />);
    
    // Check table headers
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    
    // Check advocate data is rendered
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
    
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('Smith')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles')).toBeInTheDocument();
    
    // Check number of rows
    const rows = screen.getAllByTestId('advocate-row');
    expect(rows).toHaveLength(2);
  });
});