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
  Box,
  IconButton,
  useTheme  // Add this import
} from '@material-ui/core';
import { makeStyles, createTheme } from '@material-ui/core/styles';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import Map from './Map';
import PlayerProfile from './PlayerProfile';
import RangeSelector from './components/RangeSelector';
import { StorageService } from './services/StorageService';

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    borderRadius: '15px',
  },
  button: {
    margin: theme.spacing(1),
    borderRadius: '20px', // Added rounded corners
  },
  greenButton: {
    margin: theme.spacing(1),
    backgroundColor: '#4CAF50',
    color: 'white',
    '&:hover': {
      backgroundColor: '#45a049',
    },
    borderRadius: '20px', // Added rounded corners
  },
  streetViewImage: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'cover',
    borderRadius: '15px', // Added rounded corners
    marginBottom: theme.spacing(2),
  },
  mapContainer: {
    height: '500px',
    width: '100%',
    marginBottom: theme.spacing(2),
    borderRadius: '15px', // Added rounded corners
    overflow: 'hidden', // Ensure the map doesn't overflow the rounded container
  },
  nameInput: {
    marginBottom: theme.spacing(2),
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px', // Added rounded corners to input field
    },
  },
  infoBox: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: '15px', // Changed from theme.shape.borderRadius to match other components
    color: theme.palette.text.primary,
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
    backgroundColor: theme.palette.background.paper,
    borderRadius: '15px',
    color: theme.palette.text.primary,
    '& ol, & ul': {
      color: theme.palette.text.primary,
    },
  },
  rulesList: {
    paddingLeft: theme.spacing(3),
  },
  wellDoneGif: {
    width: '100%',
    maxWidth: 300,
    marginBottom: theme.spacing(2),
    borderRadius: '15px', // Added rounded corners
  },
  darkModeToggle: {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
  revealButton: {
    margin: theme.spacing(1),
    border: `1px solid ${theme.palette.secondary.main}`,
    color: theme.palette.secondary.main,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: theme.palette.secondary.main,
      color: 'white',
    },
    borderRadius: '20px',
  },
  backButton: {
    margin: theme.spacing(1),
    backgroundColor: '#your_color_here',
    color: 'white',
    '&:hover': {
      backgroundColor: '#darker_shade_here',
    },
    borderRadius: '20px',
  },
}));

