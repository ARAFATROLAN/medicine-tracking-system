import { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';

interface PrintableSealData {
  seal_code: string;
  qr_code_url: string;
  medicine_name: string;
  medicine_brand: string;
  medicine_generic_name: string;
  strength: string;
  dosage_form: string;
  expiry_date: string;
  batch_number: string;
  generated_at: string;
  location: string;
  verification_url: string;
  print_instructions: string;
}

export default function SealPrinter() {
  const [sealData, setSealData] = useState<PrintableSealData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get seal code from URL query params
    const params = new URLSearchParams(window.location.search);
    const sealCode = params.get('code');

    if (!sealCode) {
      setError('No seal code provided');
      setLoading(false);
      return;
    }

    fetchSealData(sealCode);
  }, []);

  const fetchSealData = async (sealCode: string) => {
    try {
      const response = await axios.get(`/api/v1/seals/${sealCode}/print`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setSealData(response.data.data);
      }
    } catch (err) {
      setError('Failed to load seal data for printing');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8 text-center">Loading seal...</div>;
  }

  if (error || !sealData) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 text-red-700 bg-red-50 p-4 rounded-lg border border-red-200">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Screen View Toolbar */}
      <div className="print:hidden bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Print Medicine Seal</h1>
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
        >
          Print / Save as PDF
        </button>
      </div>

      {/* Printable Content */}
      <div className="p-8">
        {/* Main Seal Label */}
        <div className="max-w-2xl mx-auto border-4 border-black p-8 bg-white mb-8">
          {/* Header */}
          <div className="text-center mb-6 border-b-2 border-black pb-4">
            <h1 className="text-3xl font-bold">MEDICINE AUTHENTICITY SEAL</h1>
            <p className="text-sm mt-2">Cryptographically Verified</p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Left Column - QR Code */}
            <div className="flex flex-col items-center justify-center border-r-2 border-black pr-8">
              <p className="text-sm font-semibold mb-3">SCAN FOR VERIFICATION</p>
              <img
                src={sealData.qr_code_url}
                alt="QR Code"
                className="w-48 h-48 border-2 border-black"
              />
              <p className="text-xs mt-3 text-center font-mono text-gray-700 max-w-48">
                {sealData.verification_url}
              </p>
            </div>

            {/* Right Column - Medicine Info */}
            <div className="flex flex-col justify-center pl-8">
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Medicine Name</p>
                  <p className="text-xl font-bold">{sealData.medicine_name}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Brand</p>
                  <p className="text-lg font-semibold">{sealData.medicine_brand}</p>
                </div>

                {sealData.medicine_generic_name && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Generic Name</p>
                    <p className="text-sm">{sealData.medicine_generic_name}</p>
                  </div>
                )}

                {sealData.strength && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Strength</p>
                    <p className="text-sm">{sealData.strength}</p>
                  </div>
                )}

                {sealData.dosage_form && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Form</p>
                    <p className="text-sm">{sealData.dosage_form}</p>
                  </div>
                )}

                <div className="border-t-2 border-black pt-3 mt-3">
                  <p className="text-xs font-semibold text-gray-600 uppercase">Expiry Date</p>
                  <p className="text-lg font-bold text-red-700">
                    {new Date(sealData.expiry_date).toLocaleDateString()}
                  </p>
                </div>

                {sealData.batch_number && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Batch Number</p>
                    <p className="text-sm font-mono">{sealData.batch_number}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seal Code and Generator Info */}
          <div className="border-t-2 border-black pt-4 space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Seal Code</p>
              <p className="text-sm font-mono font-bold break-all">{sealData.seal_code}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-semibold text-gray-600 uppercase">Generated At</p>
                <p className="font-mono">{sealData.generated_at}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-600 uppercase">Location</p>
                <p className="font-mono">{sealData.location}</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="border-t-2 border-black mt-6 pt-4">
            <p className="text-xs text-center text-gray-600">
              {sealData.print_instructions}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 print:text-gray-600">
          <p>This seal is cryptographically verifiable and contains tamper-detection mechanisms.</p>
          <p>For verification, visit: {sealData.verification_url}</p>
          <p className="mt-2 text-gray-400">Generated: {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none;
          }
          .print\\:bg-white {
            background-color: white;
          }
        }
      `}</style>
    </div>
  );
}
