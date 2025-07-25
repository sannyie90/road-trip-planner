let map, directionsService, directionsRenderer;

// Local tip suggestions by city (partial list for demo; full list should be imported or loaded externally)
const localTips = {
    "Anchorage": "Explore the Alaska Wildlife Conservation Center, hike Flattop Mountain, or visit the Anchorage Museum.",
    "Chicago": "Check out Millennium Park and deep dish pizza, stroll Navy Pier, or see the Art Institute.",
    "Denver": "Walk downtown 16th Street Mall, tour the Denver Art Museum, or hike Red Rocks.",
    "Los Angeles": "Stroll Venice Beach, hike to the Hollywood Sign, or visit the Getty Center.",
    "New York": "Try pizza at Joe's or walk the High Line.",
    // Add rest from full_localTips.js for complete coverage
};

function getTipsFor(city) {
    const cityName = city.split(",")[0].trim().toLowerCase();
    const match = Object.keys(localTips).find(key => key.toLowerCase() === cityName);
    return match ? localTips[match] : "No tips available for this stop.";
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 39.5, lng: -98.35 },
        zoom: 4
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
}

function planTrip() {
    const stopsText = document.getElementById("stops").value;
    const stops = stopsText.split('\n').filter(stop => stop.trim() !== '');

    if (stops.length < 2) {
        alert("Please enter at least two stops.");
        return;
    }

    const waypoints = stops.slice(1, -1).map(stop => ({
        location: stop,
        stopover: true
    }));

    const request = {
        origin: stops[0],
        destination: stops[stops.length - 1],
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            showTripSummary(result, stops);
        } else {
            alert("Could not plan route: " + status);
        }
    });
}

function showTripSummary(result, stops) {
    let totalDistance = 0;
    let totalDuration = 0;

    const route = result.routes[0];
    route.legs.forEach(leg => {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;
    });

    const miles = (totalDistance / 1609.34).toFixed(2);
    const hours = (totalDuration / 3600).toFixed(1);
    const tollEstimate = (miles * 0.05).toFixed(2); // Mock calculation

    let summaryHTML = `
        Total Distance: ${miles} miles<br>
        Estimated Time: ${hours} hours<br>
        Estimated Toll Cost: $${tollEstimate}
    `;

    summaryHTML += "<br><strong>Local Tips:</strong><ul>";
    stops.forEach(stop => {
        const tip = getTipsFor(stop);
        summaryHTML += `<li><strong>${stop}:</strong> ${tip}</li>`;
    });
    summaryHTML += "</ul>";

    document.getElementById("trip-info").innerHTML = summaryHTML;
}

function saveTrip() {
    const stops = document.getElementById("stops").value;
    const tripState = document.getElementById("trip-state").value;
    localStorage.setItem("savedTrip", JSON.stringify({ stops, tripState }));
    alert("Trip saved!");
}

function loadTrip() {
    const saved = JSON.parse(localStorage.getItem("savedTrip"));
    if (saved) {
        document.getElementById("stops").value = saved.stops;
        document.getElementById("trip-state").value = saved.tripState || "Draft";
        alert("Trip loaded!");
    } else {
        alert("No saved trip found.");
    }
}
