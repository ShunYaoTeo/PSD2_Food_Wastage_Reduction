import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Button,
  Typography,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { fetchRewardStatus, fetchRewardHistory, claimReward } from "src/api/api";
import UserPointsContext from "src/contexts/user-point-context";
import { purple } from "@mui/material/colors";

const Rewards = () => {
  // State for available rewards and user rewards history
  const [availableRewards, setAvailableRewards] = useState([]);
  const [userRewardsHistory, setUserRewardsHistory] = useState([]);
  const { userPoints, setUserPoints } = useContext(UserPointsContext);
  
  // Fetch available rewards and user rewards history data when the component mounts
  useEffect(() => {
    async function fetchData() {
      const rewardsData = await fetchRewardStatus();
      setAvailableRewards(rewardsData.available_rewards);
      setUserPoints(rewardsData.user_points)
      

      const userHistoryData = await fetchRewardHistory();
      setUserRewardsHistory(userHistoryData);
      
    }

    fetchData();
  }, []);

  // Function to handle reward claiming
  const handleClaimReward = async (rewardId) => {
    await claimReward(rewardId);
    const rewardsData = await fetchRewardStatus();
    setUserPoints(rewardsData.user_points)
    const userHistoryData = await fetchRewardHistory();
    setUserRewardsHistory(userHistoryData);
  };

  return (
    <DashboardLayout>
      {/* User Points */}
      <Container maxWidth="lg">
        <Box sx={{ marginTop: "2rem" , color: purple}}>
          <Typography variant="h5">Your Points: {userPoints}</Typography>
        </Box>
      </Container>

      {/* Available Rewards */}
      <Container maxWidth="lg">
        <Box sx={{ marginTop: "2rem" }}>
          <Typography variant="h4">Available Rewards</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reward</TableCell>
                  <TableCell>Points Required</TableCell>
                  <TableCell>Claim</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {availableRewards.map((reward, index) => (
                  <TableRow key={index}>
                    <TableCell>{reward.name}</TableCell>
                    <TableCell>{reward.point_value}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleClaimReward(reward.id)}
                      >
                        Claim
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>

      {/* User Rewards History */}
      <Container maxWidth="lg">
        <Box sx={{ marginTop: "2rem" }}>
          <Typography variant="h4">Your Rewards History</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reward</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Points</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userRewardsHistory.map((reward, index) => (
                  <TableRow key={index}>
                    <TableCell>{reward.description}</TableCell>
                    <TableCell>{reward.action}</TableCell>
                    <TableCell
                     sx={{
                      color: reward.action === 'redeemed' ? 'red' : 'green',
                    }}>
                      {reward.points}
                      </TableCell>
                    <TableCell>
                      {new Date(reward.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default Rewards;
