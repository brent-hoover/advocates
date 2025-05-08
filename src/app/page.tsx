"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  Stack,
  CircularProgress,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

type Advocate = {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
};

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter state
  const [cityFilter, setCityFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([]);

  // Load initial data and get available filters
  useEffect(() => {
    // Fetch all advocates to extract filter options
    fetch('/api/advocates')
      .then(response => response.json())
      .then(result => {
        if (result && Array.isArray(result.data)) {
          // Extract unique cities for filter
          const cities = [...new Set(result.data.map((a: Advocate) => a.city))].sort();
          setAvailableCities(cities);
          
          // Extract unique specialties for filter
          const specialties = [...new Set(
            result.data.flatMap((a: Advocate) => a.specialties)
          )].sort();
          setAvailableSpecialties(specialties);
        }
      })
      .catch(error => {
        console.error('Error fetching filter options:', error);
      });
  }, []);
  
  // Fetch filtered data whenever filters, search term, or pagination change
  useEffect(() => {
    setLoading(true);
    
    // Build URL with all filters and pagination
    let url = `/api/advocates?page=${page}&pageSize=${rowsPerPage}`;
    if (cityFilter) url += `&city=${encodeURIComponent(cityFilter)}`;
    if (specialtyFilter) url += `&specialty=${encodeURIComponent(specialtyFilter)}`;
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data && Array.isArray(data.data)) {
          setAdvocates(data.data);
          setFilteredAdvocates(data.data);
          setTotalCount(data.pagination?.total || data.data.length);
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page, rowsPerPage, cityFilter, specialtyFilter, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setPage(0); // Reset to first page when searching
    // The actual filtering will be handled by the API
  };

  const handleResetSearch = () => {
    setSearchTerm("");
    setCityFilter("");
    setSpecialtyFilter("");
    setPage(0); // Reset to first page when clearing search
  };
  
  const handleCityChange = (event: any) => {
    setCityFilter(event.target.value);
    setPage(0); // Reset to first page when changing filter
  };
  
  const handleSpecialtyChange = (event: any) => {
    setSpecialtyFilter(event.target.value);
    setPage(0); // Reset to first page when changing filter
  };

  const formatPhoneNumber = (phoneNumber: number) => {
    const numStr = phoneNumber.toString();
    if (numStr.length === 10) {
      return `(${numStr.slice(0, 3)}) ${numStr.slice(3, 6)}-${numStr.slice(6)}`;
    }
    return phoneNumber;
  };

  // Pagination handlers
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  console.log("Current data:", {
    advocatesLength: advocates.length,
    filteredLength: filteredAdvocates.length,
    searchTerm
  });
  
  // Use the data from the API directly since all filtering/pagination is handled server-side
  const paginatedData = filteredAdvocates;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Solace Advocates
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Search and Filter
          </Typography>
          <Box sx={{ mb: 1 }}>
            {(searchTerm || cityFilter || specialtyFilter) && (
              <Box sx={{ mb: 2 }}>
                {searchTerm && (
                  <Typography variant="body2" color="text.secondary">
                    Searching for: <strong>{searchTerm}</strong>
                  </Typography>
                )}
                {cityFilter && (
                  <Typography variant="body2" color="text.secondary">
                    City filter: <strong>{cityFilter}</strong>
                  </Typography>
                )}
                {specialtyFilter && (
                  <Typography variant="body2" color="text.secondary">
                    Specialty filter: <strong>{specialtyFilter}</strong>
                  </Typography>
                )}
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search advocates..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
              }}
            />
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="city-filter-label">Filter by City</InputLabel>
                <Select
                  labelId="city-filter-label"
                  id="city-filter"
                  value={cityFilter}
                  label="Filter by City"
                  onChange={handleCityChange}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                        minWidth: '100%'
                      }
                    }
                  }}
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
              
              <FormControl fullWidth size="small">
                <InputLabel id="specialty-filter-label">Filter by Specialty</InputLabel>
                <Select
                  labelId="specialty-filter-label"
                  id="specialty-filter"
                  value={specialtyFilter}
                  label="Filter by Specialty"
                  onChange={handleSpecialtyChange}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                        minWidth: '100%'
                      }
                    }
                  }}
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
          </Box>
          
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button 
              variant="outlined" 
              onClick={handleResetSearch}
              startIcon={<RestartAltIcon />}
              disabled={!searchTerm && !cityFilter && !specialtyFilter}
            >
              Reset Filters
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Always show table regardless of loading */}
      {(
        <Paper>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ backgroundColor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white', fontSize: '1rem' }}>First Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white', fontSize: '1rem' }}>Last Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white', fontSize: '1rem' }}>City</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white', fontSize: '1rem' }}>Degree</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white', fontSize: '1rem' }}>Specialties</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white', fontSize: '1rem' }}>Experience (Years)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white', fontSize: '1rem', minWidth: '140px' }}>Phone Number</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length > 0 ? (
                  // Map the actual advocate data
                  paginatedData.map((advocate) => (
                    <TableRow key={advocate.id}>
                      <TableCell>{advocate.firstName}</TableCell>
                      <TableCell>{advocate.lastName}</TableCell>
                      <TableCell>{advocate.city}</TableCell>
                      <TableCell>{advocate.degree}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {advocate.specialties.map((specialty, index) => (
                            <Chip 
                              key={index} 
                              label={specialty} 
                              size="small" 
                              sx={{ margin: "2px" }}
                            />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell>{advocate.yearsOfExperience}</TableCell>
                      <TableCell sx={{ minWidth: '140px', whiteSpace: 'nowrap' }}>{formatPhoneNumber(advocate.phoneNumber)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  // Show backup data in case we still don't have data
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        No advocates found. Data: {JSON.stringify({
                          paginatedDataLength: paginatedData.length,
                          advocatesLength: advocates.length,
                          filteredLength: filteredAdvocates.length
                        })}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </Container>
  );
}
