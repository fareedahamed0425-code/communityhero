import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getIssues, type IssueData } from '../services/issueService';
import { MapPin, AlertTriangle, Crosshair } from 'lucide-react';

// Fix Leaflet's default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for live user location (glowing blue dot)
const userIcon = new L.DivIcon({
  className: 'user-location-marker',
  html: '<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.4);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Component to dynamically change map center smoothly
const RecenterMap = ({ lat, lng }: { lat: number, lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), { duration: 1.5 });
  }, [lat, lng, map]);
  return null;
};

const MapExplorer = () => {
  const [issues, setIssues] = useState<(IssueData & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState<[number, number]>([12.9716, 77.5946]); // Default: Bangalore
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const data = await getIssues();
        // Filter out issues that don't have valid coordinates
        const mappableIssues = data.filter((i: any) => i.latitude !== null && i.longitude !== null);
        setIssues(mappableIssues);

        // Center map on the latest issue if there are any, else try to get user's location
        if (mappableIssues.length > 0) {
          setCenter([mappableIssues[0].latitude!, mappableIssues[0].longitude!]);
        } else if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
            (err) => console.log("Geolocation error:", err)
          );
        }
      } catch (e) {
        console.error("Failed to load map data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();

    // Live tracking of user location
    let watchId: number;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.log("Geolocation watch error:", err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const handleLocateMe = () => {
    if (userLocation) {
      setCenter(userLocation);
    } else if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(loc);
          setCenter(loc);
        }
      );
    }
  };

  return (
    <div className="w-full h-[calc(100vh-64px)] flex flex-col relative animate-fade-in-up">
      {/* Header Overlay */}
      <div className="absolute top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl z-[1000]">
        <div className="bg-surface-container-lowest/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-surface-container flex items-center justify-between">
          <div>
            <h1 className="text-xl font-headline font-bold text-on-surface">Community Map</h1>
            <p className="text-xs font-body text-on-surface-variant">Showing {issues.length} active reports</p>
          </div>
          <button 
            onClick={handleLocateMe}
            className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-on-primary transition-colors shadow-sm"
            title="Locate Me"
          >
            <Crosshair className="h-5 w-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-surface-container-lowest">
          <MapPin className="h-12 w-12 text-primary animate-bounce mb-4" />
          <p className="text-on-surface-variant font-label font-medium animate-pulse">Loading map data...</p>
        </div>
      ) : (
        <div className="flex-1 z-0 relative">
          <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap lat={center[0]} lng={center[1]} />
            
            {userLocation && (
              <Marker position={userLocation} icon={userIcon}>
                <Popup className="custom-popup">
                  <div className="font-headline font-bold text-sm text-primary">You are here</div>
                </Popup>
              </Marker>
            )}
            
            {issues.map((issue) => (
              <Marker key={issue.id} position={[issue.latitude!, issue.longitude!]}>
                <Popup className="custom-popup">
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      {issue.severity === 'Critical' && <AlertTriangle className="h-4 w-4 text-error" />}
                      <span className="font-headline font-bold text-sm text-gray-900">{issue.title || issue.issue_type}</span>
                    </div>
                    {issue.image_url && (
                      <img src={issue.image_url} alt="Issue" className="w-full h-24 object-cover rounded-lg mb-1" />
                    )}
                    <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold rounded-md w-fit uppercase tracking-wider ${
                      issue.status === 'Resolved' ? 'bg-secondary/10 text-secondary' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {issue.status || 'Reported'}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default MapExplorer;
