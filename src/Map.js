import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, Marker, useJsApiLoader, Polyline } from '@react-google-maps/api';

function Map({ location, hintLocation, userGuess, onMapClick, showTarget, mapCenter, userLocation }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['maps'],
  });

  const mapRef = useRef(null);
  const [mapType, setMapType] = useState('hybrid');
  const [route, setRoute] = useState(null);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const handleMapTypeChange = () => {
    if (mapRef.current) {
      setMapType(mapRef.current.getMapTypeId());
    }
  };

  useEffect(() => {
    if (showTarget && userLocation && location) {
      const fetchOptimizedRoute = async () => {
        try {
          const response = await fetch(`https://routes.googleapis.com/directions/v2:computeRoutes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
              'X-Goog-FieldMask': 'routes.optimizedIntermediateWaypointIndex,routes.polyline.encodedPolyline'
            },
            body: JSON.stringify({
              origin: {
                location: {
                  latLng: {
                    latitude: userLocation.lat,
                    longitude: userLocation.lng
                  }
                }
              },
              destination: {
                location: {
                  latLng: {
                    latitude: location.lat,
                    longitude: location.lng
                  }
                }
              },
              travelMode: "DRIVE",
              optimizeWaypointOrder: true
            })
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const result = await response.json();
          if (result.routes && result.routes[0] && result.routes[0].polyline) {
            setRoute(result.routes[0].polyline.encodedPolyline);
          }
        } catch (error) {
          console.error('Error fetching optimized route:', error);
        }
      };

      fetchOptimizedRoute();
    }
  }, [showTarget, userLocation, location]);

  const decodePath = (encoded) => {
    const poly = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      poly.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }
    return poly;
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
        streetViewControl: true,
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
      {route && (
        <Polyline
          path={decodePath(route)}
          options={{
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
          }}
        />
      )}
    </GoogleMap>
  ) : (
    <p>Loading map...</p>
  );
}

export default Map;
