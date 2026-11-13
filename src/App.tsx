import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppContainer } from './components/layout/AppContainer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { DashboardPage } from './pages/DashboardPage';
import { MapExplorerPage } from './pages/MapExplorerPage';
import { BreakdownPage } from './pages/BreakdownPage';
import { GuardianPage } from './pages/GuardianPage';
import { SafetyAdvisoriesPage } from './pages/SafetyAdvisoriesPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { EvidencePage } from './pages/EvidencePage';
import { TravelSafetyPage } from './pages/TravelSafetyPage';

export function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <AppContainer>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/travel-safety" element={<TravelSafetyPage />} />
              <Route path="/map" element={<MapExplorerPage />} />
              <Route path="/breakdown" element={<BreakdownPage />} />
              <Route path="/guardian" element={<GuardianPage />} />
              <Route path="/evidence" element={<EvidencePage />} />
              <Route path="/advisories" element={<SafetyAdvisoriesPage />} />
              <Route path="/profile" element={<ProfileSettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppContainer>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
