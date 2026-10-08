import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Challenge from "./pages/Challenge";
import Research from "./pages/Research";
import Speaking from "./pages/Speaking";
import Results from "./pages/Results";
import History from "./pages/History";

import Onboarding from "./components/ui/Onboarding";
import { useAuthenticatedApi } from "./hooks/useAuthApi";

type ProfileStatus = "checking" | "exists" | "missing";

function App() {
  const { isLoaded, isSignedIn } = useAuth();
  const api = useAuthenticatedApi();

  const [profileStatus, setProfileStatus] =
    useState<ProfileStatus>("checking");

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setProfileStatus("checking");
      return;
    }

    const checkProfile = async () => {
      try {
        await api.get("/users/me");
        setProfileStatus("exists");
      } catch (error: unknown) {
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error
        ) {
          const axiosError = error as {
            response?: {
              status?: number;
            };
          };

          if (axiosError.response?.status === 404) {
            setProfileStatus("missing");
            return;
          }
        }

        console.error(
          "Failed to check user profile:",
          error,
        );
      }
    };

    void checkProfile();
  }, [api, isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#FCF9EC]">
        <p className="text-sm font-medium text-[#263911]/50">
          Loading OffScripter...
        </p>
      </div>
    );
  }

  if (isSignedIn && profileStatus === "checking") {
    return (
      <div className="grid min-h-screen place-items-center bg-[#FCF9EC]">
        <p className="text-sm font-medium text-[#263911]/50">
          Loading your profile...
        </p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />

      {/* Onboarding */}
      <Route
        path="/onboarding"
        element={
          !isSignedIn ? (
            <Navigate to="/" replace />
          ) : profileStatus === "missing" ? (
            <Onboarding />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          !isSignedIn ? (
            <Navigate to="/" replace />
          ) : profileStatus === "missing" ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <Dashboard />
          )
        }
      />

      {/* Challenge selection / reel */}
      <Route
        path="/challenge"
        element={
          !isSignedIn ? (
            <Navigate to="/" replace />
          ) : profileStatus === "missing" ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <Challenge />
          )
        }
      />

      {/* Research */}
      <Route
        path="/challenge/:attemptId/research"
        element={
          !isSignedIn ? (
            <Navigate to="/" replace />
          ) : profileStatus === "missing" ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <Research />
          )
        }
      />

      {/* Speaking */}
      <Route
        path="/challenge/:attemptId/speaking"
        element={
          !isSignedIn ? (
            <Navigate to="/" replace />
          ) : profileStatus === "missing" ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <Speaking />
          )
        }
      />


<Route
  path="/challenge/:attemptId/results"
  element={
    !isSignedIn ? (
      <Navigate to="/" replace />
    ) : profileStatus === "missing" ? (
      <Navigate to="/onboarding" replace />
    ) : (
      <Results />
    )
  }
/>

      {/* Placeholder pages */}
     <Route
  path="/history"
  element={
    !isSignedIn ? (
      <Navigate to="/" replace />
    ) : profileStatus === "missing" ? (
      <Navigate to="/onboarding" replace />
    ) : (
      <History />
    )
  }
/>

      <Route
        path="/leaderboard"
        element={
          <div className="min-h-screen bg-[#FCF9EC]" />
        }
      />

      <Route
        path="/progress"
        element={
          <div className="min-h-screen bg-[#FCF9EC]" />
        }
      />

      <Route
        path="/settings"
        element={
          <div className="min-h-screen bg-[#FCF9EC]" />
        }
      />

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;