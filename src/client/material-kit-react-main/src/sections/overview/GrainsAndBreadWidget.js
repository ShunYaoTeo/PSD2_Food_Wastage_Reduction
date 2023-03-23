import React, { useState, useEffect } from 'react';
import { Card, CardContent, Avatar, Stack, SvgIcon, Typography} from '@mui/material';
import { fetchIndividualFoodTypeWaste } from 'src/api/api';
import CurrencyDollarIcon from '@heroicons/react/24/solid/CurrencyDollarIcon';
import { width } from '@mui/system';

const GrainsAndBreadWidget = () => {
  const [weight, setWeight] = useState(0)
  const foodType = 'Grains and Bread'

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchIndividualFoodTypeWaste()
      for(let i = 0; i < data.length; i++){
        if(data[i].food_type === 'Grains and Bread'){
          setWeight(data[i].total_waste_weight);
          console.log(data[i].food_type);
          console.log(data[i].total_waste_weight);
        }
      };
    };
    fetchData();
  }, []);
  
  return (
    <Card sx={{ height: '100%' , width: '100%'}}>
      <CardContent>
        <Stack
          alignItems="flex-start"
          direction="row"
          justifyContent="space-between"
          spacing={3}
        >
          <Stack spacing={1}>
            <Typography
              color="text.secondary"
              variant="overline"
              lineHeight= "normal"
            >
              {foodType}
            </Typography>
            <Typography variant="h4">
              {weight.toFixed(1)} kg
            </Typography>
          </Stack>
          <Avatar
            sx={{
              backgroundColor: 'brown',
              height: 56,
              width: 56
            }}
          >
            <SvgIcon>
              <CurrencyDollarIcon />
            </SvgIcon>
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
};


export default GrainsAndBreadWidget;