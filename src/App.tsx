import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Layout from './components/Layout';
import Welcome from './pages/Welcome';
import UserList from './pages/UserList';
import CreateUser from './pages/CreateUser';
import UserDetail from './pages/UserDetail';
import EditUser from './pages/EditUser';
import AseguradoDetail from './pages/AseguradoDetail';
import EditAsegurado from './pages/EditAsegurado';
import CreateAsegurado from './pages/CreateAsegurado';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<Welcome />} />
          <Route path="users" element={<UserList />} />
          <Route path="users/create" element={<CreateUser />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="users/:id/edit" element={<EditUser />} />
          <Route path="asegurados/create" element={<CreateAsegurado />} />
          <Route path="asegurados/:id" element={<AseguradoDetail />} />
          <Route path="asegurados/:id/edit" element={<EditAsegurado />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;