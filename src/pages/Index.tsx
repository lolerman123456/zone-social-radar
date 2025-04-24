
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, onValue } from "firebase/database";
const Index = () => {
  const { user, loading } = useAuth();

  // Logging for debugging
  useEffect(() => {
    console.log("Auth state:", { user, loading });
  }, [user, loading]);

  // Show loading indicator while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-coral rounded-full flex items-center justify-center mb-4">
            <div className="h-10 w-10 bg-black rounded-full"></div>
          </div>
          <p className="text-white text-lg mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth screen if not logged in, radar map if logged in
  return user ? <Navigate to="/radar" replace /> : <Navigate to="/auth" replace />;
};

export default Index;
