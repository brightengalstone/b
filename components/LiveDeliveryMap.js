'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 15, { animate: true });
  }, [map, position]);
  return null;
}

const driverIcon = L.divIcon({
  className: 'bg-live-driver-icon',
  html: '<div class="bg-live-driver-marker">BG</div>',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

const destinationIcon = L.divIcon({
  className: 'bg-live-destination-icon',
  html: '<div class="bg-live-destination-marker">⌂</div>',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

export default function LiveDeliveryMap({ driverLocation, destination }) {
  const driver = driverLocation ? [Number(driverLocation.latitude), Number(driverLocation.longitude)] : null;
  const home = destination && destination[0] != null && destination[1] != null
    ? [Number(destination[0]), Number(destination[1])]
    : null;
  const center = driver || home || [-25.705, 28.27];
  const route = driver && home ? [driver, home] : [];

  return (
    <div className="bg-live-map">
      <MapContainer center={center} zoom={15} scrollWheelZoom={false} zoomControl={true} className="bg-live-map-container">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        <ZoomControl position="bottomright" />
        <Recenter position={driver || home} />
        {route.length > 1 && <Polyline
          positions={route}
          pathOptions={{
            weight: 6,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
            className: 'bg-live-route',
          }}
        />}
        {driver && (
          <>
            <Circle
              center={driver}
              radius={Math.max(Number(driverLocation.accuracy || 25), 15)}
              pathOptions={{ fillOpacity: 0.1, weight: 1, className: 'bg-live-accuracy-ring' }}
            />
            <Marker position={driver} icon={driverIcon}>
              <Popup><strong>BG driver</strong><br />Live location</Popup>
            </Marker>
          </>
        )}
        {home && (
          <Marker position={home} icon={destinationIcon}>
            <Popup>Your delivery address</Popup>
          </Marker>
        )}
      </MapContainer>
      <div className="bg-live-map-badge"><span></span>{driver ? 'Driver live location' : 'Waiting for driver location'}</div>
      {driverLocation?.accuracy && <div className="bg-live-map-accuracy">GPS accuracy ±{Math.round(Number(driverLocation.accuracy))} m</div>}
    </div>
  );
}
