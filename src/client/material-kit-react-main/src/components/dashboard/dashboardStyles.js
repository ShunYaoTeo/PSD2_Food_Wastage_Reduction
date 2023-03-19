import { makeStyles } from '@mui/styles';

const dashboardStyles = makeStyles((theme) => ({
  // Add your custom styles here
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

export default dashboardStyles;
