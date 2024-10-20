import React, { useState } from 'react';
import { Typography, Paper, Button, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
  },
  info: {
    flexGrow: 1,
  },
  editButton: {
    marginLeft: theme.spacing(2),
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
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

  return (
    <Paper className={classes.paper}>
      {!isEditing ? (
        <>
          <div className={classes.info}>
            <Typography variant="h6">{player.name}</Typography>
            <Typography variant="body1">Points: {player.points}</Typography>
          </div>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setIsEditing(true)}
            className={classes.editButton}
          >
            Edit Name
          </Button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className={classes.form}>
          <TextField
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            fullWidth
          />
          <Button type="submit" variant="contained" color="primary">
            Save Changes
          </Button>
        </form>
      )}
    </Paper>
  );
}

export default PlayerProfile;
