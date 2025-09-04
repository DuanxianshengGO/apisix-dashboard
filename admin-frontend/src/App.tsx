import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import UserManagement from './pages/UserManagement'
import PermissionManagement from './pages/PermissionManagement'
import AuditLog from './pages/AuditLog'
import Dashboard from './pages/Dashboard'

const { Content } = Layout

function App() {
  return (
    <Layout>
      <Sidebar />
      <Layout>
        <Header />
        <Content>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/permissions" element={<PermissionManagement />} />
            <Route path="/audit" element={<AuditLog />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App