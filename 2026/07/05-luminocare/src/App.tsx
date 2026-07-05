import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardPage } from "@/pages/dashboard";
import { OnboardingPage } from "@/pages/onboarding";
import { SchedulePage } from "@/pages/schedule";
import { PeopleCarersPage, PeopleClientsPage } from "@/pages/people";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="people/carers" element={<PeopleCarersPage />} />
          <Route path="people/clients" element={<PeopleClientsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
