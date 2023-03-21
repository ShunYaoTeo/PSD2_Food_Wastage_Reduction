import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Card,
  CardHeader,
  Divider,
  Typography,
  CardContent,
} from "@mui/material";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from "react-chartjs-2";
import { green, red, blue, orange } from "@mui/material/colors";
import { fetchFoodWasteByCategory } from "src/api/api";
import "chartjs-plugin-datalabels";
import { indigo, success, info, warning, error } from '../../theme/colors';

const barColors = [
  indigo.main,
  success.main,
  info.main,
  warning.main,
  error.main,
  indigo.light,
  success.light,
  info.light,
  warning.light,
  error.light
];

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
)

export const FoodWasteByCategory = () => {
  const [foodWasteData, setFoodWasteData] = useState([]);

  useEffect(() => {
    getFoodWasteByCategory();
  }, []);

  const getFoodWasteByCategory = async () => {
    const data = await fetchFoodWasteByCategory();
    setFoodWasteData(data);
  };

  const chartData = {
    labels: foodWasteData.map((item) => item.food_type),
    datasets: [
      {
        data: foodWasteData.map((item) => item.total_waste),
        backgroundColor: foodWasteData.map((_, index) => barColors[index % barColors.length]),
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    Legend: {
      display: true,
    },
  };

  return (
    <Card sx={{ height: '100%' , width: '100%'}}>
      <CardHeader title="Food Waste by Category" />
      <Divider/>
      <CardContent/>
      <Box
        sx={{
          height: 250,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Container
        sx={{
          maxWidth: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <Doughnut data={chartData} options={options} />
        </Container>
      </Box>
      <CardContent />
      <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
        <Typography variant="body2" color="text.secondary">
          In this chart, we display the amount of food waste by category.
        </Typography>
      </Box>
    </Card>
  );
};

export default FoodWasteByCategory;
