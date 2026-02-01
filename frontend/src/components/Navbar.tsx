import { useTaskModal } from "@/features/tasks/stores/taskModalStore";
import { useAuth } from "@/features/auth";
import { Calendar, HomeIcon, List, PlusIcon } from "lucide-react";
import { NavLink } from "react-router";
import { Button } from "./ui/button";
import { UserButton } from "@clerk/clerk-react";

const Navbar = () => {
	const { openCreateModal } = useTaskModal();
	const { user, isLoaded } = useAuth();

	const navItems = [
		{ path: "/dashboard", label: "Dashboard", icon: HomeIcon },
		{ path: "/tasks", label: "Tasks", icon: List },
		{ path: "/calendar", label: "Calendar", icon: Calendar },
	];

	if (!isLoaded) {
		return null;
	}

	return (
		<nav className="bg-white border-b top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<div className="flex items-center gap-2">
						<div className="w-9 h-9 bg-teal-500 rounded-lg flex items-center justify-center">
							<HomeIcon className="w-5 h-5 text-white" />
						</div>
						<span className="text-xl font-semibold text-stone-800">
							Family Task Hub
						</span>
					</div>

					{/* Navigation links */}
					<div className="flex items-center gap-1">
						{navItems.map(({ path, label, icon: Icon }) => (
							<NavLink
								key={path}
								to={path}
								className={({ isActive }) =>
									`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
										isActive
											? "bg-teal-50 text-teal-700"
											: "text-stone-600 hover:bg-stone-100 hover:text-stone-800"
									}`
								}
							>
								<Icon className="w-4 h-4" />
								{label}
							</NavLink>
						))}
					</div>

					{/* Right side actions */}
					<div className="flex items-center gap-3">
						<Button
							className="bg-teal-600 hover:bg-teal-700"
							onClick={openCreateModal}
						>
							<PlusIcon />
							<span className="hidden sm:inline">Add Task</span>
						</Button>

						{user && (
							<div className="flex items-center gap-2">
								<span className="hidden md:inline text-sm text-gray-700">
									{user.firstName || user.email}
								</span>
								<UserButton />
							</div>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
