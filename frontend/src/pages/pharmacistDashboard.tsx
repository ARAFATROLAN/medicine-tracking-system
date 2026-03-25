import React from "react";

const PharmacistDashboard: React.FC = () => {

  const name = localStorage.getItem("name");

  return (
    <div style={styles.container}>

      <h1 style={styles.title}>
        💊 Pharmacist Dashboard
      </h1>

      <p style={styles.welcome}>
        Welcome {name}
      </p>

      <div style={styles.cards}>

        <div style={styles.card}>
          <h3>➕ Add Medicine</h3>
          <p>Add new medicine to inventory.</p>
        </div>

        <div style={styles.card}>
          <h3>📦 Medicine Stock</h3>
          <p>View all medicines in stock.</p>
        </div>

        <div style={styles.card}>
          <h3>⏳ Expiry Alerts</h3>
          <p>Check medicines about to expire.</p>
        </div>

      </div>

    </div>
  );
};

export default PharmacistDashboard;

const styles:{[key:string]:React.CSSProperties} = {

container:{
padding:"40px",
fontFamily:"Arial"
},

title:{
color:"#2563eb",
marginBottom:"10px"
},

welcome:{
marginBottom:"30px",
fontSize:"18px"
},

cards:{
display:"flex",
gap:"20px"
},

card:{
flex:1,
padding:"20px",
background:"#d0e7ff",
borderRadius:"10px",
boxShadow:"0 4px 10px rgba(0,0,0,0.2)"
}

};