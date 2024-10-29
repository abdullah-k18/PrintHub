"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { CircularProgress } from '@mui/material';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const buyerDoc = await getDoc(doc(db, "buyers", user.uid));
          const sellerDoc = await getDoc(doc(db, "sellers", user.uid));

          if (buyerDoc.exists() && buyerDoc.data().role === "buyer") {
            setLoading(false);
          } else if (sellerDoc.exists() && sellerDoc.data().role === "seller") {
            router.push("/login");
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
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
        <CircularProgress size={50} sx={{ color: '#28a745' }} />
      </div>
    );
  }

  return (
    <div>
      <h1>Home</h1>
    </div>
  );
}
