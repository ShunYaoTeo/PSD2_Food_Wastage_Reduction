import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://foodwastereduction.com'
});

export const fetchFoodWasteByCategory = async (userEmail) => {
  try {
    const response = await apiClient.get('food-waste-by-category', {
      headers: {
        userEmail: userEmail
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching food waste by category:', error);
    return [];
  }
};

// ... Repeat for all other endpoints
