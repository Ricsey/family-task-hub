import { useAuth } from "@/features/auth";
import { useTaskModal } from "@/features/tasks/stores/taskModalStore";
import { UserButton } from "@clerk/clerk-react";
import { Calendar, HomeIcon, List, Menu, PlusIcon } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router";
import { ModeToggle } from "./ModeToggleButton";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

const Navbar = () => {
	const { openCreateModal } = useTaskModal();
	const { user, isLoaded } = useAuth();
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	const navItems = [
		{ path: "/dashboard", label: "Dashboard", icon: HomeIcon },
		{ path: "/tasks", label: "Tasks", icon: List },
		{ path: "/calendar", label: "Calendar", icon: Calendar },
	];

	if (!isLoaded) {
		return null;
	}

	const handleNavClick = () => {
		setIsSheetOpen(false);
	};

	const handleAddTask = () => {
		openCreateModal();
		setIsSheetOpen(false);
	};

	return (
		<nav className="bg-background border-b top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<div className="flex items-center gap-2">
						<div className="w-9 h-9 bg-teal-500 rounded-lg flex items-center justify-center">
							<HomeIcon className="w-5 h-5 text-white" />
						</div>
						<span className="text-xl font-semibold text-foreground">
							Family Task Hub
						</span>
					</div>

					{/* Desktop Navigation links */}
					<div className="hidden md:flex items-center gap-1">
						{navItems.map(({ path, label, icon: Icon }) => (
							<NavLink
								key={path}
								to={path}
								className={({ isActive }) =>
									`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
										isActive
											? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
											: "text-muted-foreground hover:bg-muted hover:text-foreground"
									}`
								}
							>
								<Icon className="w-4 h-4" />
								{label}
							</NavLink>
						))}
					</div>

					{/* Desktop Right side actions */}
					<div className="hidden md:flex items-center gap-3">
						<Button
							className="bg-teal-600 hover:bg-teal-700"
							onClick={openCreateModal}
						>
							<PlusIcon />
							<span className="hidden sm:inline">Add Task</span>
						</Button>

						<ModeToggle />

						{user && (
							<div className="flex items-center gap-2">
								<span className="hidden md:inline text-sm text-muted-foreground">
									{user.firstName || user.email}
								</span>
								<UserButton />
							</div>
						)}
					</div>

					{/* Mobile Right side actions */}
					<div className="flex md:hidden items-center gap-3">
						{user && <UserButton />}

						<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
							<SheetTrigger asChild>
								<Button variant="ghost" size="icon">
									<Menu className="w-5 h-5" />
									<span className="sr-only">Open menu</span>
								</Button>
							</SheetTrigger>
							<SheetContent side="right" className="w-72 p-2">
								<SheetHeader>
									<SheetTitle>Menu</SheetTitle>
								</SheetHeader>
								<div className="flex flex-col gap-4 mt-6">
									{/* Mobile Navigation links */}
									<div className="flex flex-col gap-1">
										{navItems.map(({ path, label, icon: Icon }) => (
											<NavLink
												key={path}
												to={path}
												onClick={handleNavClick}
												className={({ isActive }) =>
													`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
														isActive
															? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
															: "text-muted-foreground hover:bg-muted hover:text-foreground"
													}`
												}
											>
												<Icon className="w-5 h-5" />
												{label}
											</NavLink>
										))}
									</div>

									<hr className="border-border" />

									{/* Mobile Add Task button */}
									<Button
										className="bg-teal-600 hover:bg-teal-700 w-full justify-start gap-3"
										onClick={handleAddTask}
									>
										<PlusIcon className="w-5 h-5" />
										Add Task
									</Button>

									<hr className="border-border" />

									{/* Mobile Mode Toggle */}
									<div className="flex items-center justify-between px-4 py-2">
										<span className="text-sm text-muted-foreground">Theme</span>
										<ModeToggle />
									</div>
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
