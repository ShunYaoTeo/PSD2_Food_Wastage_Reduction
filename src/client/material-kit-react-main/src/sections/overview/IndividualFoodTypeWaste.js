import React from 'react';
import { Box, Card, CardHeader, CardContent, Typography } from '@mui/material';

const FoodTypeWasteWidget = ({ foodType, wasteWeight }) => {
  return (
    <Card sx={{ p: 1, m: 1, minWidth: 280 }}>
      <CardHeader title={foodType} />
      <CardContent>
        <Typography variant="body1">Waste Weight: {wasteWeight} kg</Typography>
      </CardContent>
    </Card>
  );
};

export default FoodTypeWasteWidget;
