import { decodeTokenAndGetUserId } from "@/helpers/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const useAuthProtection = () => {
    const router = useRouter();
    const [loadingAuth, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<string | undefined>("");
    const [authToken, setAuthToken] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("auth_token");

        if (token) {
            setIsAuthenticated(true);
            setAuthToken(token);

            const authResult = decodeTokenAndGetUserId(token);
            const user = authResult;
            setUserRole(user?.role);

        } else {
            setIsAuthenticated(false);
            router.push("/login");
        }

        setLoading(false);
    }, [router]);

    return { loadingAuth, authToken, userRole, isAuthenticated };
};

export default useAuthProtection;