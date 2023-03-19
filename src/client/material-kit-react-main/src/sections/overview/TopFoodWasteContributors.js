import React, { useState, useEffect } from 'react';
import styled from "@emotion/styled";
import { Typography } from '@mui/material';
import { Grid, Button, TextField, Card, Divider, CardContent, CardHeader } from '@mui/material';
import TopFoodWasteContributorsBarChart from './TopFoodWasteContributorsBarChart';
import { fetchTopFoodWasteContributors } from 'src/api/api';


const StyledGrid = styled(Grid)`
  ${({ theme }) => `
    &.container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  `}
`;

const TopFoodWasteContributors = () => {
  const [contributors, setContributors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchTopFoodWasteContributors();
      setContributors(data);
    };

    fetchData();
  }, []);



  return (
    <Card>
      <CardHeader title = "Top Food Waste Contributors" />
        <Divider />
        <CardContent>
                {/* Display the comparison results here */}
                {contributors.length > 0 && <TopFoodWasteContributorsBarChart data={contributors} />}
          </CardContent>
    </Card>
  );
};

export default TopFoodWasteContributors;
