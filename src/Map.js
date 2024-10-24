import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

function Map({ location, hintLocation, userGuess, onMapClick, showTarget, mapCenter, userLocation }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['maps'],
  });

  const mapRef = useRef(null);
  const [mapType, setMapType] = useState('hybrid');

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const handleMapTypeChange = () => {
    if (mapRef.current) {
      setMapType(mapRef.current.getMapTypeId());
    }
  };

  return isLoaded ? (
    <GoogleMap
      center={mapCenter || { lat: 0, lng: 0 }}
      zoom={mapCenter ? 11 : 2}
      mapContainerStyle={{ width: '100%', height: '100%' }}
      onClick={onMapClick}
      onLoad={onMapLoad}
      onMapTypeIdChanged={handleMapTypeChange}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
        streetViewControl: true, // Enable Street View control
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: window.google.maps.ControlPosition.TOP_RIGHT,
        },
        mapTypeId: mapType,
      }}
    >
      {userLocation && (
        <Marker
          position={{ lat: userLocation.lat, lng: userLocation.lng }}
          icon={{
            url: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
          }}
        />
      )}
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
