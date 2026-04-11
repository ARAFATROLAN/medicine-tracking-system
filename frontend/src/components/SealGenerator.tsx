import React, { useState } from 'react';
import axios from 'axios';
import { Download, Printer, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface SealData {
  id: number;
  code: string;
  medicine_id: number;
  batch_number: string;
  generated_at: string;
  is_valid: boolean;
}

interface Medicine {
  id: number;
  Name: string;
  Brand: string;
  Expiry_Date: string;
}

export default function SealGenerator() {
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [batchNumber, setBatchNumber] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedSeals, setGeneratedSeals] = useState<SealData[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medicinesLoading, setMedicinesLoading] = useState(false);

  // Fetch medicines on component mount
  React.useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setMedicinesLoading(true);
      const response = await axios.get('/api/v1/medicines', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setMedicines(response.data.data || []);
    } catch (err) {
      setError('Failed to load medicines');
    } finally {
      setMedicinesLoading(false);
    }
  };

  const handleGenerateSeals = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMedicine) {
      setError('Please select a medicine');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        '/api/v1/seals/generate',
        {
          medicine_id: selectedMedicine.id,
          quantity,
          batch_number: batchNumber || undefined,
          location_generated: location || undefined
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setGeneratedSeals(response.data.data.seals);
        setSuccess(`Successfully generated ${quantity} seal(s) for ${selectedMedicine.Name}`);
        // Reset form
        setQuantity(1);
        setBatchNumber('');
        setLocation('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate seals');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintSeal = async (sealCode: string) => {
    try {
      const response = await axios.get(`/api/v1/seals/${sealCode}/print`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        // Open print preview in new window
        window.open(
          `/print-seal?code=${sealCode}`,
          'print_seal',
          'width=800,height=600'
        );
      }
    } catch (err) {
      setError('Failed to prepare seal for printing');
    }
  };

  const handleDownloadQR = async (sealCode: string) => {
    try {
      const response = await axios.get(`/api/v1/seals/${sealCode}/qr-code`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        // Download QR code
        const link = document.createElement('a');
        link.href = response.data.data.qr_code_url;
        link.download = `seal-${sealCode}-qr.png`;
        link.click();
      }
    } catch (err) {
      setError('Failed to download QR code');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Medicine Seal Generator</h1>
        <p className="text-gray-600 mb-8">Generate cryptographically verifiable seals for medicines</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Generate New Seal</h2>

              <form onSubmit={handleGenerateSeals} className="space-y-4">
                {/* Medicine Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Medicine *
                  </label>
                  <select
                    value={selectedMedicine?.id || ''}
                    onChange={(e) => {
                      const medicine = medicines.find(m => m.id === parseInt(e.target.value));
                      setSelectedMedicine(medicine || null);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={medicinesLoading}
                  >
                    <option value="">Loading medicines...</option>
                    {medicines.map((med) => (
                      <option key={med.id} value={med.id}>
                        {med.Name} - {med.Brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Medicine Info */}
                {selectedMedicine && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Expiry Date:</strong> {new Date(selectedMedicine.Expiry_Date).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity (1-1000)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Batch Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., BATCH-2026-04-001"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Generated (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Main Pharmacy, Branch A"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Alerts */}
                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    <CheckCircle size={20} />
                    <span>{success}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !selectedMedicine}
                  className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition-colors ${
                    loading || !selectedMedicine
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader size={20} className="animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    'Generate Seal'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Generated Seals Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Generated Seals ({generatedSeals.length})
              </h2>

              {generatedSeals.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No seals generated yet. Create seals using the form on the left.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {generatedSeals.map((seal) => (
                    <div
                      key={seal.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-600">Seal Code</p>
                          <p className="font-mono text-sm font-semibold">{seal.code}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Batch Number</p>
                          <p className="text-sm font-semibold">{seal.batch_number || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Status</p>
                          <p className={`text-sm font-semibold ${
                            seal.is_valid ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {seal.is_valid ? '✓ Valid' : '✗ Invalid'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePrintSeal(seal.code)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                        >
                          <Printer size={16} />
                          Print
                        </button>
                        <button
                          onClick={() => handleDownloadQR(seal.code)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                        >
                          <Download size={16} />
                          QR Code
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
