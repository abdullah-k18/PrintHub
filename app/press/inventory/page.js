"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase";
import SellerNavbar from "@/app/components/SellerNavbar";
import { CircularProgress, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export default function Inventory() {
    const [loading, setLoading] = useState(true);
    const [pressName, setPressName] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const sellerDoc = await getDoc(doc(db, "sellers", user.uid));

                    if (sellerDoc.exists() && sellerDoc.data().role === "seller") {
                        const sellerData = sellerDoc.data();
                        setPressName(sellerData.pressName);
                        setLoading(false);
                    } else {
                        router.push("/login");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    router.push("/login");
                }
            } else {
                router.push("/login");
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress size={50} sx={{ color: '#28a745' }} />
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <SellerNavbar pressName={pressName} />
            <div className="pt-[80px] pl-4">
                <h1>Inventory Page</h1>
            </div>

            <Fab
                color="primary"
                aria-label="add"
                sx={{
                    position: 'fixed',
                    bottom: 50,
                    right: 50,
                    backgroundColor: '#28a745',
                    '&:hover': {
                        backgroundColor: '#218838',
                    }
                }}
            >
                <AddIcon />
            </Fab>
        </div>
    );
}
