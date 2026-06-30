import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Props {
  onNext: (lat: number, lng: number) => void;
  onBack: () => void;
}

const LocationPicker: React.FC<Props> = ({ onNext, onBack }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setLoading(false);
        },
        (err) => {
          console.error(err);
          // Fallback to center of city (e.g. Bangalore)
          setPosition([12.9716, 77.5946]);
          setLoading(false);
        }
      );
    } else {
      setPosition([12.9716, 77.5946]);
      setLoading(false);
    }
  }, []);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });

    return position === null ? null : (
      <Marker position={position} />
    );
  };

  return (
    <div className="flex flex-col h-[70vh] space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Pin Location</h2>
        <p className="text-gray-500">Tap on the map to adjust the exact location of the issue.</p>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 relative z-0">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center bg-gray-50">
            <MapPin className="h-8 w-8 text-primary animate-bounce" />
          </div>
        ) : (
          <MapContainer center={position as [number, number]} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; Google Maps'
              url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            />
            <LocationMarker />
          </MapContainer>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <button 
          onClick={onBack}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
        >
          Back
        </button>
        <button 
          onClick={() => position && onNext(position[0], position[1])}
          disabled={!position}
          className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
};

export default LocationPicker;
