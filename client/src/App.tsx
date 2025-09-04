import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ClientsList from './pages/ClientsList'
import ClientForm from './pages/ClientForm'
import CasesList from './pages/CasesList'
import CaseForm from './pages/CaseForm'
import CaseEditor from './pages/CaseEditor'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<ClientsList />} />
          <Route path="/clients/new" element={<ClientForm />} />
          <Route path="/clients/:id/edit" element={<ClientForm />} />
          <Route path="/cases" element={<CasesList />} />
          <Route path="/cases/new" element={<CaseForm />} />
          <Route path="/cases/:id/edit" element={<CaseEditor />} />
          <Route path="/cases/:id/edit-details" element={<CaseForm />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
