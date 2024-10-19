import React from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

function Map({ location, hintLocation, userGuess, onMapClick, showTarget, is3DMode }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['maps'],
  });

  const mapRef = React.useRef(null);

  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
    updateMapSettings(map);
  }, [is3DMode]);

  React.useEffect(() => {
    if (mapRef.current) {
      updateMapSettings(mapRef.current);
    }
  }, [is3DMode]);

  const updateMapSettings = (map) => {
    if (is3DMode) {
      map.setTilt(45);
    } else {
      map.setTilt(0);
    }
  };

  return isLoaded ? (
    <GoogleMap
      center={{ lat: location.lat, lng: location.lng }}
      zoom={15}
      mapContainerStyle={{ width: '100%', height: '400px' }}
      onClick={onMapClick}
      onLoad={onMapLoad}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: window.google.maps.ControlPosition.TOP_RIGHT,
        },
      }}
    >
      {hintLocation && (
        <Marker
          position={{ lat: hintLocation.lat, lng: hintLocation.lng }}
          icon={{
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          }}
        />
      )}
      {userGuess && (
        <Marker
          position={{ lat: userGuess.lat, lng: userGuess.lng }}
          icon={{
            url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
          }}
        />
      )}
      {showTarget && (
        <Marker
          position={{ lat: location.lat, lng: location.lng }}
          icon={{
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
          }}
        />
      )}
    </GoogleMap>
  ) : (
    <p>Loading map...</p>
  );
}

export default Map;
