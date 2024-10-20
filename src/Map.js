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
      map.setHeading(0);
      map.setMapTypeId('satellite');
    } else {
      map.setTilt(0);
      map.setHeading(0);
      map.setMapTypeId('roadmap');
    }
  };

  return isLoaded ? (
    <GoogleMap
      center={{ lat: location.lat, lng: location.lng }}
      zoom={15}
      mapContainerStyle={{ width: '100%', height: '100%' }}
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
        tilt: is3DMode ? 45 : 0,
        mapTypeId: is3DMode ? 'satellite' : 'roadmap',
      }}
    >
      {/* Markers */}
    </GoogleMap>
  ) : (
    <p>Loading map...</p>
  );
}

export default Map;
