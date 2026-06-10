import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FridgeProvider } from './context/FridgeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Fridge from './pages/Fridge';
import Scanner from './pages/Scanner';
import ShoppingList from './pages/ShoppingList';
import Recipes from './pages/Recipes';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <FridgeProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#3D1F0D',
              color: '#FBF6EE',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#5A8A5E', secondary: '#FBF6EE' },
            },
            error: {
              iconTheme: { primary: '#B94040', secondary: '#FBF6EE' },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"    element={<Dashboard />} />
            <Route path="fridge"       element={<Fridge />} />
            <Route path="scanner"      element={<Scanner />} />
            <Route path="shopping"     element={<ShoppingList />} />
            <Route path="recipes"      element={<Recipes />} />
            <Route path="analytics"    element={<Analytics />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FridgeProvider>
  );
}
