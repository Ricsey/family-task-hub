import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";
import { ApiProvider } from "./common/providers/ApiProvider";
import { authConfig } from "./features/auth";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ClerkProvider publishableKey={authConfig.publishableKey}>
			<QueryClientProvider client={queryClient}>
				<BrowserRouter>
					<ApiProvider>
						<App />
					</ApiProvider>
				</BrowserRouter>
			</QueryClientProvider>
		</ClerkProvider>
	</StrictMode>,
);
