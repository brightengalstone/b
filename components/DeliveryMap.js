'use client';

import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const pinIcon = L.divIcon({
  className: 'bg-delivery-pin',
  html: '<span></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom || 17, { animate: true });
  }, [center, zoom, map]);
  return null;
}

function ClickHandler({ onChange }) {
  useMapEvents({
    click(event) {
      onChange({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    },
  });
  return null;
}

export default function DeliveryMap({ center, pin, onChange }) {
  const fallback = [-25.7162, 28.3125];
  const mapCenter = center || (pin ? [pin.latitude, pin.longitude] : fallback);
  const markerPosition = pin ? [pin.latitude, pin.longitude] : null;

  return (
    <div className="delivery-map-wrap">
      <MapContainer center={mapCenter} zoom={17} scrollWheelZoom className="delivery-map">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} zoom={17} />
        <ClickHandler onChange={onChange} />
        {markerPosition && (
          <Marker
            position={markerPosition}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend(event) {
                const p = event.target.getLatLng();
                onChange({ latitude: p.lat, longitude: p.lng });
              },
            }}
          />
        )}
      </MapContainer>
      <div className="delivery-map-hint">Tap your delivery point or drag the pin to your home or building.</div>
    </div>
  );
}
