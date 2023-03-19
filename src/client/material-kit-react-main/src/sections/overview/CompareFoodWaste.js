import React, { useState } from 'react';
import styled from "@emotion/styled";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Grid, Button, TextField, Card, Divider, CardContent, CardHeader } from '@mui/material';
import { format } from "date-fns";
import FoodWasteBarChart from './FoodWasteBarChart';
import { fetchCompareFoodWaste } from 'src/api/api';


const StyledGrid = styled(Grid)`
  ${({ theme }) => `
    &.container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    & .datePicker {
      margin-bottom: ${theme.spacing(2)};
    }
    & .compareButton {
      margin-bottom: ${theme.spacing(2)};
    }
  `}
`;



const CompareFoodWaste = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [comparisonData, setComparisonData] = useState([]);

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleCompare = async () => {
    if (!startDate || !endDate) {
      return;
    }

    const start_date = format(startDate, "yyyy-MM-dd");
    const end_date = format(endDate, "yyyy-MM-dd");
    const data = await fetchCompareFoodWaste(start_date, end_date);
    setComparisonData(data);
  };

  return (
    <Card>
      <CardHeader title = "Compare Food Waste" />
        <Divider />
        <CardContent>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <StyledGrid container className="container">
                <DatePicker
                  className="datePicker"
                  label="Start Date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  renderInput={(params) => <TextField {...params} />}
                />
                <DatePicker
                  className="datePicker"
                  label="End Date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  renderInput={(params) => <TextField {...params} />}
                />
                <Button
                  className="compareButton"
                  variant="contained"
                  color="primary"
                  onClick={handleCompare}
                >
                  Compare
                </Button>
                {/* Display the comparison results here */}
                {comparisonData.length > 0 && <FoodWasteBarChart data={comparisonData} />}
              </StyledGrid>
            </LocalizationProvider>
          </CardContent>
    </Card>
  );
};

export default CompareFoodWaste;
