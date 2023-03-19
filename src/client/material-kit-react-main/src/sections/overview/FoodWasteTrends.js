import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  Typography,
  CardContent,
  TextField,
} from "@mui/material";
import {
  Chart as ChartJS, 
  LinearScale, 
  PointElement, 
  Tooltip, 
  Legend, 
  TimeScale,
  LineElement} from "chart.js"; 
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { fetchFoodWasteTrends } from "src/api/api";
import { format } from "date-fns";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import "chartjs-adapter-date-fns";




ChartJS.register(LinearScale, PointElement, Tooltip, Legend, TimeScale ,LineElement); 

const FoodWasteTrends = () => {
  const [foodWasteTrendsData, setFoodWasteTrendsData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const chartCanvasRef = useRef(null); // declare chartCanvasRef
  
  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleGetFoodWasteTrends = async () => {
    if (!startDate || !endDate) {
      return;
    }

    const start_date = format(startDate, "yyyy-MM-dd");
    const end_date = format(endDate, "yyyy-MM-dd");
    const data = await fetchFoodWasteTrends(start_date, end_date);
    setFoodWasteTrendsData(data);
  };

  const chartData = {
    labels: foodWasteTrendsData.map((item) => item.date),
    datasets: [
      {
        label: "Food Waste",
        data: foodWasteTrendsData.map((item) => item.total_waste),
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1,
        pointBackgroundColor: "rgba(75,192,192,1)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
          displayFormats: {
            day: "MMM d",
          },
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  useEffect(() => {
    let chart = null;
  
    if (chartCanvasRef.current) {
      chart = new ChartJS(chartCanvasRef.current, {
        type: "line",
        data: chartData,
        options: options,
      });
    }
  
    return () => {
      if (chart) {
        chart.destroy(); // destroy the chart when the component unmounts
      }
    };
  }, [chartData, options]);

  return (
    <Card>
      <CardHeader title="Food Waste Trends" />
      <Divider />
      <CardContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{display: "flex", gap: 2 , flexWrap: "wrap"}}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={handleStartDateChange}
              renderInput={(params) => <TextField {...params} />}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={handleEndDateChange}
              renderInput={(params) => <TextField {...params} />}
            />
            <Button onClick={handleGetFoodWasteTrends}>Get Data</Button>
          </Box>
        </LocalizationProvider>
        <Box sx={{ height: 400 }}>
          <canvas ref={chartCanvasRef} />
        </Box>
      </CardContent>
      <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
        <Typography variant="body2" color="text.secondary">
          In this chart, we display the trends of food waste over time.
        </Typography>
      </Box>
    </Card>
  );
};

export default FoodWasteTrends;
