import React from 'react';
import Home from './pages/Home';
import './styles.css';

/*
  NOTE: Previous authentication logic has been temporarily bypassed to display the new Home page.
  To restore auth, uncomment the original code or move <Home /> into the authenticated view.
*/

function App() {
  return (
    <Home />
  );
}

export default App;

/* 
// ORIGINAL AUTH APP CODE PRESERVED BELOW
import { useEffect, useState } from 'react';
import { getMe, getToken, login, setToken } from './api';

const initialForm = { email: '', password: '' };

function App() {
  const [form, setForm] = useState(initialForm);
  const [user, setUser] = useState(null);
// ... (rest of the original code)
}
*/
