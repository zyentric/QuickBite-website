import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface LocationData {
  address: string;
  area: string;
  city: string;
  state: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
}

interface LocationContextType {
  location: LocationData | null;
  isLocationFetched: boolean;
  isLoadingLocation: boolean;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  setLocation: (loc: LocationData) => void;
  detectGPSLocation: () => Promise<LocationData | null>;
}

const STORAGE_KEY = 'quickbite_delivery_location';

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [location, setLocationState] = useState<LocationData | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [isLocationFetched, setIsLocationFetched] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem(STORAGE_KEY);
    } catch {
      return false;
    }
  });

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const setLocation = (loc: LocationData) => {
    setLocationState(loc);
    setIsLocationFetched(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    } catch {}
  };

  const detectGPSLocation = async (): Promise<LocationData | null> => {
    if (!navigator.geolocation) return null;
    setIsLoadingLocation(true);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
              { headers: { 'Accept-Language': 'en' } }
            );
            const data = await res.json();
            if (data && data.address) {
              const a = data.address;
              const area = a.suburb || a.neighbourhood || a.road || a.residential || a.subdistrict || 'Current Location';
              const city = a.city || a.town || a.village || a.county || 'Indore';
              const state = a.state || '';
              const postalCode = a.postcode || '';
              const fullAddress = data.display_name || `${area}, ${city}, ${state}`;

              const detected: LocationData = {
                address: fullAddress,
                area,
                city,
                state,
                postalCode,
                lat,
                lng,
              };

              setLocation(detected);
              setIsLoadingLocation(false);
              resolve(detected);
              return;
            }
          } catch (e) {
            console.warn('GPS reverse geocoding fallback error:', e);
          }

          const fallbackLoc: LocationData = {
            address: `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            area: 'Near You',
            city: 'Current Area',
            state: '',
            lat,
            lng,
          };
          setLocation(fallbackLoc);
          setIsLoadingLocation(false);
          resolve(fallbackLoc);
        },
        () => {
          setIsLoadingLocation(false);
          resolve(null);
        },
        { timeout: 9000, enableHighAccuracy: true }
      );
    });
  };

  // Attempt auto-detection on load if not yet saved
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      detectGPSLocation();
    }
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        isLocationFetched,
        isLoadingLocation,
        isLocationModalOpen,
        setIsLocationModalOpen,
        setLocation,
        detectGPSLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};
