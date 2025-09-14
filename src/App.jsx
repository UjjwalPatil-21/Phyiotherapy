import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Chatbot from './components/Chatbot'; // Import the Chatbot component

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function App() {
  const [physios, setPhysios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from the backend API
    // Note: In a real app, the fetch URL would be an absolute URL
    // or configured via environment variables. For dev, we assume the
    // backend is running on port 5000.
    fetch('http://127.0.0.1:5000/api/physiotherapists')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setPhysios(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    return <div>Loading physiotherapists...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '30%', overflowY: 'auto', padding: '1rem' }}>
        <h1>Physiotherapists in Mumbai</h1>
        <ul>
          {physios.map((physio, index) => (
            <li key={index} style={{ borderBottom: '1px solid #ccc', marginBottom: '1rem', paddingBottom: '1rem' }}>
              <h3>{physio.name}</h3>
              <p>{physio.address}</p>
              <p>Rating: {physio.rating}</p>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ width: '70%' }}>
        <MapContainer center={[19.0760, 72.8777]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {physios.map((physio, index) => (
            <Marker key={index} position={[physio.location.lat, physio.location.lng]}>
              <Popup>
                <b>{physio.name}</b><br />
                {physio.address}<br />
                Rating: {physio.rating}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <Chatbot />
    </div>
  );
}

export default App;
