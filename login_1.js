// login.js
// Handles user login functionality

// Simulated user database
const usersDB = [
    { username: "admin", password: "1234" },
    { username: "user1", password: "abcd" },
  ];
  
  // Login function
  function login(username, password) {
    const user = usersDB.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      console.log(`✅ Login successful! Welcome, ${username}`);
      return { success: true, username };
    } else {
      console.log("❌ Login failed! Invalid credentials.");
      return { success: false };
    }
  }
  
  // Export the login function
  module.exports = { login };
  