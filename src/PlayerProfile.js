import React, { useState } from 'react';
import { Typography, Paper, Button, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    borderRadius: '15px',
  },
  info: {
    flexGrow: 1,
  },
  buttonContainer: {
    display: 'flex',
    gap: theme.spacing(2),
  },
  editButton: {
    marginLeft: theme.spacing(2),
    borderRadius: '20px',
  },
  signOutButton: {
    marginLeft: theme.spacing(2),
    borderRadius: '20px',
    backgroundColor: theme.palette.error.main,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  nameInput: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
    },
  },
  saveButton: {
    borderRadius: '20px',
  },
}));

function PlayerProfile({ player, onUpdateProfile }) {
  const classes = useStyles();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(player.name);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile({ name: editName });
    setIsEditing(false);
  };

  const handleSignOut = () => {
    // Clear player data from localStorage
    localStorage.removeItem('playerName');
    localStorage.removeItem('playerPoints');
    // Reload the page to return to the name input screen
    window.location.reload();
  };

  return (
    <Paper className={classes.paper}>
      {!isEditing ? (
        <>
          <div className={classes.info}>
            <Typography variant="h6">{player.name}</Typography>
            <Typography variant="body1">Points: {player.points}</Typography>
          </div>
          <div className={classes.buttonContainer}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setIsEditing(true)}
              className={classes.editButton}
            >
              Edit Name
            </Button>
            <Button
              variant="contained"
              onClick={handleSignOut}
              className={classes.signOutButton}
            >
              Sign Out
            </Button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className={classes.form}>
          <TextField
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            fullWidth
            className={classes.nameInput}
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            className={classes.saveButton}
          >
            Save Changes
          </Button>
        </form>
      )}
    </Paper>
  );
}

export default PlayerProfile;
