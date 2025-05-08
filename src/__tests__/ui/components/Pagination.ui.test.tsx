import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import './setup-test';
import { 
  TablePagination,
  Box
} from '@mui/material';

// SimplePagination component for testing
const SimplePagination = ({
  count = 100,
  page = 0,
  rowsPerPage = 10,
  onPageChange = vi.fn(),
  onRowsPerPageChange = vi.fn()
}) => {
  return (
    <Box data-testid="pagination-container">
      <TablePagination
        component="div"
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        data-testid="pagination"
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
};

describe('Pagination Component', () => {
  it('renders pagination with correct total count', () => {
    const count = 100;
    render(<SimplePagination count={count} />);
    
    // TablePagination shows count info like "1-10 of 100"
    const paginationText = screen.getByText(/of 100/i);
    expect(paginationText).toBeInTheDocument();
  });
  
  it('renders with correct page number', () => {
    render(<SimplePagination page={2} />);
    
    // On page 2 with rowsPerPage 10, we should see rows 21-30
    const paginationText = screen.getByText(/21-30 of 100/i);
    expect(paginationText).toBeInTheDocument();
  });
  
  it('renders with correct rows per page', () => {
    render(<SimplePagination rowsPerPage={25} />);
    
    // With rowsPerPage 25, we should see rows 1-25
    const paginationText = screen.getByText(/1-25 of 100/i);
    expect(paginationText).toBeInTheDocument();
  });
  
  it('displays the correct page count based on total and rows per page', () => {
    render(<SimplePagination count={100} rowsPerPage={10} />);
    
    // We should have 10 pages total (100/10)
    // Check that we can go to the next page
    const nextButton = screen.getByRole('button', { name: /next page/i });
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).not.toBeDisabled();
  });
  
  it('disables previous page button on first page', () => {
    render(<SimplePagination page={0} />);
    
    const prevButton = screen.getByRole('button', { name: /previous page/i });
    expect(prevButton).toBeDisabled();
  });
  
  it('disables next page button on last page', () => {
    // Last page for count 100 and rowsPerPage 10 is 9 (0-indexed)
    render(<SimplePagination count={100} rowsPerPage={10} page={9} />);
    
    const nextButton = screen.getByRole('button', { name: /next page/i });
    expect(nextButton).toBeDisabled();
  });
  
  it('calls onPageChange when next page button is clicked', () => {
    const handlePageChange = vi.fn();
    render(
      <SimplePagination 
        page={1} 
        onPageChange={handlePageChange}
      />
    );
    
    const nextButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextButton);
    
    expect(handlePageChange).toHaveBeenCalled();
    // First arg is event, second is new page (2)
    expect(handlePageChange.mock.calls[0][1]).toBe(2);
  });
  
  it('calls onPageChange when previous page button is clicked', () => {
    const handlePageChange = vi.fn();
    render(
      <SimplePagination 
        page={1} 
        onPageChange={handlePageChange}
      />
    );
    
    const prevButton = screen.getByRole('button', { name: /previous page/i });
    fireEvent.click(prevButton);
    
    expect(handlePageChange).toHaveBeenCalled();
    // First arg is event, second is new page (0)
    expect(handlePageChange.mock.calls[0][1]).toBe(0);
  });
});