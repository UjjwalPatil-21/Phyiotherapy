document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([37.7749, -122.4194], 13); // Default to San Francisco
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const findBtn = document.getElementById('find-btn');
    const physioList = document.getElementById('physio-list');
    let userMarker;

    findBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    });

    function showPosition(position) {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        map.setView([userLat, userLng], 13);

        if (userMarker) {
            map.removeLayer(userMarker);
        }
        userMarker = L.marker([userLat, userLng]).addTo(map)
            .bindPopup('Your Location')
            .openPopup();

        displayNearbyPhysios(userLat, userLng);
    }

    function showError(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                alert("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                alert("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                alert("The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                alert("An unknown error occurred.");
                break;
        }
    }

    function displayNearbyPhysios(userLat, userLng) {
        physioList.innerHTML = ''; // Clear existing list

        // Clear existing markers
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker && layer !== userMarker) {
                map.removeLayer(layer);
            }
        });

        const nearbyPhysios = physiotherapists.filter(physio => {
            const distance = haversineDistance(userLat, userLng, physio.location.lat, physio.location.lng);
            physio.distance = distance;
            return distance <= 5;
        });

        nearbyPhysios.sort((a, b) => a.distance - b.distance);

        if (nearbyPhysios.length === 0) {
            physioList.innerHTML = '<li>No physiotherapists found within a 5km radius.</li>';
            return;
        }

        nearbyPhysios.forEach(physio => {
            // Add to list
            const li = document.createElement('li');
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${physio.location.lat},${physio.location.lng}`;
            li.innerHTML = `
                <h3>${physio.name}</h3>
                <p>${physio.address}</p>
                <p>Contact: ${physio.contact}</p>
                <p>Rating: ${physio.rating} / 5</p>
                <p>Distance: ${physio.distance.toFixed(2)} km</p>
                <a href="${directionsUrl}" target="_blank">Get Directions</a>
            `;
            physioList.appendChild(li);

            // Add marker to map
            L.marker([physio.location.lat, physio.location.lng]).addTo(map)
                .bindPopup(`<b>${physio.name}</b><br>${physio.address}`);
        });
    }

    function haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    }
});
