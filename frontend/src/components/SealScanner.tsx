import React, { useState } from 'react';
import axios from 'axios';
import api from '../Services/api';
import { QrCode, CheckCircle, AlertCircle, Loader, MapPin, Clock, User } from 'lucide-react';

interface SealVerification {
  is_valid: boolean;
  status: 'VERIFIED' | 'FAILED';
  message: string;
  medicine: {
    id: number;
    Name: string;
    Brand: string;
    Expiry_Date: string;
  };
  seal_generated_at: string;
  batch_number: string;
  scanned_at?: string;
  scan_location?: string;
  pending_delivery_id?: number;
}

export default function SealScanner() {
  const [sealCode, setSealCode] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verification, setVerification] = useState<SealVerification | null>(null);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState('');

  const handleVerifySeal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sealCode.trim()) {
      setError('Please enter or scan a seal code');
      return;
    }

    setLoading(true);
    setError('');
    setVerification(null);

    try {
      // Get geolocation if available
      let latitude = undefined;
      let longitude = undefined;

      if ('geolocation' in navigator) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              latitude = position.coords.latitude;
              longitude = position.coords.longitude;
              resolve();
            },
            () => resolve(),
            { timeout: 5000 }
          );
        });
      }

      const response = await axios.post(
        '/api/v1/seals/verify',
        {
          seal_code: sealCode,
          location: location || 'Mobile Scanner',
          latitude,
          longitude,
          device_info: `${navigator.userAgent}`,
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const verificationData = response.data.data;
      setVerification(verificationData);
      setApprovalMessage('');
      if (!response.data.success) {
        setError(response.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify seal');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDelivery = async () => {
    if (!verification?.pending_delivery_id) {
      return;
    }

    setApprovalLoading(true);
    setApprovalMessage('');

    try {
      await api.approveDelivery(verification.pending_delivery_id, sealCode);
      setApprovalMessage('Delivery approved successfully.');
    } catch (err: any) {
      console.error('Delivery approval failed', err);
      setApprovalMessage(err?.response?.data?.message || 'Failed to approve delivery.');
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleGetAuditTrail = async () => {
    if (!sealCode.trim()) return;

    try {
      const response = await axios.get(
        `/api/v1/seals/${sealCode}/audit`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Display audit trail in modal or new view
      alert(JSON.stringify(response.data.data, null, 2));
    } catch (err) {
      setError('Failed to retrieve audit trail');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Medicine Seal Scanner</h1>
        <p className="text-gray-600 mb-8">Scan or enter seal code to verify medicine authenticity</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <QrCode size={28} className="text-purple-600" />
              Scan Seal
            </h2>

            <form onSubmit={handleVerifySeal} className="space-y-4">
              {/* Seal Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seal Code or QR Data *
                </label>
                <input
                  type="text"
                  placeholder="SEAL-XXXXXXXXXXXX-1234567890 or scan QR code"
                  value={sealCode}
                  onChange={(e) => setSealCode(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scan Location (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Pharmacy - Counter 1, Hospital - Ward A"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Alerts */}
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !sealCode.trim()}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 ${
                  loading || !sealCode.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800'
                }`}
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <QrCode size={20} />
                    Verify Seal
                  </>
                )}
              </button>
            </form>

            {/* Inline Help */}
            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>How to scan:</strong> Most mobile devices with a camera can scan the QR code directly. 
                The seal code will be automatically populated.
              </p>
            </div>
          </div>

          {/* Verification Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Verification Result</h2>

            {!verification ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No seal scanned yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Verification Status */}
                <div className={`p-6 rounded-lg border-2 ${
                  verification.is_valid
                    ? 'bg-green-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    {verification.is_valid ? (
                      <>
                        <CheckCircle size={32} className="text-green-600" />
                        <div>
                          <p className="text-xl font-bold text-green-700">Verified</p>
                          <p className="text-sm text-green-600">{verification.message}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={32} className="text-red-600" />
                        <div>
                          <p className="text-xl font-bold text-red-700">Not Verified</p>
                          <p className="text-sm text-red-600">{verification.message}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Medicine Information */}
                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-gray-800">Medicine Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Name</p>
                      <p className="font-semibold">{verification.medicine.Name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Brand</p>
                      <p className="font-semibold">{verification.medicine.Brand}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Expiry Date</p>
                      <p className={`font-semibold ${
                        new Date(verification.medicine.Expiry_Date) < new Date()
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}>
                        {new Date(verification.medicine.Expiry_Date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Batch</p>
                      <p className="font-semibold">{verification.batch_number || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Scan Information */}
                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-gray-800">Scan Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock size={16} className="text-blue-600" />
                      <span><strong>Scanned At:</strong> {verification.scanned_at ? new Date(verification.scanned_at).toLocaleString() : 'Unknown'}</span>
                    </div>
                    {(verification.scan_location || location) && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin size={16} className="text-red-600" />
                        <span><strong>Location:</strong> {verification.scan_location || location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-700">
                      <User size={16} className="text-purple-600" />
                      <span><strong>Generated:</strong> {new Date(verification.seal_generated_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Audit Trail Button */}
                <button
                  onClick={handleGetAuditTrail}
                  className="w-full py-2 px-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold text-sm"
                >
                  View Complete Audit Trail
                </button>

                {verification.pending_delivery_id && verification.is_valid && (
                  <button
                    onClick={handleApproveDelivery}
                    disabled={approvalLoading}
                    className={`w-full py-3 px-4 rounded-lg text-white transition-colors font-semibold text-sm ${approvalLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {approvalLoading ? 'Approving Delivery...' : `Approve Delivery #${verification.pending_delivery_id}`}
                  </button>
                )}

                {approvalMessage && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                    {approvalMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
