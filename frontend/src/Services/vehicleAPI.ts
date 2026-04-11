import { axiosInstance as api } from './api';

export const vehicleAPI = {
  /**
   * Register a new vehicle
   */
  registerVehicle: async (vehicleData: {
    number_plate: string;
    vehicle_type: string;
    driver_name: string;
    driver_contact?: string;
    hospital_id: number;
    capacity?: number;
  }) => {
    return api.post('/vehicles/register', vehicleData);
  },

  /**
   * Get all vehicles with optional filters
   */
  getVehicles: async (filters?: {
    hospital_id?: number;
    status?: string;
    search?: string;
    per_page?: number;
  }) => {
    return api.get('/vehicles', { params: filters });
  },

  /**
   * Get vehicle by ID
   */
  getVehicle: async (id: number) => {
    return api.get(`/vehicles/${id}`);
  },

  /**
   * Get vehicle by number plate
   */
  getVehicleByNumberPlate: async (numberPlate: string) => {
    return api.get(`/vehicles/number-plate/${numberPlate}`);
  },

  /**
   * Update vehicle details
   */
  updateVehicle: async (
    id: number,
    data: {
      vehicle_type?: string;
      driver_name?: string;
      driver_contact?: string;
      status?: string;
      capacity?: number;
    }
  ) => {
    return api.put(`/vehicles/${id}`, data);
  },

  /**
   * Delete vehicle
   */
  deleteVehicle: async (id: number) => {
    return api.delete(`/vehicles/${id}`);
  },

  /**
   * Update vehicle location (real-time tracking)
   */
  updateVehicleLocation: async (
    id: number,
    locationData: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      speed?: number;
      heading?: number;
      altitude?: number;
      address?: string;
    }
  ) => {
    return api.post(`/vehicles/${id}/location`, locationData);
  },

  /**
   * Get current vehicle location
   */
  getCurrentLocation: async (id: number) => {
    return api.get(`/vehicles/${id}/location/current`);
  },

  /**
   * Get vehicle location history
   */
  getLocationHistory: async (id: number, minutes: number = 60) => {
    return api.get(`/vehicles/${id}/location/history`, { params: { minutes } });
  },

  /**
   * Search vehicles
   */
  searchVehicles: async (query: string) => {
    return api.get('/vehicles/search', { params: { q: query } });
  },

  /**
   * Get vehicles in transit
   */
  getInTransitVehicles: async (perPage: number = 15) => {
    return api.get('/vehicles/in-transit', { params: { per_page: perPage } });
  },
};

export default vehicleAPI;
