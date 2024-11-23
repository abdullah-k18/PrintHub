"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { CircularProgress, Container, Typography } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import BuyerNavbar from "../components/BuyerNavbar";
import Footer from "../components/Footer";

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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={50} sx={{ color: "#28a745" }} />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <BuyerNavbar name={name} />

      <div className="mt-[10%] lg:mt-[3%]">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 7000 }}
          loop
          className="h-64"
        >
          <SwiperSlide>
            <div className="h-full bg-white flex flex-col items-center justify-center text-black">
              <h2 className="text-2xl font-bold">Explore Our Products</h2>
              <p className="mt-2 pr-5 pl-5 text-center">Discover a wide range of business essentials and personalized items.</p>
              <Link href="/products">
                <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-[#218838]">
                  Browse Products
                </button>
              </Link>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="h-full bg-white flex flex-col items-center justify-center text-black">
              <h2 className="text-2xl font-bold">Top Printing Presses</h2>
              <p className="mt-2 pr-5 pl-5 text-center">Get the best quality printing solutions tailored for your needs.</p>
              <Link href="/presses">
                <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-[#218838]">
                  Browse Presses
                </button>
              </Link>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

      <div className="mt-8 p-4 mb-4">
        <h2 className="text-xl font-bold text-center mb-4">Explore Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <Link
              key={index}
              href={`/category/${encodeURIComponent(category.name.replace(/\//g, "and").replace(/\s+/g, "-").toLowerCase())}`}
            >
              <div
                className="flex flex-col items-center p-2 lg:p-4 bg-white shadow-md rounded-lg hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer"
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
            </Link>
          ))}
        </div>
      </div>

      <hr />

      <Footer />
    </div>
  );
}
