import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Map from './Map';
import PlayerProfile from './PlayerProfile';
import './App.css';

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

function App() {
  const [playerLocation, setPlayerLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [playerData, setPlayerData] = useState({
    name: 'Jian Xin',
    points: 0,
    badges: [],
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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setPlayerLocation(userLocation);
        },
        () => setError("Failed to get location."),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  const generateNearbyQuest = async (userLocation) => {
    try {
      const placeTypes = ['restaurant', 'museum', 'park', 'library', 'cafe', 'landmark', 'tourist_attraction'];
      const randomType = placeTypes[Math.floor(Math.random() * placeTypes.length)];

      let newLocation;
      let hasImage = false;

      while (!hasImage) {
        // Generate a random location within 15km of the user's location
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * 15000; // Up to 15km in meters
        const latOffset = distance / 111111 * Math.cos(angle);
        const lngOffset = distance / (111111 * Math.cos(userLocation.lat * Math.PI / 180)) * Math.sin(angle);

        const dummyPlace = {
          place_id: 'dummy_id',
          name: `Mystery Location`,
          geometry: {
            location: {
              lat: userLocation.lat + latOffset,
              lng: userLocation.lng + lngOffset,
            }
          }
        };

        newLocation = {
          id: dummyPlace.place_id,
          name: dummyPlace.name,
          lat: dummyPlace.geometry.location.lat,
          lng: dummyPlace.geometry.location.lng,
          clue: `Can you find this location?`,
        };

        // Check if the location has a Street View image
        hasImage = await checkStreetViewImage(newLocation);
      }

      setCurrentLocation(newLocation);
      getStreetViewImage(newLocation);
      setGuessMode(true);
      setGuessCount(0);
      setShowTarget(false);
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
    generateNearbyQuest(playerLocation);
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
      alert(`Your guess was ${Math.round(distance)} meters away. You earned ${points} points! Quest completed.`);
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
  };

  const handleBackToMenu = () => {
    resetQuest();
  };

  const toggle3DMode = () => {
    setIs3DMode(!is3DMode);
  };

  return (
    <div className="App">
      <h1>GeoQuest</h1>
      <PlayerProfile player={playerData} />
      {error && <p className="error">{error}</p>}
      {!guessMode ? (
        <div className="start-screen">
          <h2>Welcome to GeoQuest!</h2>
          <p>Test your geography skills by guessing locations around the world.</p>
          <button onClick={handleStartQuest}>Start New Quest</button>
        </div>
      ) : (
        currentLocation && (
          <div className="quest-screen">
            <div className="quest-info">
              <h3>Current Quest</h3>
              <p>{currentLocation.clue}</p>
            </div>
            {streetViewImage && <img src={streetViewImage} alt="Street View" className="street-view-image" />}
            <div className="button-container">
              <button onClick={handleShowHint}>Show Hint</button>
              <button onClick={toggle3DMode}>{is3DMode ? "Switch to 2D" : "Switch to 3D"}</button>
            </div>
            <div className="map-container">
              <Map 
                location={currentLocation} 
                hintLocation={hintLocation} 
                userGuess={userGuess}
                onMapClick={handleMapClick}
                showTarget={showTarget}
                is3DMode={is3DMode}
              />
            </div>
            {userGuess && !showTarget && (
              <button onClick={handleGuessSubmit}>Submit Guess</button>
            )}
            {!questCompleted && <p className="guesses-left">Guesses left: {3 - guessCount}</p>}
            {questCompleted && (
              <div className="quest-completed">
                <h3>Quest Completed!</h3>
                <p>Great job! Ready for the next challenge?</p>
                <button onClick={handleNextQuest}>Start Next Quest</button>
              </div>
            )}
            <button onClick={handleBackToMenu} className="back-to-menu">Back to Menu</button>
          </div>
        )
      )}
    </div>
  );
}

export default App;
