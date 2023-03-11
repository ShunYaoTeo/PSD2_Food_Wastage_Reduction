import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [foodWasteData, setFoodWasteData] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFoodWasteData = async () => {
      try {
        const response = await axios.get('http://foodwastereduction.com/foodwaste', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`
          }
        });
        setFoodWasteData(response.data);
      } catch (error) {
        setErrorMessage(error.response.data.message);
      }
    };

    fetchFoodWasteData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/login');
  };

  return (
    <div className="container">
      <h1>Food Waste Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      <div className="row">
        <div className="col-md-4">
          <h2>Total Food Waste</h2>
          <p>{foodWasteData.total_food_waste || 0} kg</p>
        </div>
        <div className="col-md-4">
          <h2>Food Waste per Category</h2>
          <ul>
            {foodWasteData.categories &&
              foodWasteData.categories.map((category) => (
                <li key={category.category_name}>
                  {category.category_name}: {category.category_weight} kg
                </li>
              ))}
          </ul>
        </div>
        <div className="col-md-4">
          <h2>Food Waste per Month</h2>
          <ul>
            {foodWasteData.monthly_data &&
              foodWasteData.monthly_data.map((monthData) => (
                <li key={monthData.month_name}>
                  {monthData.month_name}: {monthData.monthly_weight} kg
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
