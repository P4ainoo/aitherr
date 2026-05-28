import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { SafetyAdvisory } from '../types';

interface SafetyMapProps {
  advisories: SafetyAdvisory[];
  hoveredAdvisory: SafetyAdvisory | null;
  onHoverAdvisory: (advisory: SafetyAdvisory | null) => void;
}

const SafetyMap: React.FC<SafetyMapProps> = ({ advisories, hoveredAdvisory, onHoverAdvisory }) => {
  const apiKey = 
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 
    (process.env as any).VITE_GOOGLE_MAPS_API_KEY || 
    (process.env as any).GOOGLE_MAPS_PLATFORM_KEY || 
    '';
  const [center, setCenter] = useState({ lat: 20, lng: 0 });
  const [zoom, setZoom] = useState(2);

  useEffect(() => {
    if (advisories.length > 0) {
      // Calculate center of all advisories
      const latSum = advisories.reduce((sum, adv) => sum + adv.latitude, 0);
      const lngSum = advisories.reduce((sum, adv) => sum + adv.longitude, 0);
      setCenter({
        lat: latSum / advisories.length,
        lng: lngSum / advisories.length
      });
      setZoom(10); // Zoom in closer when we have specific advisories
    } else {
      setCenter({ lat: 20, lng: 0 });
      setZoom(2);
    }
  }, [advisories]);

  if (!apiKey) {
    return (
      <div className="relative w-full h-96 md:h-[70vh] bg-[#0f172a] rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 flex items-center justify-center text-center p-8">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Google Maps API Key Required</h3>
          <p className="text-white/60">Please add your VITE_GOOGLE_MAPS_API_KEY to the .env file to view the interactive map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 md:h-[70vh] rounded-[2rem] overflow-hidden shadow-2xl border border-white/20">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          center={center}
          zoom={zoom}
          onCameraChanged={(ev) => {
            setCenter(ev.detail.center);
            setZoom(ev.detail.zoom);
          }}
          mapId="DEMO_MAP_ID" // Required for AdvancedMarker
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
          {advisories.map((advisory) => (
            <AdvancedMarker
              key={advisory.locationName}
              position={{ lat: advisory.latitude, lng: advisory.longitude }}
              onClick={() => onHoverAdvisory(advisory)}
              onMouseEnter={() => onHoverAdvisory(advisory)}
              onMouseLeave={() => onHoverAdvisory(null)}
            >
              <Pin 
                background={
                  advisory.severity === 'high' ? '#EF4444' : 
                  advisory.severity === 'medium' ? '#F97316' : 
                  '#EAB308'
                } 
                borderColor={'#ffffff'} 
                glyphColor={'#ffffff'} 
              />
            </AdvancedMarker>
          ))}

          {hoveredAdvisory && (
            <InfoWindow
              position={{ lat: hoveredAdvisory.latitude, lng: hoveredAdvisory.longitude }}
              onCloseClick={() => onHoverAdvisory(null)}
              headerContent={<span className="font-bold text-black">{hoveredAdvisory.locationName}</span>}
            >
              <div className="text-black max-w-xs">
                <p className="mb-2">{hoveredAdvisory.reason}</p>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider text-white ${
                    hoveredAdvisory.severity === 'high' ? 'bg-red-500' :
                    hoveredAdvisory.severity === 'medium' ? 'bg-orange-500' :
                    'bg-yellow-500'
                  }`}>
                    {hoveredAdvisory.severity} Risk
                  </span>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
};

export default SafetyMap;
