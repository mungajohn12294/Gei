// Initialize map
let map;
let currentMarker;
let locationPath = [];
let polyline;
let isTracking = false;
let watchId;
let totalDistance = 0;

// Initialize Leaflet map
function initMap() {
    map = L.map('map').setView([51.505, -0.09], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
    }).addTo(map);
}

// Start tracking location
function startTracking() {
    isTracking = true;
    totalDistance = 0;
    locationPath = [];
    updateStatus('Tracking started.. .');
    
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    
    if (navigator.geolocation) {
        watchId = navigator.geolocation. watchPosition(
            onLocationSuccess,
            onLocationError,
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            }
        );
    } else {
        updateStatus('Geolocation not supported');
    }
}

// Stop tracking location
function stopTracking() {
    isTracking = false;
    navigator.geolocation.clearWatch(watchId);
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    updateStatus('Tracking stopped');
}

// Handle successful location update
function onLocationSuccess(position) {
    const { latitude, longitude, accuracy, altitude, speed } = position.coords;
    const timestamp = new Date().toLocaleTimeString();
    
    // Update UI
    document.getElementById('latitude').textContent = latitude. toFixed(6);
    document.getElementById('longitude').textContent = longitude.toFixed(6);
    document.getElementById('accuracy').textContent = accuracy.toFixed(2) + ' m';
    document.getElementById('altitude').textContent = altitude ?  altitude.toFixed(2) + ' m' : '--';
    document.getElementById('speed').textContent = speed ? (speed * 3.6).toFixed(2) + ' km/h' : '--';
    document.getElementById('timestamp').textContent = timestamp;
    
    // Add to path
    locationPath.push([latitude, longitude]);
    
    // Calculate distance
    if (locationPath.length > 1) {
        const prevPoint = locationPath[locationPath.length - 2];
        const distance = calculateDistance(prevPoint[0], prevPoint[1], latitude, longitude);
        totalDistance += distance;
    }
    
    // Update map
    updateMap(latitude, longitude);
    updateStatus('Tracking active - Location updated');
    
    // Update distance
    document.getElementById('distance').textContent = totalDistance.toFixed(2) + ' km';
}

// Handle location error
function onLocationError(error) {
    let errorMessage = 'Error getting location';
    
    switch(error.code) {
        case error.PERMISSION_DENIED: 
            errorMessage = 'Permission denied.  Please enable location access.';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
        case error.TIMEOUT: 
            errorMessage = 'Location request timed out.';
            break;
    }
    
    updateStatus(errorMessage);
    console.error(errorMessage);
}

// Update map with current location and trail
function updateMap(latitude, longitude) {
    // Add or update marker
    if (currentMarker) {
        currentMarker.setLatLng([latitude, longitude]);
    } else {
        currentMarker = L.marker([latitude, longitude], {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            }),
            title: 'Current Location'
        }).addTo(map);
    }
    
    // Add or update polyline trail
    if (locationPath.length > 1) {
        if (polyline) {
            map.removeLayer(polyline);
        }
        polyline = L.polyline(locationPath, {
            color: '#667eea',
            weight: 3,
            opacity: 0.7,
            smoothFactor: 1
        }).addTo(map);
    }
    
    // Center map on current location
    map. setView([latitude, longitude], map.getZoom());
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Clear the map and reset
function clearMap() {
    if (polyline) {
        map.removeLayer(polyline);
        polyline = null;
    }
    if (currentMarker) {
        map.removeLayer(currentMarker);
        currentMarker = null;
    }
    locationPath = [];
    totalDistance = 0;
    document.getElementById('distance').textContent = '0.00 km';
    updateStatus('Trail cleared');
}

// Update status message
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initMap);
