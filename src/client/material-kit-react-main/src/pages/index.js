import Head from 'next/head';
import { subDays, subHours } from 'date-fns';
import { Box, Container, Unstable_Grid2 as Grid } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import FoodWasteByCategory from 'src/sections/overview/FoodWasteByCategory';
import FoodWasteTrends from 'src/sections/overview/FoodWasteTrends';
import CompareFoodWaste from 'src/sections/overview/CompareFoodWaste';
import TopFoodWasteContributors from 'src/sections/overview/TopFoodWasteContributors';
import WasteReductionProgress from 'src/sections/overview/WasteReductionProgress';
import FruitsAndVegWidget from 'src/sections/overview/FruitsAndVegWidget';
import MeatAndPoultryWidget from 'src/sections/overview/MeatAndPoultryWidget';
import SeafoodWidget from 'src/sections/overview/SeafoodWidget';
import GrainsAndBreadWidget from 'src/sections/overview/GrainsAndBreadWidget';
import DairyProductsWidget from 'src/sections/overview/DairyProductWidget';
import CondimentsAndSaucesWidget from 'src/sections/overview/CondimentsAndSaucesWidget';
import BeveragesWidget from 'src/sections/overview/BeveragesWidget';

const now = new Date();

const Page = () => (
  <>
    <Head>
      <title>
        Dashboard | Food Waste
      </title>
    </Head>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid xs={3} sm={3} lg={3}>
          <BeveragesWidget/>
          </Grid>
          <Grid xs={3} sm={3} lg={3}>
          <DairyProductsWidget/>
          </Grid>
          <Grid xs={3} sm={3} lg={3}>
            <SeafoodWidget/>
          </Grid>
          <Grid xs={3} sm={3} lg={3}>
            <GrainsAndBreadWidget/>
          </Grid>
          <Grid xs={3} sm={3} lg={4}>
            <MeatAndPoultryWidget/>
          </Grid>
          <Grid xs={3} sm={3} lg={4}>
            <CondimentsAndSaucesWidget/>
          </Grid>
          <Grid xs={3} sm={3} lg={4}>
            <FruitsAndVegWidget/>
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          
          <Grid item xs={12} sm={6} md={6} lg={4}>
            <CompareFoodWaste />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={4}>
            <FoodWasteByCategory />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={4}>
            <WasteReductionProgress />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={6}>
            <FoodWasteTrends />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={6}>
            <TopFoodWasteContributors />
          </Grid>
        </Grid>
      </Container>
    </Box>
  </>
);

Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;
