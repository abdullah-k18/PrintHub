"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebase";
import { CircularProgress } from '@mui/material';
import { doc, getDoc } from "firebase/firestore";
import SellerNavbar from "@/app/components/SellerNavbar";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [pressName, setPressName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const sellerDoc = await getDoc(doc(db, "sellers", user.uid));
          if (sellerDoc.exists() && sellerDoc.data().role === "seller") {
            setPressName(sellerDoc.data().pressName);
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
    </div>
  );
}
