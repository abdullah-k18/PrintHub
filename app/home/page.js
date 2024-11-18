"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { CircularProgress, Container, Typography } from '@mui/material';
import BuyerNavbar from "../components/BuyerNavbar";

const categories = [
  {
    name: "Business Essentials",
    image: "/business.png",
  },
  {
    name: "Marketing Materials",
    image: "/marketing.png",
  },
  {
    name: "Stationery",
    image: "/stationery.png",
  },
  {
    name: "Packaging Materials",
    image: "/packaging.png",
  },
  {
    name: "Event Materials",
    image: "/event.png",
  },
  {
    name: "Apparel / Clothing",
    image: "/clothing.png",
  },
  {
    name: "Personalized Items",
    image: "/items.png",
  },
  {
    name: "Others",
    image: "/others.png",
  },
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const buyerDoc = await getDoc(doc(db, "buyers", user.uid));
          const sellerDoc = await getDoc(doc(db, "sellers", user.uid));

          if (buyerDoc.exists() && buyerDoc.data().role === "buyer") {
            setName(buyerDoc.data().name);
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
    <div className="bg-gray-100 min-h-screen">
      <BuyerNavbar name={name} />

      <div className="flex justify-center pt-[5%]">
        <input
          type="text"
          placeholder="Search for products"
          className="w-3/4 md:w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div className="mt-4">
        <div className="relative w-full h-64 bg-gray-300">
          <img src="/banner.png" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="mt-8 p-4">
        <h2 className="text-xl font-bold text-center mb-4">Explore Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-4 bg-white shadow-md rounded-lg hover:shadow-lg transform hover:scale-105 transition-all"
            >
              <img
                src={category.image}
                alt={category.name}
                className="h-32 w-32 rounded-lg mb-2 object-cover"
              />
              <h3 className="text-center font-medium text-gray-700">
                {category.name}
              </h3>
            </div>
          ))}
        </div>
      </div>

      <hr />

      <footer className="py-4  bg-gray-100">
        <Container className="text-center">
          <Typography 
            sx={{ color: 'black', fontSize: '0.8rem' }}
          >
            &copy; 2024 PrintHub. All rights reserved.
          </Typography>
        </Container>
      </footer>
    </div>
  );
}
