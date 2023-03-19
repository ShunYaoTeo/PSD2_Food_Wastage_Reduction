import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://foodwastereduction.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchFoodWasteByCategory = async () => {
  const token = localStorage.getItem('jwt')
  try {
    const response = await apiClient.get('food-waste-by-category', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching food waste by category:', error);
    return [];
  }
};


export const fetchFoodWasteTrends = async (start_date, end_date) => {
  const token = localStorage.getItem('jwt')
  try {
    const response = await apiClient.get(`food-waste-trends?start_date=${start_date}&end_date=${end_date} `, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching food waste trends', error);
    return [];
  }
};

export const fetchCompareFoodWaste = async (start_date, end_date) => {
  const token = localStorage.getItem('jwt')
  try {
    const response = await apiClient.get(`compare-food-waste?start_date=${start_date}&end_date=${end_date} `, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching food waste trends', error);
    return [];
  }
};

export const fetchTopFoodWasteContributors = async () => {
  const token = localStorage.getItem('jwt')
  try {
    const response = await apiClient.get('top-food-waste-contributors', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching food waste by category:', error);
    return [];
  }
};

export const fetchWasteReductionProgress = async (old_start_date, old_end_date, new_start_date, new_end_date) => {
  const token = localStorage.getItem('jwt')
  try {
    const response = await apiClient.get(`waste-reduction-progress?old_start_date=${old_start_date}&old_end_date=${old_end_date}&new_start_date=${new_start_date}&new_end_date=${new_end_date}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching food waste trends', error);
    return [];
  }
};

export const fetchPointsEarnedOverTime = async (start_date, end_date, aggregation) => {
  const token = localStorage.getItem('jwt')
  try {
    const response = await apiClient.get(`points-earned-over-time?start_date=${start_date}&end_date=${end_date}&aggregation=${aggregation}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching food waste trends', error);
    return [];
  }
};

export const fetchRewardStatus = async () => {
  const token = localStorage.getItem('jwt')
  try {
    const response = await apiClient.get('rewards-status', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching food waste by category:', error);
    return [];
  }
};

export const fetchFoodWasteData = async (foodType, reason, donated) => {
  const token = localStorage.getItem('jwt')
  try{
    const response = await apiClient.post('foodwaste', {
      food_type: foodType,
      reason: reason,
      donated: donated,
      }, {
        headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  } catch (error){
    console.error('Error Sending Request', error);
    return [];
  }
}