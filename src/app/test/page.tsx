"use client";

import { useEffect, useState } from "react";
import { 
  Typography, 
  Container, 
  Paper, 
  CircularProgress, 
  Box, 
  Button,
  Alert,
  AlertTitle,
  Divider
} from "@mui/material";

export default function TestPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Database reset state
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState<any>(null);
  const [resetError, setResetError] = useState<string | null>(null);

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

  const resetDatabase = async () => {
    try {
      setResetting(true);
      setResetError(null);
      setResetResult(null);

      // Call the seed API to reset the database
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unknown error occurred");
      }

      setResetResult(data);
    } catch (err: any) {
      setResetError(err.message || "Failed to reset database");
      console.error("Error resetting database:", err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
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
      
      <Divider sx={{ my: 4 }} />
      
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Database Management
        </Typography>
        
        <Typography variant="body1" paragraph>
          If you are seeing duplicate advocates in the database, you can use this button to reset the database.
          This will remove all existing advocates and repopulate with fresh data.
        </Typography>
        
        <Box sx={{ my: 4 }}>
          <Button 
            variant="contained" 
            color="warning"
            onClick={resetDatabase}
            disabled={resetting}
            sx={{ px: 4, py: 1.5 }}
          >
            {resetting ? <CircularProgress size={24} color="inherit" /> : "Reset Database"}
          </Button>
        </Box>
        
        {resetError && (
          <Alert severity="error" sx={{ mt: 3 }}>
            <AlertTitle>Error</AlertTitle>
            {resetError}
          </Alert>
        )}
        
        {resetResult && (
          <Alert severity="success" sx={{ mt: 3 }}>
            <AlertTitle>Success</AlertTitle>
            <Typography variant="body2">
              {resetResult.message}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {resetResult.count} advocates were added to the database.
            </Typography>
          </Alert>
        )}
      </Paper>
    </Container>
  );
}