import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import SparklingStars from "./ai-icon";
import { Toggle } from "../ui/toggle";
import { useAppSettings } from "@/store/appSettingStore";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { isAuthenticated, signOut, user } = useSupabaseAuth();
  const { isModernUI, setModernUI } = useAppSettings();
  const navigate = useNavigate();

  return (
    <header className="w-full fixed top-0 z-50 px-5 py-5">
      <div className="container flex-1 mx-auto max-w-4xl flex h-16 items-center justify-between rounded-full bg-zinc-950/40 backdrop-blur-xl px-6 shadow-lg">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-accent font-bold text-sm">OC</span>
            </div>
            <span className="font-semibold text-white tracking-tight">
              OBS Challenge
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-6">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Toggle
                pressed={isModernUI}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300",
                  isModernUI
                    ? "bg-gradient-to-r from-amber-500/70 to-amber-300/20 text-black shadow-lg"
                    : "hover:bg-zinc-800 hover:shadow-md",
                  "cursor-pointer"
                )}
                onClick={() => setModernUI(!isModernUI)}
              >
                <SparklingStars color={isModernUI ? "#FBBF24" : "#94A3B8"} />
                <span className="hidden md:block">Modern UI</span>
              </Toggle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-9 w-9 border border-zinc-700">
                      {user?.user_metadata?.avatar_url ? (
                        <AvatarImage
                          src={user.user_metadata.avatar_url}
                          alt={user.email || "User"}
                        />
                      ) : (
                        <AvatarFallback className="bg-accent/20 text-accent">
                          {user?.user_metadata?.name ? (
                            <p>
                              {user?.user_metadata?.name
                                ?.split(" ")
                                .map((name) => name.charAt(0))
                                .join("")}
                            </p>
                          ) : (
                            <User className="font-bold" />
                          )}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-zinc-900 border-zinc-800"
                  align="end"
                >
                  <DropdownMenuLabel className="text-zinc-300">
                    {user?.email || "User Account"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                      navigate("/login", { replace: true });
                    }}
                    className="text-zinc-300 hover:text-white cursor-pointer"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link to="/register">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-zinc-800 hover:bg-zinc-700 text-white"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
