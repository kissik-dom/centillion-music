import { useAuthActions } from "@convex-dev/auth/react";
import { Crown, LogOut, Menu, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";

export function Header() {
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const { toggleSidebar, isMobile } = useSidebar();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="h-14 border-b border-[rgba(212,175,55,0.06)] flex items-center justify-between px-4 bg-[#070B14]/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-[rgba(212,175,55,0.08)] text-[#8B9BB4] hover:text-[#D4AF37] transition-colors"
          >
            <Menu className="size-5" />
          </button>
        )}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 md:hidden"
        >
          <div className="size-6 rounded-md bg-gradient-to-br from-[#D4AF37] to-[#B8960F] flex items-center justify-center">
            <Crown className="size-3 text-[#070B14]" />
          </div>
          <span className="font-bold text-sm text-[#FFF8E7]">
            Centillion Music
          </span>
        </Link>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="size-8 rounded-full p-0 bg-[rgba(212,175,55,0.08)] hover:bg-[rgba(212,175,55,0.15)]"
          >
            <User className="size-4 text-[#D4AF37]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-[#0F1D35] border-[rgba(212,175,55,0.15)]"
        >
          <DropdownMenuItem
            onClick={() => navigate("/settings")}
            className="text-[#C4BFB3] hover:text-[#E5C158] hover:bg-[rgba(212,175,55,0.08)] cursor-pointer"
          >
            <User className="size-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-[#C4BFB3] hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
          >
            <LogOut className="size-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
