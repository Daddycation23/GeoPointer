import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, Marker, useJsApiLoader, Polyline, InfoWindow } from '@react-google-maps/api';

function Map({ location, hintLocation, userGuess, onMapClick, showTarget, mapCenter, userLocation }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['maps'],
  });

  const mapRef = useRef(null);
  const [mapType, setMapType] = useState('hybrid');
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

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
      const fetchRouteInfo = async () => {
        try {
          const response = await fetch(`https://routes.googleapis.com/directions/v2:computeRoutes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
              'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
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
              routingPreference: "TRAFFIC_AWARE",
              computeAlternativeRoutes: false,
              routeModifiers: {
                avoidTolls: false,
                avoidHighways: false,
                avoidFerries: false
              },
              languageCode: "en-US",
              units: "METRIC"
            })
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const result = await response.json();
          if (result.routes && result.routes[0]) {
            setRoute(result.routes[0].polyline.encodedPolyline);
            setRouteInfo({
              distance: (result.routes[0].distanceMeters / 1000).toFixed(2), // Convert meters to kilometers
              duration: Math.round(result.routes[0].duration.split('s')[0] / 60) // Convert seconds to minutes
            });
          }
        } catch (error) {
          console.error('Error fetching route info:', error);
        }
      };

      fetchRouteInfo();
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
      center={mapCenter || (userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : { lat: 0, lng: 0 })}
      zoom={mapCenter || userLocation ? 11 : 2}
      mapContainerStyle={{ 
        width: '100%', 
        height: '100%',
        borderRadius: '15px',
      }}
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
      {showTarget && location && (
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
      {routeInfo && (
        <InfoWindow
          position={{ lat: location.lat + 0.00025, lng: location.lng }}
          onCloseClick={() => setRouteInfo(null)}
        >
          <div>
            <h3>Route Information</h3>
            <p>Distance: {routeInfo.distance} km</p>
            <p>Estimated travel time: {routeInfo.duration} minutes (driving)</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ) : (
    <p>Loading map...</p>
  );
}

export default Map;
