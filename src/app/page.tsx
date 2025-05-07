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
  TablePagination
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
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchAdvocates = async () => {
      try {
        const response = await fetch("/api/advocates");
        const jsonResponse = await response.json();
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
      } catch (error) {
        console.error("Error fetching advocates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvocates();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setPage(0); // Reset to first page when searching

    if (term.trim() === "") {
      setFilteredAdvocates(advocates);
      return;
    }

    const filtered = advocates.filter((advocate) => {
      return (
        advocate.firstName.toLowerCase().includes(term.toLowerCase()) ||
        advocate.lastName.toLowerCase().includes(term.toLowerCase()) ||
        advocate.city.toLowerCase().includes(term.toLowerCase()) ||
        advocate.degree.toLowerCase().includes(term.toLowerCase()) ||
        advocate.specialties.some(s => s.toLowerCase().includes(term.toLowerCase())) ||
        String(advocate.yearsOfExperience).includes(term)
      );
    });

    setFilteredAdvocates(filtered);
  };

  const handleResetSearch = () => {
    setSearchTerm("");
    setFilteredAdvocates(advocates);
    setPage(0); // Reset to first page when clearing search
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

  // Get current page data
  const paginatedData = filteredAdvocates.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Solace Advocates
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Search
          </Typography>
          <Box sx={{ mb: 1 }}>
            {searchTerm && (
              <Typography variant="body2" color="text.secondary">
                Searching for: <strong>{searchTerm}</strong>
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
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
            <Button 
              variant="outlined" 
              onClick={handleResetSearch}
              startIcon={<RestartAltIcon />}
              disabled={!searchTerm}
            >
              Reset
            </Button>
          </Box>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Degree</TableCell>
                  <TableCell>Specialties</TableCell>
                  <TableCell>Experience (Years)</TableCell>
                  <TableCell>Phone Number</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length > 0 ? (
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
                      <TableCell>{formatPhoneNumber(advocate.phoneNumber)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        No advocates found
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
            count={filteredAdvocates.length}
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