function NameInputForm({ onSubmit }) {
  const classes = useStyles();
  const theme = useTheme();
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <Paper className={classes.paper} style={{ backgroundColor: theme.palette.background.paper }}>
      <Typography variant="h5" gutterBottom style={{ color: theme.palette.text.primary }}>
        Welcome to GeoPointer!
      </Typography>
      <Typography variant="body1" paragraph style={{ color: theme.palette.text.primary }}>
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
  const [darkMode, setDarkMode] = useState(false);
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
  const [questCompleted, setQuestCompleted] = useState(false);
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '');
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [targetRange, setTargetRange] = useState(15); // Default 15km
  const [streak, setStreak] = useState(0);
  const [currentPoints, setCurrentPoints] = useState(null);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          type: darkMode ? 'dark' : 'light',
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
          background: {
            default: darkMode ? '#303030' : '#fafafa',
            paper: darkMode ? '#424242' : '#fff',
          },
          text: {
            primary: darkMode ? '#ffffff' : '#000000',
            secondary: darkMode ? '#ffffff' : '#757575',
          },
        },
        overrides: {
          MuiPaper: {
            root: {
              backgroundColor: darkMode ? '#424242' : '#fff',
              color: darkMode ? '#ffffff' : '#000000',
            },
          },
          MuiTypography: {
            root: {
              color: 'inherit',
            },
          },
          MuiButton: {
            root: {
              color: 'inherit',
            },
          },
        },
      }),
    [darkMode]
  );

  const classes = useStyles();

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
      const placeTypes = [
        'restaurant', 'cafe', 'bar', 'bank', 'hospital', 'pharmacy', 'school', 
        'university', 'park', 'shopping_mall', 'supermarket', 'airport', 
        'train_station', 'bus_station', 'library', 'museum', 'art_gallery', 
        'zoo', 'gym', 'movie_theater', 'tourist_attraction', 'church', 'temple', 
        'mosque', 'synagogue', 'monastery', 'hotel', 'motel', 'hostel', 
        'aquarium', 'night_club', 'fire_station', 'police_station', 
        'post_office', 'town_hall', 'spa'
      ];
      const randomType = placeTypes[Math.floor(Math.random() * placeTypes.length)];

      const distance = Math.random() * (targetRange * 1000); // Convert km to meters
      const angle = Math.random() * 2 * Math.PI;
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
    const distance = Math.random() * 500; // Random distance up to 500 meters

    const latOffset = distance / 111000 * Math.cos(angle);
    const lngOffset = distance / (111000 * Math.cos(currentLocation.lat * Math.PI / 180)) * Math.sin(angle);

    const hintLat = currentLocation.lat + latOffset;
    const hintLng = currentLocation.lng + lngOffset;

    setHintLocation({ lat: hintLat, lng: hintLng });
    console.log("Hint location set:", { lat: hintLat, lng: hintLng }); // Add this line for debugging
  };

  const handleShowHint = () => {
    if (!showHint) {
      generateHintLocation();
    }
    setShowHint(!showHint);
    console.log("Show hint toggled:", !showHint); // Add this line for debugging
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

    if (distance > 300) {
      points = playerData.points > 0 ? -1 : 0;
      setStreak(0);
    } else if (distance <= 300 && distance > 200) {
      points = 1;
      setStreak(prev => prev + 1);
    } else if (distance <= 200 && distance > 100) {
      points = 2;
      setStreak(prev => prev + 1);
    } else {
      points = 3;
      setStreak(prev => prev + 1);
    }

    setCurrentPoints(points);

    setPlayerData(prevData => {
      const newPoints = Math.max(0, prevData.points + points);
      const newData = {
        ...prevData,
        points: newPoints
      };
      StorageService.set('playerPoints', newPoints);
      return newData;
    });

    setGuessCount(prevCount => prevCount + 1);

    if (distance <= 100 || guessCount === 2) {
      setShowTarget(true);
      setQuestCompleted(true);
      if (distance <= 100) {
        alert(`Your guess was ${Math.round(distance)} meters away. You earned ${points} points! Quest completed.`);
      } else {
        alert(`Your guess was ${Math.round(distance)} meters away. ${points !== 0 ? `You earned ${points} points.` : ''} You've used all 3 guesses. The location will now be shown.`);
      }
    } else {
      alert(`Your guess was ${Math.round(distance)} meters away. ${points !== 0 ? `You earned ${points} points!` : ''} You have ${3 - (guessCount + 1)} guesses left.`);
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
  };

  const handleBackToMenu = () => {
    resetQuest();
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

  const renderRules = () => (
    <Paper className={classes.rulesSection} elevation={3} style={{ backgroundColor: theme.palette.background.paper }}>
      <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>
        How to Play
      </Typography>
      <ol className={classes.rulesList} style={{ color: theme.palette.text.primary }}>
        <li>Start a new challenge to get a random location within {targetRange}km of your position.</li>
        <li>Use the image and map to guess the location.</li>
        <li>Use the "Show Hint" button for a hint within 500m of the target.</li>
        <li>Switch between 2D and 3D views for a better perspective.</li>
        <li>You may also use the Pegman to enter street view mode.</li>
        <li>Click on the map to place your guess.</li>
        <li>You have 3 attempts to guess the location.</li>
        <li>Points are awarded based on the accuracy of your guess:</li>
        <ul className={classes.rulesList} style={{ color: theme.palette.text.primary }}>
          <li>Within 100m: 3 points</li>
          <li>100m - 200m: 2 points</li>
          <li>200m - 300m: 1 point</li>
          <li>Over 300m: -1 point</li>
        </ul>
        <li>The route to the location will be shown when the challenge is completed.</li>
      </ol>
    </Paper>
  );

  const renderPinInfo = () => (
    <Paper className={classes.infoBox} elevation={3} style={{ backgroundColor: theme.palette.background.paper }}>
      <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>
        Map Legend
      </Typography >
      <div className={classes.pinInfo}>
        <div className={classes.pinColor} style={{ 
          border: '2px solid red', 
          backgroundColor: 'transparent', 
          width: '18px', 
          height: '18px' 
        }}></div>
        <Typography style={{ color: theme.palette.text.primary }}>Hint area (1km radius)</Typography>
      </div>
      <div className={classes.pinInfo}>
        <div className={classes.pinColor} style={{ backgroundColor: 'green' }}></div>
        <Typography style={{ color: theme.palette.text.primary }}>Your guess</Typography>
      </div>
      <div className={classes.pinInfo}>
        <div className={classes.pinColor} style={{ backgroundColor: 'red' }}></div>
        <Typography style={{ color: theme.palette.text.primary }}>Target location (shown after guessing)</Typography>
      </div>
      <div className={classes.pinInfo}>
        <div className={classes.pinColor} style={{ 
          backgroundColor: 'red', 
          width: '20px', 
          height: '2px' 
        }}></div>
        <Typography style={{ color: theme.palette.text.primary }}>Route to target (shown after guessing)</Typography>
      </div>
    </Paper>
  );

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleRevealLocation = () => {
    if (playerData.points >= 3) {
      setPlayerData(prevData => ({
        ...prevData,
        points: prevData.points - 3
      }));
      setShowTarget(true);
      setQuestCompleted(true);
      StorageService.set('playerPoints', playerData.points - 3);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" className={classes.root}>
        <Button
          className={classes.darkModeToggle}
          onClick={handleToggleDarkMode}
          color="inherit"
          startIcon={darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        >
          {darkMode ? "Light" : "Dark"}
        </Button>
        <Box className={classes.titleContainer}>
          <img src="/GeoPointerLogo.png" alt="GeoPointer Logo" className={classes.logo} />
          <Typography variant="h2" component="h1" className={classes.title}>
            GeoPointer
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
                <Paper className={classes.paper} elevation={3} style={{ backgroundColor: theme.palette.background.paper }}>
                  <Typography variant="h5" gutterBottom style={{ color: theme.palette.text.primary }}>
                    Welcome to GeoPointer, {playerName}!
                  </Typography>
                  <Typography variant="body1" paragraph style={{ color: theme.palette.text.primary }}>
                    Discover places near you by guessing and pointing out their locations. Who knows you might find a new favourite place?
                  </Typography>
                  <RangeSelector 
                    range={targetRange} 
                    onRangeChange={setTargetRange} 
                  />
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleStartQuest}
                    className={classes.button}
                  >
                    Start →
                  </Button>
                </Paper>
                {renderRules()}
              </>
            ) : (
              currentLocation && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Paper className={classes.paper} elevation={3} style={{ backgroundColor: theme.palette.background.paper }}>
                      <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>
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
                        mapCenter={mapCenter}
                        userLocation={userLocation}
                        showHint={showHint}
                      />
                    </div>
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleShowHint}
                      className={classes.button}
                    >
                      {showHint ? "Hide Hint" : "Show Hint"}
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
                    {!showTarget && playerData.points >= 3 && (
                      <Button 
                        variant="contained" 
                        onClick={handleRevealLocation}
                        className={classes.revealButton}
                        style={{ marginLeft: '8px' }}
                      >
                        Reveal Location (-3 points)
                      </Button>
                    )}
                  </Grid>
                  {!questCompleted && (
                    <Grid item xs={12}>
                      <Typography variant="h6" color="secondary">
                        Guesses left: {3 - guessCount}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    {renderPinInfo()}
                  </Grid>
                  {questCompleted && (
                    <Grid item xs={12}>
                      <Paper className={classes.paper} style={{ backgroundColor: theme.palette.background.paper }}>
                        <img 
                          src="/WellDone.gif" 
                          alt="Well Done!" 
                          className={classes.wellDoneGif}
                        />
                        <Typography variant="body1" paragraph style={{ color: theme.palette.text.primary }}>
                          Great job! Ready for the next challenge?
                        </Typography>
                        <Button 
                          variant="contained" 
                          onClick={handleNextQuest}
                          className={classes.greenButton}
                        >
                          Next →
                        </Button>
                      </Paper>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      onClick={handleBackToMenu}
                      className={classes.backButton}
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
