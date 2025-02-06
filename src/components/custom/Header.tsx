"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { decodeTokenAndGetUserId, getAuthToken } from "@/helpers/auth";
import Link from "next/link";

const Header: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | undefined>("");

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      const authResult = decodeTokenAndGetUserId(token);
      const user = authResult;
      console.log({ user });
      setUserRole(user?.role);
    } else {
      console.error("No auth token found");
    }
  }, []);

  const handleOpenDialog = () => {
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/login");
    setIsOpen(false);
  };

  return (
    <>
      <header className="pl-2 bg-gray-800 text-white py-4 pr-2">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/questionary-selection">
            <h1 className="text-xl font-semibold">Question APP</h1>
          </Link>

          <div className="flex space-x-6"></div>
          <nav className="space-x-6">
            {userRole === `admin` && (
              <Button onClick={() => router.push("/admin")}>Admin</Button>
            )}
            <Button onClick={handleOpenDialog}>Logout</Button>
          </nav>
        </div>
      </header>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You will be redirected to the
              login page.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="secondary" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleLogout}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default Header;
