import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Grid, Typography, Button, TextField, Card, Divider, CardContent, CardHeader, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { fetchPointsEarnedOverTime } from 'src/api/api';
import { format } from "date-fns";

const PointsEarnedOverTime = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [aggregation, setAggregation] = useState('daily');
  const [pointsData, setPointsData] = useState([]);
  const chartCanvasRef = useRef(null)

  const handleFetchPoints = async () => {
    if (!startDate || !endDate) {
      return;
    }

    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const formattedEndDate = format(endDate, "yyyy-MM-dd");
    const data = await fetchPointsEarnedOverTime(formattedStartDate, formattedEndDate, aggregation);
    setPointsData(data);
    console.log(data)
  };

  const chartData = {
    labels: pointsData.map((item) => item.period),
    datasets: [
      {
        label: 'Points Earned',
        data: pointsData.map((item) => item.points),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
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
      <Card>
        <CardHeader title="Points Earned Over Time" />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography>Start Date</Typography>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                renderInput={(params) => <TextField {...params} />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography>End Date</Typography>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                renderInput={(params) => <TextField {...params} />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="aggregation-select-label">Aggregation</InputLabel>
                <Select
                  labelId="aggregation-select-label"
                  id="aggregation-select"
                  value={aggregation}
                  onChange={(e) => setAggregation(e.target.value)}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button onClick={handleFetchPoints}>Get Points</Button>
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

export default PointsEarnedOverTime;

