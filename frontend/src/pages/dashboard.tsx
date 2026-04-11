// src/pages/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import api from "../Services/api";

interface Stats {
  users: number;
  medicines: number;
  prescriptions: number;
  transfers: number;
}

interface Medicine {
  id: number;
  name: string;
  inventories: { quantity: number; expiry_date: string }[];
}

interface Log {
  id: number;
  action: string;
  created_at: string;
}

interface Transfer {
  id: number;
  medicine: string;
  status: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ users: 0, medicines: 0, prescriptions: 0, transfers: 0 });
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [transfers, _setTransfers] = useState<Transfer[]>([]);
  const [system, setSystem] = useState({ cpu: 0, memory: 0 });

  // 🔥 CORE: REAL-TIME POLLING
  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await api.fetchDashboardStats();
        const medsData = await api.fetchMedicines();
        const logsData = await api.fetchActivityLogs();
        // const transfersData = await api.fetchTransfers(); // if exists

        setStats({
          users: statsData.total_users || 0,
          medicines: statsData.total_medicines || 0,
          prescriptions: statsData.total_prescriptions || 0,
          transfers: statsData.pending_deliveries || 0,
        });
        setMedicines(medsData || []);
        setLogs(logsData || []);
        // setTransfers(transfersData || []);

        // Simulated system metrics (replace with real API later)
        setSystem({
          cpu: Math.floor(Math.random() * 50) + 30,
          memory: Math.floor(Math.random() * 50) + 40,
        });

      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 5000); // 🔥 refresh every 5s

    return () => clearInterval(interval);
  }, []);

  // 🔥 derived alerts
  const lowStock = medicines.filter(m => m.inventories.some(inv => inv.quantity < 50));
  const expiring = medicines.filter(m => m.inventories.some(inv => {
    const days = (new Date(inv.expiry_date).getTime() - Date.now()) / 86400000;
    return days < 7;
  }));

  return (
    <div style={styles.container}>
      <main style={styles.main}>

        {/* HEADER */}
        <div style={styles.header}>
          <h1>Hospital Control Center</h1>
        </div>

        {/* 🔥 SYSTEM OVERVIEW */}
        <div style={styles.grid}>
          <Card title="Users" value={stats.users} />
          <Card title="Medicines" value={stats.medicines} />
          <Card title="Prescriptions" value={stats.prescriptions} />
          <Card title="Transfers" value={stats.transfers} />
        </div>

        {/* 🔥 ALERTS */}
        <div style={styles.section}>
          <h2>⚠ Alerts</h2>
          <p>Low Stock: {lowStock.length}</p>
          <p>Expiring Soon: {expiring.length}</p>
        </div>

        {/* 🔥 TRANSFER APPROVAL */}
        <div style={styles.section}>
          <h2>Transfer Verification</h2>
          {transfers.map(t => (
            <div key={t.id}>
              {t.medicine} — {t.status}
            </div>
          ))}
        </div>

        {/* 🔥 LIVE ACTIVITY LOG */}
        <div style={styles.section}>
          <h2>Live Activity</h2>
          {logs.slice(0, 5).map(log => (
            <div key={log.id}>
              {log.action} — {log.created_at}
            </div>
          ))}
        </div>

        {/* 🔥 SYSTEM HEALTH */}
        <div style={styles.grid}>
          <Card title="CPU Usage" value={`${system.cpu}%`} />
          <Card title="Memory Usage" value={`${system.memory}%`} />
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;

// 🔥 reusable card
const Card = ({ title, value }: { title: string; value: any }) => (
  <div style={styles.card}>
    <h3>{title}</h3>
    <p>{value}</p>
  </div>
);

const styles: any = {
  container: {
    display: "block",
    minHeight: "100vh",
    fontFamily: "Arial"
  },
  main: {
    width: "100%",
    padding: 20,
    background: "#f9fafb"
  },
  header: {
    marginBottom: 20
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
    gap: 15,
    marginBottom: 20
  },
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  },
  section: {
    background: "#fff",
    padding: 20,
    marginBottom: 20,
    borderRadius: 10
  }
};