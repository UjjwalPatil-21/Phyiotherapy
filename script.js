document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([19.0760, 72.8777], 11); // Default to Mumbai
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const findBtn = document.getElementById('find-btn');
    const physioList = document.getElementById('physio-list');
    const nameFilter = document.getElementById('name-filter');
    const ratingFilter = document.getElementById('rating-filter');
    const specialtyFilter = document.getElementById('specialty-filter');
    let userMarker;
    const markerStore = {}; // To store markers by ID
    let userLat, userLng;

    // --- Dynamic Specialty Filter Population ---
    function populateSpecialtyFilter() {
        const specialties = new Set();
        physiotherapists.forEach(p => {
            p.specialties.forEach(s => specialties.add(s));
        });

        const sortedSpecialties = [...specialties].sort();

        sortedSpecialties.forEach(s => {
            const option = document.createElement('option');
            option.value = s;
            option.textContent = s;
            specialtyFilter.appendChild(option);
        });
    }
    populateSpecialtyFilter();
    // -----------------------------------------

    findBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    });

    nameFilter.addEventListener('input', renderPhysios);
    ratingFilter.addEventListener('change', renderPhysios);
    specialtyFilter.addEventListener('change', renderPhysios);

    function showPosition(position) {
        userLat = position.coords.latitude;
        userLng = position.coords.longitude;

        map.setView([userLat, userLng], 13);

        if (userMarker) {
            map.removeLayer(userMarker);
        }
        userMarker = L.marker([userLat, userLng]).addTo(map)
            .bindPopup('Your Location')
            .openPopup();

        // Calculate distances once
        physiotherapists.forEach((physio, index) => {
            physio.distance = haversineDistance(userLat, userLng, physio.location.lat, physio.location.lng);
            physio.id = `physio-${index}`;
        });

        renderPhysios();
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

    function renderPhysios() {
        const nameFilterValue = nameFilter.value.toLowerCase();
        const ratingFilterValue = parseFloat(ratingFilter.value);
        const specialtyFilterValue = specialtyFilter.value;

        // Filter physiotherapists
        const filteredPhysios = physiotherapists.filter(physio => {
            const nameMatch = physio.name.toLowerCase().includes(nameFilterValue);
            const ratingMatch = physio.rating >= ratingFilterValue;
            const specialtyMatch = specialtyFilterValue === 'all' || physio.specialties.includes(specialtyFilterValue);
            return nameMatch && ratingMatch && specialtyMatch;
        });

        // Sort the filtered list by distance
        const sortedPhysios = filteredPhysios.sort((a, b) => a.distance - b.distance);

        physioList.innerHTML = ''; // Clear existing list

        // Clear existing markers from the map and the store
        Object.values(markerStore).forEach(marker => map.removeLayer(marker));
        for (const key in markerStore) {
            delete markerStore[key];
        }

        if (sortedPhysios.length === 0) {
            physioList.innerHTML = '<li>No matching physiotherapists found.</li>';
            return;
        }

        sortedPhysios.forEach(physio => {
            // Add to list
            const li = document.createElement('li');
            li.id = physio.id;
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${physio.location.lat},${physio.location.lng}`;
            li.innerHTML = `
                <h3>${physio.name}</h3>
                ${physio.hospital ? `<div class="hospital-info">🏥 ${physio.hospital}</div>` : ''}
                <p class="address">${physio.address}</p>
                <div class="specialties">
                    ${physio.specialties.map(spec => `<span class="specialty-tag">${spec}</span>`).join('')}
                </div>
                <p>Contact: ${physio.contact}</p>
                <p>Rating: ${physio.rating} / 5</p>
                <p>Distance: ${physio.distance.toFixed(2)} km</p>
                <div class="links">
                    <a href="${directionsUrl}" target="_blank" class="btn-link">Get Directions</a>
                    <a href="tel:${physio.contact}" class="btn-link call-btn">Call Now</a>
                </div>
            `;
            physioList.appendChild(li);

            // Add marker to map and store it
            const marker = L.marker([physio.location.lat, physio.location.lng]).addTo(map)
                .bindPopup(`<b>${physio.name}</b><br>${physio.address}`);

            markerStore[physio.id] = marker;

            // --- Interactivity ---
            li.addEventListener('mouseover', () => marker.openPopup());
            li.addEventListener('mouseout', () => marker.closePopup());

            marker.on('click', () => {
                document.querySelectorAll('#physio-list li').forEach(item => item.classList.remove('highlight'));
                li.classList.add('highlight');
                li.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => li.classList.remove('highlight'), 2000);
            });
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
