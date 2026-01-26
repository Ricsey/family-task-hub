import {
	SignedIn,
	SignedOut,
	SignIn,
	ClerkLoading,
	ClerkLoaded,
} from "@clerk/clerk-react";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
	children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	return (
		<>
			<ClerkLoading>
				<div className="flex justify-center items-center min-h-screen bg-gray-50">
					<div className="text-gray-500">Loading...</div>
				</div>
			</ClerkLoading>
			<ClerkLoaded>
				<SignedOut>
					<div className="flex justify-center items-center min-h-screen bg-gray-50">
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
