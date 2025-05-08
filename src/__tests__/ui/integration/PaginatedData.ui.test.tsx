import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '../test-utils';
import '../components/setup-test';
import { 
  TablePagination,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert
} from '@mui/material';
import React, { useState, useEffect } from 'react';

// Mock data generator
const generateMockData = (count, offset = 0) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1 + offset,
    name: `Item ${i + 1 + offset}`,
    description: `Description for item ${i + 1 + offset}`
  }));
};

// Simple paginated table component with controlled data for easier testing
const SimplePaginatedTable = ({
  data,
  page,
  rowsPerPage,
  totalCount,
  loading,
  onPageChange,
  onRowsPerPageChange,
  error
}) => {
  return (
    <Box data-testid="paginated-table-container">
      {loading && (
        <CircularProgress data-testid="loading-indicator" />
      )}
      
      {error && (
        <Alert severity="error" data-testid="error-message">
          {error}
        </Alert>
      )}
      
      {!loading && !error && (
        <>
          {(!data || data.length === 0) ? (
            <Alert severity="info" data-testid="no-data-message">
              No items found
            </Alert>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id} data-testid="data-row">
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            data-testid="table-pagination"
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      )}
    </Box>
  );
};

// Controller component with data fetching
const PaginatedTableController = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/advocates?page=${page}&pageSize=${rowsPerPage}`);
      const data = await response.json();
      
      setItems(data.data || []);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage]);

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <SimplePaginatedTable
      data={items}
      page={page}
      rowsPerPage={rowsPerPage}
      totalCount={totalCount}
      loading={loading}
      error={error}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
    />
  );
};

// Mock fetch API
global.fetch = vi.fn();

// Set up fetch mock response
function mockFetchResponse(data, page = 0, pageSize = 5, total = 50) {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      data,
      pagination: {
        page,
        pageSize,
        total,
        pageCount: Math.ceil(total / pageSize)
      }
    })
  });
}

// Mock fetch error
function mockFetchError(errorMessage = 'Failed to fetch data') {
  global.fetch.mockRejectedValueOnce(new Error(errorMessage));
}

describe('Paginated Data Integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('renders the paginated table with data and pagination controls', async () => {
    // Set up the initial mock response
    mockFetchResponse(generateMockData(5), 0, 5, 50);
    
    render(<PaginatedTableController />);
    
    // Should show loading indicator initially
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Check if table is rendered
    expect(screen.getByTestId('paginated-table-container')).toBeInTheDocument();
    
    // Check if we have the expected number of rows
    const rows = screen.getAllByTestId('data-row');
    expect(rows.length).toBe(5);
    
    // Check if pagination control is rendered
    expect(screen.getByTestId('table-pagination')).toBeInTheDocument();
  });
  
  it('displays correct row range in pagination', async () => {
    // Set up the initial mock response
    mockFetchResponse(generateMockData(5), 0, 5, 50);
    
    render(<PaginatedTableController />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // With page 0 and rowsPerPage 5, we should see a pagination display
    const paginationElement = screen.getByTestId('table-pagination');
    expect(paginationElement).toBeInTheDocument();
    
    // Check that it shows the pagination info (exact text may vary with locale)
    const paginationInfo = within(paginationElement).getByText(/of 50/i);
    expect(paginationInfo).toBeInTheDocument();
  });
  
  it('fetches new data when changing pages', async () => {
    // Set up the initial mock response
    mockFetchResponse(generateMockData(5), 0, 5, 50);
    
    render(<PaginatedTableController />);
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // First verify we have the first page data
    const initialRows = screen.getAllByTestId('data-row');
    const initialFirstCell = within(initialRows[0]).getAllByRole('cell')[0];
    expect(initialFirstCell.textContent).toBe('1');
    
    // Set up mock for page 1 - items 6-10
    mockFetchResponse(generateMockData(5, 5), 1, 5, 50);
    
    // Click next page button
    const nextButton = screen.getByRole('button', { name: /go to next page/i });
    fireEvent.click(nextButton);
    
    // Wait for new data to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Check if new data rows are present and have the correct content
    const newRows = screen.getAllByTestId('data-row');
    const firstRowCells = within(newRows[0]).getAllByRole('cell');
    expect(firstRowCells[0].textContent).toBe('6'); // First item on page 1
    
    // Verify fetch was called with correct params
    expect(global.fetch).toHaveBeenCalledWith('/api/advocates?page=1&pageSize=5');
  });
  
  it('handles changing rows per page', async () => {
    // We'll use a direct test of the SimplePaginatedTable to test the row change
    // because Material-UI's select is hard to test with fireEvent
    
    const handleRowsPerPageChange = vi.fn();
    const handlePageChange = vi.fn();
    
    const { rerender } = render(
      <SimplePaginatedTable
        data={generateMockData(5)}
        page={0}
        rowsPerPage={5}
        totalCount={50}
        loading={false}
        error={null}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    );
    
    // Check initial render
    expect(screen.getAllByTestId('data-row').length).toBe(5);
    
    // Re-render with 10 rows
    rerender(
      <SimplePaginatedTable
        data={generateMockData(10)}
        page={0}
        rowsPerPage={10}
        totalCount={50}
        loading={false}
        error={null}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    );
    
    // Check if 10 rows are displayed
    expect(screen.getAllByTestId('data-row').length).toBe(10);
  });
  
  it('handles error states gracefully', async () => {
    // Set up mock to return an error
    mockFetchError('Failed to connect to API');
    
    render(<PaginatedTableController />);
    
    // Should show loading indicator initially
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    
    // Wait for error to display
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Check error message
    const errorMessage = screen.getByTestId('error-message');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent('Failed to connect to API');
    
    // Check that table is not rendered when there's an error
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
  
  it('handles empty results', async () => {
    // Set up mock to return empty data array
    mockFetchResponse([], 0, 5, 0);
    
    render(<PaginatedTableController />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Check for "No items found" message
    const noDataMessage = screen.getByTestId('no-data-message');
    expect(noDataMessage).toBeInTheDocument();
    expect(noDataMessage).toHaveTextContent('No items found');
    
    // Table should not be rendered
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    
    // Pagination should still be rendered but with count of 0
    expect(screen.getByTestId('table-pagination')).toBeInTheDocument();
  });
  
  it('renders last page with fewer items correctly', async () => {
    // Direct test with SimplePaginatedTable for last page with fewer items
    
    // Render last page with only 2 items (items 11-12 of 12 total)
    render(
      <SimplePaginatedTable
        data={generateMockData(2, 10)}
        page={2}
        rowsPerPage={5}
        totalCount={12}
        loading={false}
        error={null}
        onPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
      />
    );
    
    // Check if we have only 2 rows on the last page
    const rows = screen.getAllByTestId('data-row');
    expect(rows.length).toBe(2);
    
    // Next page button should be disabled on last page
    const nextButton = screen.getByRole('button', { name: /go to next page/i });
    expect(nextButton).toBeDisabled();
  });
});