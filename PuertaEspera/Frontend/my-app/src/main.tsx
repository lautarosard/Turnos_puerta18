import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { TurnoProvider } from './context/TurnoContext.tsx'
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary.tsx'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <AuthProvider>
        <TurnoProvider>
          <App />
        </TurnoProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  </StrictMode>,
)
