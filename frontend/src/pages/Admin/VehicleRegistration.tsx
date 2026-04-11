import React, { useState, useEffect } from "react";
import { vehicleAPI } from "../../Services/vehicleAPI";
import { axiosInstance as api } from "../../Services/api";
import "./VehicleRegistration.css";

interface Hospital {
  id: number;
  name: string;
}

interface VehicleFormData {
  number_plate: string;
  vehicle_type: string;
  driver_name: string;
  driver_contact: string;
  hospital_id: number;
  capacity: number;
}

interface Vehicle {
  id: number;
  number_plate: string;
  vehicle_type: string;
  driver_name: string;
  status: string;
  capacity: number;
}

const VehicleRegistration: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState<VehicleFormData>({
    number_plate: "",
    vehicle_type: "ambulance",
    driver_name: "",
    driver_contact: "",
    hospital_id: 0,
    capacity: 0,
  });

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"register" | "list">("register");

  // Fetch hospitals on component load
  useEffect(() => {
    fetchHospitals();
    fetchVehicles();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await api.get("/dashboard/hospitals");
      setHospitals(response.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch hospitals:", err);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await vehicleAPI.getVehicles();
      setVehicles(response.data?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacity" || name === "hospital_id" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!formData.number_plate.trim()) {
        throw new Error("Number plate is required");
      }
      if (!formData.driver_name.trim()) {
        throw new Error("Driver name is required");
      }
      if (!formData.hospital_id) {
        throw new Error("Please select a hospital");
      }

      const response = await vehicleAPI.registerVehicle(formData);

      if (response.data?.success) {
        setSuccessMessage("Vehicle registered successfully!");
        setFormData({
          number_plate: "",
          vehicle_type: "ambulance",
          driver_name: "",
          driver_contact: "",
          hospital_id: 0,
          capacity: 0,
        });

        // Refresh vehicle list
        setTimeout(() => {
          fetchVehicles();
          setActiveTab("list");
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "Failed to register vehicle");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await vehicleAPI.deleteVehicle(vehicleId);
        setSuccessMessage("Vehicle deleted successfully");
        fetchVehicles();
      } catch (err) {
        setError("Failed to delete vehicle");
      }
    }
  };

  return (
    <div className="vehicle-registration-container">
      <div className="vehicle-registration-header">
        <h2>Vehicle Management</h2>
        <button className="btn-close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="vehicle-tabs">
        <button
          className={`tab-button ${activeTab === "register" ? "active" : ""}`}
          onClick={() => setActiveTab("register")}
        >
          Register Vehicle
        </button>
        <button
          className={`tab-button ${activeTab === "list" ? "active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          Vehicle List ({vehicles.length})
        </button>
      </div>

      {activeTab === "register" && (
        <form onSubmit={handleSubmit} className="vehicle-form">
          {error && <div className="alert alert-error">{error}</div>}
          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}

          <div className="form-group">
            <label htmlFor="number_plate">Number Plate *</label>
            <input
              type="text"
              id="number_plate"
              name="number_plate"
              value={formData.number_plate}
              onChange={handleInputChange}
              placeholder="e.g., ABC-12345"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vehicle_type">Vehicle Type *</label>
              <select
                id="vehicle_type"
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleInputChange}
              >
                <option value="ambulance">Ambulance</option>
                <option value="truck">Truck</option>
                <option value="van">Van</option>
                <option value="car">Car</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="capacity">Capacity</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="driver_name">Driver Name *</label>
            <input
              type="text"
              id="driver_name"
              name="driver_name"
              value={formData.driver_name}
              onChange={handleInputChange}
              placeholder="Enter driver name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="driver_contact">Driver Contact</label>
            <input
              type="tel"
              id="driver_contact"
              name="driver_contact"
              value={formData.driver_contact}
              onChange={handleInputChange}
              placeholder="e.g., +92-300-1234567"
            />
          </div>

          <div className="form-group">
            <label htmlFor="hospital_id">Hospital *</label>
            <select
              id="hospital_id"
              name="hospital_id"
              value={formData.hospital_id}
              onChange={handleInputChange}
              required
            >
              <option value={0}>Select Hospital</option>
              {hospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Registering..." : "Register Vehicle"}
          </button>
        </form>
      )}

      {activeTab === "list" && (
        <div className="vehicle-list">
          {vehicles.length === 0 ? (
            <p className="no-data">No vehicles registered yet</p>
          ) : (
            <table className="vehicle-table">
              <thead>
                <tr>
                  <th>Number Plate</th>
                  <th>Type</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Capacity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td className="number-plate">{vehicle.number_plate}</td>
                    <td>{vehicle.vehicle_type}</td>
                    <td>{vehicle.driver_name}</td>
                    <td>
                      <span className={`status-badge status-${vehicle.status}`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td>{vehicle.capacity}</td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleRegistration;
