"use client";

import { useEffect, useState } from "react";
import { Typography, Container, Paper, CircularProgress, Box } from "@mui/material";

export default function TestPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Test page loading");
    setLoading(true);
    
    fetch("/api/test")
      .then(res => res.json())
      .then(json => {
        console.log("Test data:", json);
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error in test page:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Test Page
      </Typography>
      
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, bgcolor: "#ffebee" }}>
          <Typography color="error">Error: {error}</Typography>
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {data?.message || "No message"}
          </Typography>
          
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </Paper>
      )}
    </Container>
  );
}