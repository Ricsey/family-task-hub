import {
    ClerkLoaded,
    ClerkLoading,
    SignedIn,
    SignedOut,
    SignIn,
} from "@clerk/clerk-react";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
	children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	return (
		<>
			<ClerkLoading>
				<div className="flex justify-center items-center min-h-screen bg-background">
					<div className="text-muted-foreground">Loading...</div>
				</div>
			</ClerkLoading>
			<ClerkLoaded>
				<SignedOut>
					<div className="flex justify-center items-center min-h-screen bg-background">
						<div className="w-full max-w-md">
							<SignIn />
						</div>
					</div>
				</SignedOut>
				<SignedIn>{children}</SignedIn>
			</ClerkLoaded>
		</>
	);
};
