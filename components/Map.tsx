
import React, { useState, useEffect } from 'react';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { Destination } from '../types';
import { MapPinIcon } from './icons/Icons';

interface MapProps {
  destinations: Destination[];
  hoveredDestination: Destination | null;
  onHoverDestination: (destination: Destination | null) => void;
}

const Map: React.FC<MapProps> = ({ destinations, hoveredDestination, onHoverDestination }) => {
  const apiKey = 
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 
    (process.env as any).VITE_GOOGLE_MAPS_API_KEY || 
    (process.env as any).GOOGLE_MAPS_PLATFORM_KEY || 
    '';
  const [center, setCenter] = useState({ lat: 20, lng: 0 });
  const [zoom, setZoom] = useState(2);

  useEffect(() => {
    if (destinations.length > 0) {
      // Calculate center of all destinations
      const latSum = destinations.reduce((sum, dest) => sum + dest.latitude, 0);
      const lngSum = destinations.reduce((sum, dest) => sum + dest.longitude, 0);
      setCenter({
        lat: latSum / destinations.length,
        lng: lngSum / destinations.length
      });
      setZoom(3);
    } else {
      setCenter({ lat: 20, lng: 0 });
      setZoom(2);
    }
  }, [destinations]);

  if (!apiKey) {
    // Fallback to the static map if no API key is provided
    const getPosition = (lat: number, lng: number) => {
      const top = `${((lat - 90) / -180) * 100}%`;
      const left = `${((lng + 180) / 360) * 100}%`;
      return { top, left };
    };

    return (
      <div className="relative w-full h-96 md:h-[70vh] bg-[#0f172a] rounded-[2rem] overflow-hidden shadow-2xl border border-white/20">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ 
            backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Blue_Marble_2002.png/1280px-Blue_Marble_2002.png')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f172a]/80"></div>
        <div className="absolute top-4 left-4 bg-black/50 p-2 rounded text-xs text-white/50 z-20">
          Static Map (Add API Key for Google Maps)
        </div>
        {destinations.map((dest) => {
          const { top, left } = getPosition(dest.latitude, dest.longitude);
          const isHovered = hoveredDestination?.name === dest.name;

          return (
            <div
              key={dest.name}
              className="absolute"
              style={{ top, left, transition: 'transform 0.3s ease' }}
              onMouseEnter={() => onHoverDestination(dest)}
              onMouseLeave={() => onHoverDestination(null)}
            >
              <div className="relative flex flex-col items-center">
                {isHovered && (
                  <div className="absolute bottom-full mb-2 w-max p-2 bg-brand-secondary text-brand-dark text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(255,193,7,0.4)] z-10">
                    {dest.name}
                  </div>
                )}
                <MapPinIcon
                  className={`w-10 h-10 cursor-pointer transform -translate-x-1/2 -translate-y-full transition-all duration-300 ${isHovered ? 'text-brand-secondary scale-150' : 'text-white'}`}
                  style={{ filter: `drop-shadow(0 4px 6px rgba(0,0,0,0.4))` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 md:h-[70vh] rounded-[2rem] overflow-hidden shadow-2xl border border-white/20">
      <APIProvider apiKey={apiKey}>
        <GoogleMap
          defaultCenter={center}
          defaultZoom={zoom}
          center={center}
          zoom={zoom}
          onCameraChanged={(ev) => {
            setCenter(ev.detail.center);
            setZoom(ev.detail.zoom);
          }}
          mapId="DEMO_MAP_ID"
          options={{
            disableDefaultUI: false,
            clickableIcons: false,
            styles: [
              {
                featureType: "all",
                elementType: "geometry",
                stylers: [{ color: "#242f3e" }]
              },
              {
                featureType: "all",
                elementType: "labels.text.stroke",
                stylers: [{ color: "#242f3e" }]
              },
              {
                featureType: "all",
                elementType: "labels.text.fill",
                stylers: [{ color: "#746855" }]
              },
              {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }]
              },
              {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }]
              },
              {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#263c3f" }]
              },
              {
                featureType: "poi.park",
                elementType: "labels.text.fill",
                stylers: [{ color: "#6b9a76" }]
              },
              {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#38414e" }]
              },
              {
                featureType: "road",
                elementType: "geometry.stroke",
                stylers: [{ color: "#212a37" }]
              },
              {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9ca5b3" }]
              },
              {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#746855" }]
              },
              {
                featureType: "road.highway",
                elementType: "geometry.stroke",
                stylers: [{ color: "#1f2835" }]
              },
              {
                featureType: "road.highway",
                elementType: "labels.text.fill",
                stylers: [{ color: "#f3d19c" }]
              },
              {
                featureType: "transit",
                elementType: "geometry",
                stylers: [{ color: "#2f3948" }]
              },
              {
                featureType: "transit.station",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }]
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#17263c" }]
              },
              {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [{ color: "#515c6d" }]
              },
              {
                featureType: "water",
                elementType: "labels.text.stroke",
                stylers: [{ color: "#17263c" }]
              }
            ]
          }}
        >
          {destinations.map((dest) => (
            <AdvancedMarker
              key={dest.name}
              position={{ lat: dest.latitude, lng: dest.longitude }}
              onClick={() => onHoverDestination(dest)}
              onMouseEnter={() => onHoverDestination(dest)}
              onMouseLeave={() => onHoverDestination(null)}
            >
              <Pin 
                background={'#F27D26'} 
                borderColor={'#ffffff'} 
                glyphColor={'#ffffff'} 
              />
            </AdvancedMarker>
          ))}

          {hoveredDestination && (
            <InfoWindow
              position={{ lat: hoveredDestination.latitude, lng: hoveredDestination.longitude }}
              onCloseClick={() => onHoverDestination(null)}
              headerContent={<span className="font-bold text-black">{hoveredDestination.name}</span>}
            >
              <div className="text-black max-w-xs">
                <p className="mb-2">{hoveredDestination.description}</p>
                <div className="flex flex-wrap gap-1">
                  {hoveredDestination.learningOpportunities.slice(0, 2).map(tag => (
                    <span key={tag} className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </APIProvider>
    </div>
  );
};

export default Map;
