import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const useAuthProtection = () => {
    const router = useRouter();
    const [loadingAuth, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("auth_token");

        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            router.push("/login");
        }

        // Set loading to false once the check is complete
        setLoading(false);
    }, [router]);

    return { loadingAuth, isAuthenticated };
};

export default useAuthProtection;