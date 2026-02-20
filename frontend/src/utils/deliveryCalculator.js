/**
 * Delivery Calculator Utility (Client-side)
 * Calculates delivery dates based on distance between seller and buyer locations
 */

// Indian city coordinates (latitude, longitude)
const cityCoordinates = {
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Delhi': { lat: 28.7041, lng: 77.1025 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'Jaipur': { lat: 26.9124, lng: 75.7873 },
  'Lucknow': { lat: 26.8467, lng: 80.9462 },
  'Chandigarh': { lat: 30.7333, lng: 76.7794 },
  'Indore': { lat: 22.7196, lng: 75.8577 },
  'Surat': { lat: 21.1707, lng: 72.8311 },
  'Gurgaon': { lat: 28.4595, lng: 77.0266 },
  'Noida': { lat: 28.5921, lng: 77.0460 }
};

export function calculateDistanceBetweenCities(city1, city2) {
  const coord1 = cityCoordinates[city1?.trim()];
  const coord2 = cityCoordinates[city2?.trim()];

  if (!coord1 || !coord2) {
    return 1000; // Default distance if city not found
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance);
}

export function calculateDeliveryDays(distanceKm) {
  let minDays = 1;
  let maxDays = 3;

  if (distanceKm <= 50) {
    minDays = 1;
    maxDays = 2;
  } else if (distanceKm <= 200) {
    minDays = 2;
    maxDays = 3;
  } else if (distanceKm <= 500) {
    minDays = 3;
    maxDays = 5;
  } else if (distanceKm <= 1000) {
    minDays = 4;
    maxDays = 7;
  } else {
    minDays = 5;
    maxDays = 10;
  }

  // Add 1 day for processing + 1-2 day variance
  return { minDays: minDays + 1, maxDays: maxDays + 1, distanceKm };
}

export function calculateDeliveryWindow(sellerCity, buyerCity) {
  const distance = calculateDistanceBetweenCities(sellerCity, buyerCity);
  const { minDays, maxDays } = calculateDeliveryDays(distance);

  const today = new Date();
  
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + minDays);

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + maxDays);

  return {
    minDate,
    maxDate,
    minDays,
    maxDays,
    distance,
    minFormatted: minDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }),
    maxFormatted: maxDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  };
}

export function getDeliveryBadge(minDays, maxDays) {
  if (minDays === 1) {
    return { label: '🚀 Next Day Delivery', color: '#FF6B35', icon: '⚡' };
  } else if (maxDays <= 2) {
    return { label: '⚡ Fast Delivery', color: '#4ECDC4', icon: '⭐' };
  } else if (maxDays <= 5) {
    return { label: '✓ Standard Delivery', color: '#95E1D3', icon: '📦' };
  } else {
    return { label: 'Standard Delivery', color: '#D4F1D4', icon: '📦' };
  }
}
