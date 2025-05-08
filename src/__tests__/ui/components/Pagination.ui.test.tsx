import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '../test-utils';
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
    
    // Get the pagination element
    const pagination = screen.getByTestId('pagination');
    
    // Check that it contains the total count
    expect(pagination).toHaveTextContent(/100/);
  });
  
  it('renders with correct page number', () => {
    render(<SimplePagination page={2} />);
    
    // Get the pagination element
    const pagination = screen.getByTestId('pagination');
    
    // We need to check for different possible formats of pagination text
    // MUI might use different formats depending on locale and settings
    const regex = /(?:21.{1,2}30|21.*30).*100/;
    expect(pagination.textContent).toMatch(regex);
  });
  
  it('renders with correct rows per page', () => {
    render(<SimplePagination rowsPerPage={25} />);
    
    // Get the pagination element
    const pagination = screen.getByTestId('pagination');
    
    // We need to check for different possible formats of pagination text
    // MUI might use different formats depending on locale and settings
    const regex = /(?:1.{1,2}25|1.*25).*100/;
    expect(pagination.textContent).toMatch(regex);
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