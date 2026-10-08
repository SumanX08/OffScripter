import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { useAuthenticatedApi } from "../../hooks/useAuthApi";
type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const { isLoaded, isSignedIn } = useAuth();
  const api = useAuthenticatedApi();

  const [checkingProfile, setCheckingProfile] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    const checkProfile = async () => {
      try {
        await api.get("/users/me");
        setHasProfile(true);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setHasProfile(false);
        }
      } finally {
        setCheckingProfile(false);
      }
    };

    checkProfile();
  }, [api, isLoaded, isSignedIn]);

  if (!isLoaded || checkingProfile) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream">
        <div className="text-sm font-medium text-forest/50">
          Loading OffScripter...
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  if (!hasProfile) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}