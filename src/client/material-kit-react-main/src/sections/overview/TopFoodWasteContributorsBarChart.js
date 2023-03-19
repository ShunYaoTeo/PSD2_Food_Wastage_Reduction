import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart } from 'chart.js';
import { CategoryScale } from 'chart.js/auto';

Chart.register(CategoryScale);

const TopFoodWasteContributorsBarChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.food_type),
    datasets: [
      {
        axis: 'y',
        label: 'Total Waste',
        data: data.map((item) => item.total_waste),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    scales: {
      x: {
        
        title: {
          display: true,
          text: 'Total Waste',
        },
      },
      y: {
        type: 'category',
        title: {
          display: true,
          text: 'Category',
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default TopFoodWasteContributorsBarChart;