import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";

export const useAuth = () => {
  const { isLoaded, userId, sessionId, getToken, signOut } = useClerkAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  return {
    isLoaded: isLoaded && isUserLoaded,
    isAuthenticated: !!userId,
    userId,
    sessionId,
    user: user
      ? {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          fullName: user.fullName || "",
          imageUrl: user.imageUrl,
        }
      : null,
    getToken: async (options?: { template?: string }) => {
      try {
        return await getToken(options);
      } catch (error) {
        console.error("Error getting token:", error);
        return null;
      }
    },
    signOut: () => signOut(),
  };
};
