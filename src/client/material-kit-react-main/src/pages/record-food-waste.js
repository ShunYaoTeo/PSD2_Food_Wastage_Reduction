import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography, Container } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { fetchFoodWasteData } from 'src/api/api';

const RecordFoodWaste = () => {
  // State for form fields
  const [foodType, setFoodType] = useState('');
  const [reason, setReason] = useState('');
  const [donated, setDonated] = useState(false);

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
      const response = fetchFoodWasteData(foodType, reason, donated)
      console.log(response)
  };


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
    </DashboardLayout>
  );
};

export default RecordFoodWaste;
