import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import toast from 'react-hot-toast'
import ProtectedRoute from './ProtectedRoute'
import UnifiedPatientForm from './UnifiedPatientForm'

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key, fallback) => fallback,
    i18n: { language: 'en' },
  }),
}))

vi.mock('../../context/ServiceContext', () => ({
  useServices: () => ({ isOnline: false }),
}))

vi.mock('../../services/api', () => ({
  authService: {},
  patientsService: { createPatient: vi.fn() },
}))

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('sends an anonymous visitor to login', async () => {
    render(
      <MemoryRouter initialEntries={['/patients']}>
        <Routes>
          <Route path="/login" element={<p>Login screen</p>} />
          <Route path="/patients" element={<ProtectedRoute><p>Private</p></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(await screen.findByText('Login screen')).toBeInTheDocument()
  })

  it('sends a signed-in user away from a role they do not have', async () => {
    localStorage.setItem('mcsos_token', 'token')
    localStorage.setItem('mcsos_user', JSON.stringify({ role: 'DOCTOR' }))
    render(
      <MemoryRouter initialEntries={['/finance']}>
        <Routes>
          <Route path="/dashboard" element={<p>Home</p>} />
          <Route path="/finance" element={<ProtectedRoute allowedRoles={['ADMIN']}><p>Finance</p></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(await screen.findByText('Home')).toBeInTheDocument()
  })

  it('renders the page for an allowed role', async () => {
    localStorage.setItem('mcsos_token', 'token')
    localStorage.setItem('mcsos_user', JSON.stringify({ role: 'ADMIN' }))
    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['ADMIN']}><p>Finance desk</p></ProtectedRoute>
      </MemoryRouter>,
    )
    expect(await screen.findByText('Finance desk')).toBeInTheDocument()
  })
})

describe('UnifiedPatientForm', () => {
  it('refuses a submit that has neither a name nor a phone', async () => {
    const user = userEvent.setup()
    render(<UnifiedPatientForm />)
    await user.click(screen.getByRole('button', { name: 'Save & Register Patient' }))
    expect(toast.error).toHaveBeenCalledWith('Please enter patient name or phone')
  })
})
