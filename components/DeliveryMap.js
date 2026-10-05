'use client';

import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { LocateFixed, MapPin, Move } from 'lucide-react';

const pinIcon = L.divIcon({
  className: 'bg-delivery-pin',
  html: '<span></span>',
  iconSize: [34, 42],
  iconAnchor: [17, 42],
  popupAnchor: [0, -42],
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

function LocateControl({ onLocate }) {
  return (
    <button
      type="button"
      className="delivery-map-locate"
      onClick={onLocate}
      aria-label="Use my current location"
      title="Use my current location"
    >
      <LocateFixed size={18} />
    </button>
  );
}

export default function DeliveryMap({ center, pin, onChange }) {
  const fallback = [-25.7162, 28.3125];
  const mapCenter = center || (pin ? [pin.latitude, pin.longitude] : fallback);
  const markerPosition = pin ? [pin.latitude, pin.longitude] : null;
  const [locating, setLocating] = useState(false);

  function locateMe() {
    if (!navigator.geolocation) return;
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }

  return (
    <div
      className="delivery-map-wrap"
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 22,
        border: '1px solid #e4e7ec',
        background: '#eef2f4',
        boxShadow: '0 12px 30px rgba(16,24,40,.08)',
      }}
    >
      <MapContainer
        center={mapCenter}
        zoom={17}
        scrollWheelZoom
        zoomControl={false}
        className="delivery-map"
        style={{ height: 360, width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={20}
        />

        <MapController center={center} zoom={17} />
        <ClickHandler onChange={onChange} />
        <ZoomControl position="bottomright" />

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

      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          right: 14,
          zIndex: 500,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 10,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '10px 13px',
            borderRadius: 14,
            background: 'rgba(255,255,255,.94)',
            boxShadow: '0 5px 18px rgba(16,24,40,.12)',
            color: '#101828',
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          <MapPin size={17} />
          Set your delivery point
        </div>

        <LocateControl onLocate={locateMe} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 14,
          transform: 'translateX(-50%)',
          zIndex: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '9px 12px',
          borderRadius: 12,
          background: 'rgba(16,24,40,.88)',
          color: '#fff',
          boxShadow: '0 6px 18px rgba(16,24,40,.16)',
          fontSize: 12,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        <Move size={14} />
        {locating ? 'Finding your location...' : 'Tap the map or drag the pin'}
      </div>
    </div>
  );
}
