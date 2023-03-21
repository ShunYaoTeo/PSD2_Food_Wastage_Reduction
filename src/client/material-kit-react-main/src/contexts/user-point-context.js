import { createContext } from 'react';

const UserPointsContext = createContext({
  userPoints: 0,
  setUserPoints: () => {},
});


export default UserPointsContext;
