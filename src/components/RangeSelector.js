import React, { useState } from 'react';
import { 
  FormControl, 
  Select, 
  MenuItem, 
  Typography,
  TextField,
  Box,
  useTheme
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  label: {
    marginRight: theme.spacing(2),
    color: theme.palette.text.primary,
  },
  customInput: {
    width: '80px',
    marginLeft: theme.spacing(1),
    '& input': {
      padding: '6px 8px',
      color: theme.palette.text.primary,
    },
  }
}));

function RangeSelector({ range, onRangeChange }) {
  const classes = useStyles();
  const theme = useTheme();
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const handleChange = (event) => {
    const value = event.target.value;
    if (value === 'custom') {
      setIsCustom(true);
      return;
    }
    setIsCustom(false);
    onRangeChange(value);
  };

  const handleCustomInputChange = (event) => {
    const value = event.target.value;
    setCustomValue(value);
    if (value && !isNaN(value) && value > 0) {
      onRangeChange(Number(value));
    }
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" marginBottom="1rem">
      <Typography 
        variant="body1" 
        className={classes.label}
        style={{ color: theme.palette.text.primary }}
      >
        Target Location Range:
      </Typography>
      <FormControl className={classes.formControl}>
        <Select
          value={isCustom ? 'custom' : range}
          onChange={handleChange}
          variant="outlined"
          style={{ color: theme.palette.text.primary }}
        >
          <MenuItem value={5}>5 km</MenuItem>
          <MenuItem value={10}>10 km</MenuItem>
          <MenuItem value={15}>15 km</MenuItem>
          <MenuItem value={20}>20 km</MenuItem>
          <MenuItem value={25}>25 km</MenuItem>
          <MenuItem value="custom">Custom</MenuItem>
        </Select>
      </FormControl>
      {isCustom && (
        <TextField
          className={classes.customInput}
          variant="outlined"
          size="small"
          value={customValue}
          onChange={handleCustomInputChange}
          placeholder="km"
          type="number"
          inputProps={{
            min: 1,
            max: 50,
            step: 1,
            style: { color: theme.palette.text.primary }
          }}
        />
      )}
    </Box>
  );
}

export default RangeSelector; 