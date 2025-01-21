import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import {addCSS} from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";

// Menambahkan CSS SweetAlert
addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css");


function parseJWT(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

document.addEventListener('DOMContentLoaded', function () {
  // Fungsi Login
  async function login(username, password) {
    try {
      const response = await fetch('https://asia-southeast2-menurestoran-443909.cloudfunctions.net/menurestoran/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Username: username, Password: password }),
      });
  
      const data = await response.json();
  
      if (response.status === 200) {
        const token = data.token;
        localStorage.setItem('token', token);
        
        // Decode token untuk memeriksa role
        const decodedToken = parseJWT(token);
  
        if (decodedToken.role === 'admin') {
          Swal.fire({
            icon: 'success',
            title: 'Login Successful',
            text: 'Welcome, Admin! Redirecting to the dashboard...',
            timer: 2000,
            showConfirmButton: false,
          });
          setTimeout(() => {
            window.location.href = '../admin/admin.html';  // Redirect ke Admin Dashboard
          }, 2000);
        } else if (decodedToken.role === 'kasir') {
          Swal.fire({
            icon: 'success',
            title: 'Login Successful',
            text: 'Welcome, Kasir! Redirecting to Kasir...',
            timer: 2000,
            showConfirmButton: false,
          });
          setTimeout(() => {
            window.location.href = 'https://irgifauzi.github.io/P2_kasir/';  
          }, 2000);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'Role not recognized!',
          });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Username or password is incorrect!',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'warning',
        title: 'Login Failed',
        text: 'There was an error with the server, please try again later.',
      });
    }
  }

  // Menangani pengiriman form login
  document.getElementById('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;
    login(username, password);
  });
});
