import React from "react";

const DoctorDashboard: React.FC = () => {

  const name = localStorage.getItem("name");

  return (
    <div style={styles.container}>

      <h1 style={styles.title}>
        👨‍⚕️ Doctor Dashboard
      </h1>

      <p style={styles.welcome}>
        Welcome Dr. {name}
      </p>

      <div style={styles.cards}>

        <div style={styles.card}>
          <h3>📋 Prescriptions</h3>
          <p>Create and manage prescriptions.</p>
        </div>

        <div style={styles.card}>
          <h3>💊 Available Medicines</h3>
          <p>View medicines in pharmacy.</p>
        </div>

        <div style={styles.card}>
          <h3>⚠ Expiring Medicines</h3>
          <p>Check medicines nearing expiry.</p>
        </div>

      </div>

    </div>
  );
};

export default DoctorDashboard;

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