import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CssBaseline, 
  ThemeProvider, 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Grid,
  TextField,
  Box
} from '@material-ui/core';
import { makeStyles, createTheme } from '@material-ui/core/styles';
import Map from './Map';
import PlayerProfile from './PlayerProfile';

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  button: {
    margin: theme.spacing(1),
  },
  greenButton: {
    margin: theme.spacing(1),
    backgroundColor: '#4CAF50', // Standard green color
    color: 'white',
    '&:hover': {
      backgroundColor: '#45a049', // Darker green for hover state
    },
  },
  streetViewImage: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  },
  mapContainer: {
    height: '500px',
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  nameInput: {
    marginBottom: theme.spacing(2),
  },
  infoBox: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: '#f0f4f8',
    borderRadius: theme.shape.borderRadius,
  },
  pinInfo: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  pinColor: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    marginRight: theme.spacing(1),
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: theme.spacing(2),
  },
  title: {
    fontFamily: 'Comic Sans MS, Comic Sans, cursive',
    fontWeight: 500,  // This sets the font weight to the boldest available
    fontSize: '4rem',  // You can adjust this value to make the title larger or smaller
  },
  rulesSection: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: '#f0f4f8',
    borderRadius: theme.shape.borderRadius,
  },
  rulesList: {
    paddingLeft: theme.spacing(3),
  },
}));

function NameInputForm({ onSubmit }) {
  const classes = useStyles();
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <Paper className={classes.paper}>
      <Typography variant="h5" gutterBottom>
        Welcome to GeoQuest!
      </Typography>
      <Typography variant="body1" paragraph>
        Please enter your name to start playing.
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          className={classes.nameInput}
          label="Your Name"
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          className={classes.button}
          disabled={!name.trim()}
        >
          Start Playing
        </Button>
      </form>
    </Paper>
  );
}

