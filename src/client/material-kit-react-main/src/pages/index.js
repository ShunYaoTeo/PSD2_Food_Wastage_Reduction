import Head from 'next/head';
import { subDays, subHours } from 'date-fns';
import { Box, Container, Unstable_Grid2 as Grid } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import FoodWasteByCategory from 'src/sections/overview/FoodWasteByCategory';
import FoodWasteTrends from 'src/sections/overview/FoodWasteTrends';
import CompareFoodWaste from 'src/sections/overview/CompareFoodWaste';
import TopFoodWasteContributors from 'src/sections/overview/TopFoodWasteContributors';
import WasteReductionProgress from 'src/sections/overview/WasteReductionProgress';

const now = new Date();

const Page = () => (
  <>
    <Head>
      <title>
        Overview | Devias Kit
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
          <Grid item xs={12} sm={6} md={6} lg={4}>
            <WasteReductionProgress />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={4}>
            <CompareFoodWaste />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={4}>
            <FoodWasteByCategory />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={8}>
            <FoodWasteTrends />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={8}>
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
