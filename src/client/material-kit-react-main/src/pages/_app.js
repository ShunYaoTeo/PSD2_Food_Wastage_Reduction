import Head from 'next/head';
import { CacheProvider } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { AuthConsumer, AuthProvider } from 'src/contexts/auth-context';
import { useNProgress } from 'src/hooks/use-nprogress';
import { createTheme } from 'src/theme';
import { createEmotionCache } from 'src/utils/create-emotion-cache';
import 'simplebar-react/dist/simplebar.min.css';
import UserPointsContext from 'src/contexts/user-point-context';
import { useState,useEffect } from 'react';
import { fetchRewardStatus } from 'src/api/api';

const clientSideEmotionCache = createEmotionCache();

const SplashScreen = () => null;

const App = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const [userPoints, setUserPoints] = useState(0);

 // Fetch available rewards and user rewards history data when the component mounts
  useEffect(() => {
    async function fetchData() {
      const rewardsData = await fetchRewardStatus();
      setUserPoints(rewardsData.user_points)
    }

    fetchData();
  }, []);
  useNProgress();

  const getLayout = Component.getLayout ?? ((page) => page);

  const theme = createTheme();

  return (
    <UserPointsContext.Provider value = {{userPoints, setUserPoints}}>
      <CacheProvider value={emotionCache}>
        <Head>
          <title>
            Food Waste Reduction
          </title>
          <meta
            name="viewport"
            content="initial-scale=1, width=device-width"
          />
        </Head>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <AuthProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <AuthConsumer>
                {
                  (auth) => auth.isLoading
                    ? <SplashScreen />
                    : getLayout(<Component {...pageProps} />)
                }
              </AuthConsumer>
            </ThemeProvider>
          </AuthProvider>
        </LocalizationProvider>
      </CacheProvider>
    </UserPointsContext.Provider>
  );
};

export default App;