function App() {
  const classes = useStyles();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [playerData, setPlayerData] = useState({
    name: localStorage.getItem('playerName') || '',
    points: 0,
  });
  const [guessMode, setGuessMode] = useState(false);
  const [streetViewImage, setStreetViewImage] = useState(null);
  const [error, setError] = useState(null);
  const [hintLocation, setHintLocation] = useState(null);
  const [userGuess, setUserGuess] = useState(null);
  const [guessCount, setGuessCount] = useState(0);
  const [showTarget, setShowTarget] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '');
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);

  useEffect(() => {
    if (playerName) {
      localStorage.setItem('playerName', playerName);
    }
  }, [playerName]);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
          setError("Unable to get your location. Please enable location services.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const generateNearbyQuest = async () => {
    if (!userLocation) {
      setError("User location is not available. Please enable location services and refresh the page.");
      return;
    }

    try {
      const placeTypes = ['restaurant', 'museum', 'park', 'library', 'cafe', 'landmark', 'tourist_attraction'];
      const randomType = placeTypes[Math.floor(Math.random() * placeTypes.length)];

      // Generate a random location within 15km of the user's location
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * 15000; // Up to 15km in meters
      const latOffset = distance / 111111 * Math.cos(angle);
      const lngOffset = distance / (111111 * Math.cos(userLocation.lat * Math.PI / 180)) * Math.sin(angle);

      const newLocation = {
        id: 'dummy_id',
        name: 'Mystery Location',
        lat: userLocation.lat + latOffset,
        lng: userLocation.lng + lngOffset,
        clue: `Can you find this ${randomType}?`,
      };

      // Check if the location has a Street View image
      const hasImage = await checkStreetViewImage(newLocation);
      if (hasImage) {
        setCurrentLocation(newLocation);
        getStreetViewImage(newLocation);
        setGuessMode(true);
        setGuessCount(0);
        setShowTarget(false);
        setIs3DMode(false);
        setHintLocation(null);
        setUserGuess(null);
        setMapCenter(userLocation); // Set the map center to the user's location
      } else {
        // If no image, try again
        generateNearbyQuest();
      }
    } catch (error) {
      console.error('Error generating nearby quest:', error);
      setError('Failed to generate a quest. Please try again.');
    }
  };

  const checkStreetViewImage = async (location) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/streetview/metadata?location=${location.lat},${location.lng}&key=${API_KEY}`
      );
      return response.data.status === 'OK';
    } catch (error) {
      console.error('Error checking Street View image:', error);
      return false;
    }
  };

  const getStreetViewImage = (location) => {
    const imageUrl = `https://maps.googleapis.com/maps/api/streetview?size=400x300&location=${location.lat},${location.lng}&key=${API_KEY}`;
    setStreetViewImage(imageUrl);
  };

  const handleStartQuest = () => {
    generateNearbyQuest();
  };

  const generateHintLocation = () => {
    if (!currentLocation) return;

    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * 500;

    const latOffset = distance / 111000 * Math.cos(angle);
    const lngOffset = distance / (111000 * Math.cos(currentLocation.lat * Math.PI / 180)) * Math.sin(angle);

    const hintLat = currentLocation.lat + latOffset;
    const hintLng = currentLocation.lng + lngOffset;

    setHintLocation({ lat: hintLat, lng: hintLng });
  };

  const handleShowHint = () => {
    generateHintLocation();
  };

  const handleMapClick = (event) => {
    if (guessCount < 3 && !showTarget) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setUserGuess({ lat, lng });
    }
  };

  const handleGuessSubmit = () => {
    if (!userGuess || !currentLocation) return;

    const distance = calculateDistance(userGuess, currentLocation);
    let points = 0;

    if (distance > 300) points = -1;
    else if (distance <= 300 && distance > 200) points = 1;
    else if (distance <= 200 && distance > 100) points = 2;
    else points = 3;

    setPlayerData(prevData => ({
      ...prevData,
      points: prevData.points + points
    }));

    setGuessCount(prevCount => prevCount + 1);

    if (distance <= 100 || guessCount === 2) {
      setShowTarget(true);
      setQuestCompleted(true);
      if (distance <= 100) {
        alert(`Your guess was ${Math.round(distance)} meters away. You earned ${points} points! Quest completed.`);
      } else {
        alert(`Your guess was ${Math.round(distance)} meters away. You earned ${points} points. You've used all 3 guesses. The location will now be shown.`);
      }
    } else {
      alert(`Your guess was ${Math.round(distance)} meters away. You earned ${points} points! You have ${3 - (guessCount + 1)} guesses left.`);
      setUserGuess(null);
    }
  };

  const calculateDistance = (point1, point2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const handleNextQuest = () => {
    resetQuest();
    handleStartQuest();
  };

  const resetQuest = () => {
    setGuessMode(false);
    setUserGuess(null);
    setCurrentLocation(null);
    setHintLocation(null);
    setStreetViewImage(null);
    setGuessCount(0);
    setShowTarget(false);
    setQuestCompleted(false);
    setIs3DMode(false); // Ensure 2D mode when resetting the quest
  };

  const handleBackToMenu = () => {
    resetQuest();
  };

  const toggle3DMode = () => {
    setIs3DMode(!is3DMode);
  };

  const handleNameSubmit = (name) => {
    setPlayerName(name);
    setPlayerData(prevData => ({ ...prevData, name }));
  };

  const handleProfileUpdate = (updatedProfile) => {
    setPlayerData(prevData => ({
      ...prevData,
      ...updatedProfile
    }));
    localStorage.setItem('playerName', updatedProfile.name);
    localStorage.setItem('playerAvatar', updatedProfile.avatar);
  };

  const renderPinInfo = () => (
    <Paper className={classes.infoBox}>
      <Typography variant="h6" gutterBottom>
        Pin Colors
      </Typography>
      <div className={classes.pinInfo}>
        <div className={classes.pinColor} style={{ backgroundColor: 'blue' }}></div>
        <Typography>Hint location</Typography>
      </div>
      <div className={classes.pinInfo}>
        <div className={classes.pinColor} style={{ backgroundColor: 'green' }}></div>
        <Typography>Your guess</Typography>
      </div>
      <div className={classes.pinInfo}>
        <div className={classes.pinColor} style={{ backgroundColor: 'red' }}></div>
        <Typography>Target location (shown after guessing)</Typography>
      </div>
    </Paper>
  );

  const renderRules = () => (
    <Paper className={classes.rulesSection}>
      <Typography variant="h6" gutterBottom>
        How to Play
      </Typography>
      <ol className={classes.rulesList}>
        <li>Start a new quest to get a random location within 15km of your position.</li>
        <li>Use the street view image and map to guess the location.</li>
        <li>Click on the map to place your guess.</li>
        <li>You have 3 attempts to guess the location.</li>
        <li>Use the "Show Hint" button for a hint within 500m of the target.</li>
        <li>Switch between 2D and 3D views for a better perspective.</li>
        <li>Points are awarded based on the accuracy of your guess:</li>
        <ul>
          <li>Within 100m: 3 points</li>
          <li>100m - 200m: 2 points</li>
          <li>200m - 300m: 1 point</li>
          <li>Over 300m: -1 point</li>
        </ul>
      </ol>
    </Paper>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" className={classes.root}>
        <Box className={classes.titleContainer}>
          <img src="/GeoQuestLogo.png" alt="GeoQuest Logo" className={classes.logo} />
          <Typography variant="h2" component="h1" className={classes.title}>
            GeoQuest
          </Typography>
        </Box>
        {!playerName ? (
          <NameInputForm onSubmit={handleNameSubmit} />
        ) : (
          <>
            <PlayerProfile player={playerData} onUpdateProfile={handleProfileUpdate} />
            {error && (
              <Typography color="error">{error}</Typography>
            )}
            {!guessMode ? (
              <>
                <Paper className={classes.paper}>
                  <Typography variant="h5" gutterBottom>
                    Welcome to GeoQuest, {playerName}!
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Discover places near you by guessing their locations. Who knows you might find a new favourite place?
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleStartQuest}
                    className={classes.button}
                  >
                    Start New Quest
                  </Button>
                </Paper>
                {renderRules()}
              </>
            ) : (
              currentLocation && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Paper className={classes.paper}>
                      <Typography variant="h6" gutterBottom>
                        Current Quest
                      </Typography>
                      <Typography variant="body1">
                        Can you find this location?
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    {streetViewImage && (
                      <img 
                        src={streetViewImage} 
                        alt="Street View" 
                        className={classes.streetViewImage} 
                      />
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <div className={classes.mapContainer}>
                      <Map 
                        location={currentLocation} 
                        hintLocation={hintLocation} 
                        userGuess={userGuess}
                        onMapClick={handleMapClick}
                        showTarget={showTarget}
                        is3DMode={is3DMode}
                        mapCenter={mapCenter} // Pass the mapCenter to the Map component
                      />
                    </div>
                  </Grid>
                  <Grid item xs={12}>
                    {renderPinInfo()}
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleShowHint}
                      className={classes.button}
                    >
                      Show Hint
                    </Button>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={toggle3DMode}
                      className={classes.button}
                    >
                      {is3DMode ? "Switch to 2D" : "Switch to 3D"}
                    </Button>
                    {userGuess && !showTarget && (
                      <Button 
                        variant="contained" 
                        onClick={handleGuessSubmit}
                        className={classes.greenButton}
                      >
                        Submit Guess
                      </Button>
                    )}
                  </Grid>
                  {!questCompleted && (
                    <Grid item xs={12}>
                      <Typography variant="h6" color="error">
                        Guesses left: {3 - guessCount}
                      </Typography>
                    </Grid>
                  )}
                  {questCompleted && (
                    <Grid item xs={12}>
                      <Paper className={classes.paper}>
                        <Typography variant="h6" gutterBottom>
                          Quest Completed!
                        </Typography>
                        <Typography variant="body1" paragraph>
                          Great job! Ready for the next challenge?
                        </Typography>
                        <Button 
                          variant="contained" 
                          onClick={handleNextQuest}
                          className={classes.greenButton}
                        >
                          Start Next Quest
                        </Button>
                      </Paper>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      onClick={handleBackToMenu}
                      className={classes.button}
                    >
                      Back to Menu
                    </Button>
                  </Grid>
                </Grid>
              )
            )}
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
