"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  CircularProgress,
} from "@mui/material";
import BuyerNavbar from "@/app/components/BuyerNavbar";
import Footer from "../components/Footer";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching all products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

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
        }
      } else {
        console.warn("User is not authenticated.");
        router.push("/login");
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

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <BuyerNavbar name={name} />

      <div className="flex justify-center lg:pt-[5%] pt-[20%]">
        <input
          type="text"
          placeholder="Search by product name"
          className="w-3/4 sm:w-1/2 px-4 py-2 rounded-lg shadow-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="p-4 flex-grow">
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Link href={`/products/${product.id}`}>
                <Card
                  className="hover:shadow-xl w-60 mx-auto"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: 260,
                  }}
                >
                  <div className="flex justify-center items-center h-40 rounded-t-md">
                    <img
                      src={product.images[0]}
                      alt={product.productName}
                      className="h-40 object-cover rounded-t-md"
                    />
                  </div>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                      {product.productName}
                    </Typography>
                    {product.inventoryQuantity === 0 && (
                      <Typography variant="body2" color="error">
                        Out of Stock
                      </Typography>
                    )}
                    <Typography
                      variant="body1"
                      className="text-green-600"
                      fontWeight="bold"
                    >
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
              No products found matching your search.
            </Typography>
          )}
        </Grid>
      </div>

      <hr />

      <Footer />
    </div>
  );
}
