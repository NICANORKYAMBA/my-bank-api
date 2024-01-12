import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { fetchAccounts } from '../api/api';
import { Link } from 'react-router-dom';
import {
  CircularProgress,
  Typography,
  Container,
  Paper,
  makeStyles,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Box,
  Snackbar,
  Button,
  Grid,
  Dialog,
  DialogContent
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import Skeleton from '@material-ui/lab/Skeleton';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import AddIcon from '@material-ui/icons/Add';
import CreateAccountForm from '../components/CreateAccountForm';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(-6),
    marginBottom: theme.spacing(4),
    marginLeft: theme.spacing(10),
    marginRight: 'auto',
    maxWidth: `calc(100% - ${theme.spacing(10)}px)`
  },
  paper: {
    padding: theme.spacing(3),
    margin: 'auto',
    maxWidth: 600,
    backgroundColor: theme.palette.white
  },
  listItem: {
    margin: theme.spacing(1),
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    }
  },
  list: {
    width: '100%'
  },
  errorText: {
    color: theme.palette.error.main
  },
  progressContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '80vh'
  },
  listItemAvatar: {
    color: theme.palette.primary.main
  },
  listItemText: {
    marginLeft: theme.spacing(2)
  },
  loadingBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh'
  },
  errorBox: {
    textAlign: 'center',
    marginTop: theme.spacing(4)
  },
  primaryText: {
    color: theme.palette.primary.main,
    fontSize: '1.2em'
  },
  secondaryText: {
    color: theme.palette.text.secondary,
    fontSize: '1.1em'
  },
  noAccountsContainer: {
    textAlign: 'center',
    padding: theme.spacing(4)
  },
  noAccountsFullContainer: {
    height: '80vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  noAccountsHeader: {
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main
  },
  noAccountsMessage: {
    marginBottom: theme.spacing(3)
  },
  createAccountButton: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1),
    fontSize: '1rem',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark
    }
  }
}));

const handleError = (err) => {
  let errorMessage = '';
  switch (err.response?.status) {
    case 404:
      errorMessage = 'User not found';
      break;
    case 500:
      errorMessage = 'Server error';
      break;
    default:
      errorMessage = err.message;
  }
  return errorMessage;
};

const AccountOverview = () => {
  const classes = useStyles();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [openCreateAccountDialog, setOpenCreateAccountDialog] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const handleOpenCreateAccountDialog = () => {
    setOpenCreateAccountDialog(true);
  };

  const handleCloseCreateAccountDialog = () => {
    setOpenCreateAccountDialog(false);
  };

  const userId = useMemo(() => sessionStorage.getItem('userId'), []);

  useEffect(() => {
    fetchAccounts(userId)
      .then(response => {
        setAccounts(response);
        setHasFetched(true);
        setLoading(false);
      })
      .catch(err => {
        const errorMessage = handleError(err);
        setError(errorMessage);
        setOpen(true);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <Box className={classes.loadingBox}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container className={classes.container}>
        <Box className={classes.errorBox}>
          <Typography variant='h6' color='error'>
            Error: {error}
          </Typography>
        </Box>
      </Container>
    );
  }

  const fetchAndUpdateAccounts = () => {
    fetchAccounts(userId)
      .then(response => {
        setAccounts(response);
      })
      .catch(err => {
        const errorMessage = handleError(err);
        setError(errorMessage);
        setOpen(true);
      });
  };

  if (hasFetched && accounts.length === 0) {
    return (
      <Container className={classes.container}>
        <Grid
          container
          direction='column'
          justifyContent='center'
          alignItems='center'
          className={classes.noAccountsFullContainer}
        >
          <Grid item>
            <Paper className={classes.paper}>
              <Box className={classes.noAccountsContainer}>
                <Typography variant='h4' gutterBottom className={classes.noAccountsHeader}>
                  Welcome to FinTrust!
                </Typography>
                <Typography variant='h6' className={classes.noAccountsMessage}>
                  You currently have no accounts.
                </Typography>
                <Button
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreateAccountDialog}
                  className={classes.createAccountButton}
                >
                  Create Your First Account
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        <Dialog open={openCreateAccountDialog} onClose={handleCloseCreateAccountDialog}>
          <DialogContent>
            <CreateAccountForm onAccountCreated={() => {
              handleCloseCreateAccountDialog();
              fetchAndUpdateAccounts();
            }}
            />
          </DialogContent>
        </Dialog>
      </Container>
    );
  }

  return (
    <>
      {loading
        ? (
          <Box className={classes.loadingBox}>
            <Skeleton variant='rectangular' width={210} height={118} />
          </Box>
          )
        : null}

      {error && (
        <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)}>
          <Alert onClose={() => setOpen(false)} severity='error'>
            {error}
          </Alert>
        </Snackbar>
      )}
      <Container className={classes.container}>
        <Paper className={classes.paper}>
          <Typography variant='h4' gutterBottom>
            Accounts Overview
          </Typography>
          <List className={classes.list}>
            {accounts.map((account) => (
              <ListItem
                button
                key={account.id}
                component={Link}
                to={`/account-overview/${account.id}`}
                className={classes.listItem}
              >
                <ListItemAvatar>
                  <Avatar className={classes.listItemAvatar}>
                    <AccountCircleIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<span className={classes.primaryText}>{`Account ${account.id}: ${account.name}`}</span>}
                  secondary={<span className={classes.secondaryText}>{`Balance: ${account.balance}`}</span>}
                  className={classes.listItemText}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Container>
    </>
  );
};

AccountOverview.propTypes = {
  userId: PropTypes.string.isRequired
};

export default AccountOverview;
