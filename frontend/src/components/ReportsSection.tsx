import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../Services/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ReportsSectionProps {
  userRole: "admin" | "pharmacist" | "doctor" | "patient";
}

const ReportsSection: React.FC<ReportsSectionProps> = ({ userRole }) => {
  console.log("ReportsSection rendering with userRole:", userRole);
  const [showReports, setShowReports] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<"weekly" | "monthly">("weekly");
  const [reportsData, setReportsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (showReports) {
      fetchReportData();
    }
  }, [showReports, reportPeriod]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchReports();
      setReportsData(data);
    } catch (err: any) {
      console.error("Error fetching reports:", err);
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!reportsData) return null;

    if (userRole === "admin") {
      // Admin sees all users' reports
      const labels = reportPeriod === "weekly" 
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : ["Week 1", "Week 2", "Week 3", "Week 4"];
      
      const doctorData = reportsData.doctor?.[reportPeriod === "weekly" ? "weekly" : "monthly"] || [];
      const pharmacistData = reportsData.pharmacist?.[reportPeriod === "weekly" ? "weekly" : "monthly"] || [];
      const patientData = reportsData.patient?.[reportPeriod === "weekly" ? "weekly" : "monthly"] || [];

      return {
        labels,
        datasets: [
          {
            label: "Doctor Activities",
            data: doctorData.map((d: any) => d.count),
            backgroundColor: "rgba(59, 130, 246, 0.6)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 2,
          },
          {
            label: "Pharmacist Activities",
            data: pharmacistData.map((d: any) => d.count),
            backgroundColor: "rgba(34, 197, 94, 0.6)",
            borderColor: "rgba(34, 197, 94, 1)",
            borderWidth: 2,
          },
          {
            label: "Patient Activities",
            data: patientData.map((d: any) => d.count),
            backgroundColor: "rgba(249, 115, 22, 0.6)",
            borderColor: "rgba(249, 115, 22, 1)",
            borderWidth: 2,
          },
        ],
      };
    } else {
      // User sees their own reports
      const labels = reportPeriod === "weekly" 
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : ["Week 1", "Week 2", "Week 3", "Week 4"];
      
      const userData = reportsData[userRole]?.[reportPeriod === "weekly" ? "weekly" : "monthly"] || [];

      return {
        labels,
        datasets: [
          {
            label: `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Activities`,
            data: userData.map((d: any) => d.count),
            backgroundColor: "rgba(139, 92, 246, 0.6)",
            borderColor: "rgba(139, 92, 246, 1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      };
    }
  };

  const chartData = getChartData();
  const roleLabel = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ fontWeight: "bold", margin: 0 }}>
          {userRole === "admin" ? "System Reports" : `${roleLabel} Reports`}
        </h2>
        <button
          style={{
            ...styles.toggleBtn,
            backgroundColor: showReports ? "#6b7280" : "#8b5cf6",
          }}
          onClick={() => setShowReports(!showReports)}
        >
          {showReports ? "Hide Reports" : "View Reports"}
        </button>
      </div>

      {showReports && (
        <div style={styles.content}>
          <div style={styles.controls}>
            <button
              style={{
                ...styles.periodBtn,
                backgroundColor: reportPeriod === "weekly" ? "#8b5cf6" : "#e2e8f0",
                color: reportPeriod === "weekly" ? "white" : "#1e293b",
              }}
              onClick={() => setReportPeriod("weekly")}
            >
              Weekly
            </button>
            <button
              style={{
                ...styles.periodBtn,
                backgroundColor: reportPeriod === "monthly" ? "#8b5cf6" : "#e2e8f0",
                color: reportPeriod === "monthly" ? "white" : "#1e293b",
              }}
              onClick={() => setReportPeriod("monthly")}
            >
              Monthly
            </button>
          </div>

          {loading && (
            <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>
              Loading reports...
            </p>
          )}

          {error && (
            <p style={{ textAlign: "center", color: "#dc2626", padding: "20px" }}>
              {error}
            </p>
          )}

          {chartData && !loading && (
            <div style={styles.chartWrapper}>
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "top" as const },
                    title: {
                      display: true,
                      text: `${reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)} Activity Report`,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: "Number of Activities",
                      },
                    },
                  },
                }}
              />
            </div>
          )}

          {userRole === "admin" && reportsData && (
            <div style={styles.summaryGrid}>
              <div style={styles.summaryCard}>
                <h3>Total Doctor Activities</h3>
                <p style={styles.summaryValue}>
                  {reportsData.doctor?.total || 0}
                </p>
                <span style={styles.trend}>
                  {reportsData.doctor?.trend || "→"}
                </span>
              </div>
              <div style={styles.summaryCard}>
                <h3>Total Pharmacist Activities</h3>
                <p style={styles.summaryValue}>
                  {reportsData.pharmacist?.total || 0}
                </p>
                <span style={styles.trend}>
                  {reportsData.pharmacist?.trend || "→"}
                </span>
              </div>
              <div style={styles.summaryCard}>
                <h3>Total Patient Activities</h3>
                <p style={styles.summaryValue}>
                  {reportsData.patient?.total || 0}
                </p>
                <span style={styles.trend}>
                  {reportsData.patient?.trend || "→"}
                </span>
              </div>
            </div>
          )}

          {userRole !== "admin" && reportsData?.[userRole] && (
            <div style={styles.summaryCard}>
              <h3>Your Total Activities (This Month)</h3>
              <p style={styles.summaryValue}>
                {reportsData[userRole]?.total || 0}
              </p>
              <span style={styles.trend}>
                {reportsData[userRole]?.trend || "→"}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsSection;

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
    marginBottom: "30px",
    color: "#1e293b",
    border: "1px solid #e2e8f0",
    padding: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  toggleBtn: {
    padding: "10px 18px",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "bold",
    transition: "all 0.2s ease",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  controls: {
    display: "flex",
    gap: "10px",
  },
  periodBtn: {
    padding: "8px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
    transition: "all 0.2s ease",
  },
  chartWrapper: {
    background: "#f8fafc",
    borderRadius: "8px",
    padding: "20px",
    border: "1px solid #e2e8f0",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },
  summaryCard: {
    background: "#f0f9ff",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    padding: "15px",
    color: "#0c4a6e",
  },
  summaryValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#0c4a6e",
    margin: "10px 0",
  },
  trend: {
    fontSize: "0.85rem",
    color: "#666",
  },
};
