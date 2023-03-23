import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { fetchFoodWasteData } from 'src/api/api';
import { fetchFoodWasteHistory } from 'src/api/api';

const RecordFoodWaste = () => {
  // State for form fields
  const [foodType, setFoodType] = useState('');
  const [reason, setReason] = useState('');
  const [donated, setDonated] = useState(false);
  const [foodWasteHistory, setFoodWasteHistory] = useState([]);

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    await fetchFoodWasteData(foodType, reason, donated)
    console.log("Food waste data submitted");

    // Clear the form
    setFoodType("");
    setReason("");
    setDonated(false);
  
    // Add a delay before fetching the updated FoodWasteHistory data
    setTimeout(async () => {
      // Refetch food waste history data
      const data = await fetchFoodWasteHistory();
      console.log(data)
      setFoodWasteHistory(data);
  }, 1000); // 1000 ms (1 second) delay before fetching the updated data

    
  };

   // Fetch food waste history data when the component mounts
   useEffect(() => {
    async function fetchData() {
      const data = await fetchFoodWasteHistory();
      setFoodWasteHistory(data);
      
    }

    fetchData();
  }, []);


  return (
    <DashboardLayout>
      <Container maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h4">Record Food Waste</Typography>
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel>Food Type</InputLabel>
            <Select
              value={foodType}
              onChange={(event) => setFoodType(event.target.value)}
              label="Food Type"
            >
              <MenuItem value="Fruits and Vegetables">Fruits and Vegetables</MenuItem>
              <MenuItem value="Meat and Poultry">Meat and Poultry</MenuItem>
              <MenuItem value="Seafood">Seafood</MenuItem>
              <MenuItem value="Grains and Bread">Grains and Bread</MenuItem>
              <MenuItem value="Dairy Products">Dairy Products</MenuItem>
              <MenuItem value="Condiments and Sauces">Condiments and Sauces</MenuItem>
              <MenuItem value="Beverages">Beverages</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            variant="outlined"
            margin="normal"
            label="Reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel>Donated</InputLabel>
            <Select
              value={donated}
              onChange={(event) => setDonated(event.target.value)}
              label="Donated"
            >
              <MenuItem value={false}>No</MenuItem>
              <MenuItem value={true}>Yes</MenuItem>
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </Box>
        </Container>
        <Container style={{ marginTop: "2rem" }}>
        <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Food Type</TableCell>
              <TableCell>Food Weight</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Donated</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {foodWasteHistory.map((waste, index) => (
              <TableRow key={index}>
                <TableCell>{waste.food_type}</TableCell>
                <TableCell>{waste.weight} kg</TableCell>
                <TableCell>{waste.reason}</TableCell>
                <TableCell>{waste.donated ? 'Yes' : 'No'}</TableCell>
                <TableCell>{new Date(waste.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </Container>
    </DashboardLayout>
  );
};

export default RecordFoodWaste;
