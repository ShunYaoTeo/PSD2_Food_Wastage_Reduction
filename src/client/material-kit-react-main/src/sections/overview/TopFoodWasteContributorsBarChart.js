import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart } from 'chart.js';
import { CategoryScale } from 'chart.js/auto';
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

Chart.register(CategoryScale);

const TopFoodWasteContributorsBarChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.food_type),
    datasets: [
      {
        axis: 'y',
        label: 'Total Waste',
        data: data.map((item) => item.total_waste),
        backgroundColor: data.map((_, index) => barColors[index % barColors.length]),
        borderColor: data.map((_, index) => barColors[index % barColors.length]),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: 'y',
    maintainAspectRatio: false,
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

  return (
    <div style={{ height: 'calc(100% - 16px)', width: '100%' }}>
      <Bar
        data={chartData}
        options={options}
        height={null}
        width={null}
      />
    </div>
  );
};

export default TopFoodWasteContributorsBarChart;
