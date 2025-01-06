"use client";

import React, { useEffect, useState } from "react";
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
import Link from "next/link";
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
  const { id } = params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const sellerDocRef = doc(db, "sellers", id);
        const sellerDoc = await getDoc(sellerDocRef);

        if (!sellerDoc.exists()) {
          console.error(`No seller found for id: ${id}`);
          setError(true);
          return;
        }

        const sellerUID = sellerDoc.id;
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
  }, [id]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const buyerDocRef = doc(db, "buyers", user.uid);
          const buyerDoc = await getDoc(buyerDocRef);

          if (buyerDoc.exists()) {
            setName(buyerDoc.data().name);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

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
          Unable to load products for the selected press. Please try again
          later.
        </Typography>
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
              <Link href={`/products/${product.id}`}>
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
              </Link>
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
