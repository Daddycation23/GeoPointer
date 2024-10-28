import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  scoreAnimation: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '2rem',
    fontWeight: 'bold',
    opacity: 0,
    transition: 'all 1s ease-out',
    color: props => props.points > 0 ? '#4CAF50' : '#f44336',
    animation: '$fadeUpAndOut 1s ease-out forwards',
    zIndex: 1000,
  },
  '@keyframes fadeUpAndOut': {
    '0%': {
      opacity: 0,
      transform: 'translate(-50%, 0)',
    },
    '50%': {
      opacity: 1,
      transform: 'translate(-50%, -50%)',
    },
    '100%': {
      opacity: 0,
      transform: 'translate(-50%, -100%)',
    },
  },
}));

export function ScoreAnimation({ points }) {
  const classes = useStyles({ points });
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className={classes.scoreAnimation}>
      {points > 0 ? `+${points}` : points}
    </div>
  );
}
