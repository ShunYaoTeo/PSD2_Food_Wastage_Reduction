import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Grid, Typography, Button, TextField, Card, Divider, CardContent, CardHeader } from '@mui/material';
import { fetchWasteReductionProgress } from 'src/api/api';
import { format } from "date-fns";

const WasteReductionProgress = () => {
  const [oldDateRange, setOldDateRange] = useState([new Date("2023-01-01"), new Date("2023-01-01")]);
  const [newDateRange, setNewDateRange] = useState([new Date(), new Date()]);
  const [progressData, setProgressData] = useState(null);
  const chartCanvasRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      const oldStartDate = format(oldDateRange[0], "yyyy-MM-dd");
      const oldEndDate = format(oldDateRange[1], "yyyy-MM-dd");
      const newStartDate = format(newDateRange[0], "yyyy-MM-dd");
      const newEndDate = format(newDateRange[1], "yyyy-MM-dd");
      const data = await fetchWasteReductionProgress(oldStartDate, oldEndDate, newStartDate, newEndDate);
      setProgressData(data);
    }
    fetchData();
  }, []);


  const handleFetchProgress = async () => {
    if (!oldDateRange[0] || !oldDateRange[1] || !newDateRange[0] || !newDateRange[1]) {
      return;
    }

    const oldStartDate = format(oldDateRange[0], "yyyy-MM-dd");
    const oldEndDate = format(oldDateRange[1], "yyyy-MM-dd");
    const newStartDate = format(newDateRange[0], "yyyy-MM-dd");
    const newEndDate = format(newDateRange[1], "yyyy-MM-dd");
    const data = await fetchWasteReductionProgress(oldStartDate, oldEndDate, newStartDate, newEndDate);
    setProgressData(data);
  };

  const chartData = {
    labels: ['Old Period', 'New Period'],
    datasets: [
      {
        label: 'Total Waste',
        data: progressData ? [progressData.old_total_waste, progressData.new_total_waste] : [],
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card sx={{ height: '100%' , width: '100%'}}>
        <CardHeader title="Waste Reduction Progress" />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography>Old Period</Typography>
              <DatePicker
                label="Start Date"
                value={oldDateRange[0]}
                onChange={(newValue) => {
                  setOldDateRange([newValue, oldDateRange[1]]);
                }}
                renderInput={(params) => <TextField {...params} />}
              />
              <DatePicker
                label="End Date"
                value={oldDateRange[1]}
                onChange={(newValue) => {
                  setOldDateRange([oldDateRange[0], newValue]);
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography>New Period</Typography>
              <DatePicker
                label="Start Date"
                value={newDateRange[0]}
                onChange={(newValue) => {
                  setNewDateRange([newValue, newDateRange[1]]);
                }}
                renderInput={(params) => <TextField {...params} />}
              />
              <DatePicker
                label="End Date"
                value={newDateRange[1]}
                onChange={(newValue) => {
                  setNewDateRange([newDateRange[0], newValue]);
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </Grid>
            <Grid item xs={12} container spacing={0} direction="column" alignItems="center" justify="center">
              <Button variant="contained" color="primary" onClick={handleFetchProgress}>Get Progress</Button>
            </Grid>
            <Grid item xs={12}>
              <Line data={chartData} options={options} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};
export default WasteReductionProgress;

