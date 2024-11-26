"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebase";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  CircularProgress,
} from "@mui/material";
import BuyerNavbar from "@/app/components/BuyerNavbar";
import Footer from "@/app/components/Footer";

export default function PressPage({ params }) {
  const { pressName } = params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(false);
  const [name, setName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const sellersQuery = query(
          collection(db, "sellers"),
          where("pressName", "==", pressName.replace(/-/g, " "))
        );
        const sellerSnapshot = await getDocs(sellersQuery);

        if (sellerSnapshot.empty) {
          console.error(`No seller found for press name: ${pressName}`);
          setError(true);
          return;
        }

        const sellerData = sellerSnapshot.docs[0].data();
        const sellerUID = sellerSnapshot.docs[0].id;

        const productsQuery = query(
          collection(db, "products"),
          where("uid", "==", sellerUID)
        );
        const productsSnapshot = await getDocs(productsQuery);

        const productsData = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [pressName]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const buyerDocRef = doc(db, "buyers", user.uid);
          const buyerDoc = await getDoc(buyerDocRef);

          if (buyerDoc.exists()) {
            setName(buyerDoc.data().name);
          } else {
            console.warn("User not found in buyers collection.");
            router.push("/login");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          router.push("/login");
        } finally {
          setAuthLoading(false);
        }
      } else {
        console.warn("User is not logged in.");
        router.push("/login");
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const filteredProducts = products.filter((product) =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress size={50} sx={{ color: "#28a745" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography variant="h6" color="error">
          Unable to load products for {pressName.replace(/-/g, " ")}. Please try
          again later.
        </Typography>
      </Box>
    );
  }

  if (authLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress size={50} sx={{ color: "#28a745" }} />
      </Box>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <BuyerNavbar name={name} />

      <div className="flex justify-center lg:pt-[5%] pt-[20%]">
        <input
          type="text"
          placeholder="Search by product name"
          className="w-3/4 sm:w-1/2 px-4 py-2 rounded-lg shadow-md"
          sx={{
            "&:focus": {
              outline: "2px solid black",
            },
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="p-4 flex-grow">
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <div
                onClick={() => router.push(`/products/${product.id}`)}
                className="cursor-pointer"
              >
                <Card className="hover:shadow-xl w-60 mx-auto">
                  <div className="flex justify-center items-center h-40 rounded-t-md">
                    <img
                      src={product.images[0]}
                      alt={product.productName}
                      className="h-40 place-items-center object-cover rounded-t-md"
                    />
                  </div>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                      {product.productName}
                    </Typography>
                    <Typography variant="body1" className="text-green-600">
                      Rs. {product.productPrice}
                    </Typography>
                  </CardContent>
                </Card>
              </div>
            </Grid>
          ))}
          {filteredProducts.length === 0 && (
            <Typography
              variant="body1"
              className="w-full text-center text-gray-500"
              sx={{ marginTop: 4 }}
            >
              No products found.
            </Typography>
          )}
        </Grid>
      </div>

      <hr />

      <Footer />
    </div>
  );
}
