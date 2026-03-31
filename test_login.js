// Test script to verify role-based login redirection
// Run this in browser console after starting the servers

const testUsers = [
  { email: 'admin@example.com', password: 'password', expectedRole: 'Admin', expectedPath: '/dashboard/admin' },
  { email: 'doctor@example.com', password: 'password', expectedRole: 'Doctor', expectedPath: '/dashboard/doctor' },
  { email: 'pharmacist@example.com', password: 'password', expectedRole: 'Pharmacist', expectedPath: '/dashboard/pharmacist' }
];

async function testLogin(user) {
  console.log(`Testing login for ${user.email}...`);

  try {
    const response = await fetch('http://localhost:8000/api/v1/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        password: user.password
      })
    });

    const data = await response.json();

    if (data.access_token && data.user) {
      console.log(`✅ Login successful for ${user.email}`);
      console.log(`Role: ${data.user.specialisation}`);
      console.log(`Expected role: ${user.expectedRole}`);

      if (data.user.specialisation === user.expectedRole) {
        console.log(`✅ Role matches expected value`);
      } else {
        console.log(`❌ Role mismatch!`);
      }

      // Store token and role (simulating frontend)
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.user.specialisation);
      localStorage.setItem('name', data.user.name);

      console.log(`Expected redirect path: ${user.expectedPath}`);
      console.log(`Stored role: ${localStorage.getItem('role')}`);

    } else {
      console.log(`❌ Login failed for ${user.email}:`, data);
    }
  } catch (error) {
    console.log(`❌ Error testing ${user.email}:`, error);
  }

  console.log('---');
}

// Test all users
async function runTests() {
  console.log('🧪 Testing Role-Based Login Redirection\n');

  for (const user of testUsers) {
    await testLogin(user);
  }

  console.log('🏁 Test completed');
}

// Run the tests
runTests();