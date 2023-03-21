import React, { useState, useEffect } from 'react';
import { Card, CardContent, Avatar, Stack, SvgIcon, Typography} from '@mui/material';
import { fetchIndividualFoodTypeWaste } from 'src/api/api';
import AcademicCapIcon from '@heroicons/react/24/solid/AcademicCapIcon';


const FruitsAndVegWidget = () => {
  const [weight, setWeight] = useState(0)
  const foodType = 'Fruits and Vegetables'

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchIndividualFoodTypeWaste()
      for(let i = 0; i < data.length; i++){
        if(data[i].food_type === 'Fruits and Vegetables'){
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
              {weight} kg
            </Typography>
          </Stack>
          <Avatar
            sx={{
              backgroundColor: 'success.light',
              height: 56,
              width: 56
            }}
          >
            <SvgIcon>
              <AcademicCapIcon />
            </SvgIcon>
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
};


export default FruitsAndVegWidget;