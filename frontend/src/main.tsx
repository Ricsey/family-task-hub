import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";
import { ApiProvider } from "./common/providers/ApiProvider";
import { ClerkThemeProvider } from "./components/providers/ClerkThemeProvider.tsx";
import { ThemeProvider } from "./components/providers/theme-provider.tsx";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ThemeProvider>
			<ClerkThemeProvider>
				<QueryClientProvider client={queryClient}>
					<BrowserRouter>
						<ApiProvider>
							<App />
						</ApiProvider>
					</BrowserRouter>
				</QueryClientProvider>
			</ClerkThemeProvider>
		</ThemeProvider>
	</StrictMode>,
);
