import KPIBox from "../../components/KPIBox";

export default function Overview() {
  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 mt-1">
          Hospital Medicine Tracking Summary
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <KPIBox title="Total Medicines" value="1,245" />
        <KPIBox title="Low Stock Alerts" value="12" />
        <KPIBox title="Expired Medicines" value="5" />
        <KPIBox title="Active Prescriptions" value="89" />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">System Status</h2>

        <div className="flex items-center gap-3 text-green-600">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          All systems operational
        </div>
      </div>

    </div>
  );
}