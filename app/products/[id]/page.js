"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  Button,
  Typography,
  Box,
  CircularProgress,
  TextField,
  Dialog,
  IconButton,
} from "@mui/material";
import { Close, Visibility } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BuyerNavbar from "@/app/components/BuyerNavbar";
import Footer from "@/app/components/Footer";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [name, setName] = useState("");
  const [pressName, setPressName] = useState("");
  const [pressId, setPressId] = useState("");
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(0);
  const [activeImage, setActiveImage] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProductAndPress = async () => {
      try {
        const productDocRef = doc(db, "products", id);
        const productDoc = await getDoc(productDocRef);

        if (productDoc.exists()) {
          const productData = productDoc.data();
          setProduct(productData);
          setQuantity(productData.minimumPrintingQuantity);
          setActiveImage(productData.images[0]);

          const sellerDocRef = doc(db, "sellers", productData.uid);
          const sellerDoc = await getDoc(sellerDocRef);

          if (sellerDoc.exists()) {
            const sellerData = sellerDoc.data();
            setPressName(sellerDoc.data().pressName);
            setPressId(sellerDoc.id);
          } else {
            console.warn("Seller not found.");
          }
        } else {
          console.warn("Product not found.");
          router.push("/products");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndPress();
  }, [id, router]);

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

  const handleQuantityChange = (delta) => {
    setQuantity((prev) =>
      Math.max(product.minimumPrintingQuantity, prev + delta)
    );
  };

  const handleQuantityInputChange = (event) => {
    const value = event.target.value;
    setQuantity(value ? Number(value) : "");
  };

  const handleQuantityBlur = () => {
    if (quantity < product.minimumPrintingQuantity || !quantity) {
      toast.error(
        `Minimum quantity required is ${product.minimumPrintingQuantity}.`,
        { position: "top-center" }
      );
      setQuantity(product.minimumPrintingQuantity);
    }
  };

  const handleAddToCart = () => {
    alert("Product added to cart!");
  };

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

      <div className="lg:pt-[5%] pt-[20%] md:pt-[10%] pl-8 pr-8 flex-grow">
        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={4}>
          <Box
            flex={1}
            display="flex"
            flexDirection="column"
            alignItems="center"
            position="relative"
          >
            <img
              src={activeImage}
              alt={product.productName}
              className="rounded-md shadow-md mb-4 bg-white"
              style={{
                width: "300px",
                height: "300px",
                objectFit: "cover",
              }}
            />
            <IconButton
              onClick={() => setDialogOpen(true)}
              sx={{
                position: "absolute",
                top: "10px",
                right: "10px",
                color: "#fff",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
              }}
            >
              <Visibility />
            </IconButton>

            <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
              {product.images.map((image, index) => (
                <Box
                  key={index}
                  className={`cursor-pointer border-2 rounded-md ${
                    activeImage === image
                      ? "border-green-600"
                      : "border-gray-300"
                  }`}
                  onClick={() => setActiveImage(image)}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="h-16 w-16 object-cover rounded-md"
                  />
                </Box>
              ))}
            </Box>
          </Box>

          <Box flex={2} display="flex" flexDirection="column" gap={2}>
            <Typography variant="h4" fontWeight="bold">
              {product.productName}
            </Typography>
            <Typography variant="body1">
              {product.productDescription}
            </Typography>

            <Box>
              <Typography variant="body1" fontWeight="semibold">
                Press:{" "}
                <Link href={`/presses/${pressId}`}>
                  <Typography
                    variant="text"
                    sx={{
                      textDecoration: "underline",
                      textDecorationColor: "inherit",
                      cursor: "pointer",
                      "&:hover": {
                        color: "#2563eb",
                        textDecorationColor: "#2563eb",
                      },
                    }}
                  >
                    {pressName}
                  </Typography>
                </Link>
              </Typography>
            </Box>

            <Typography variant="h5" fontWeight="semibold">
              Rs. {product.productPrice * quantity}
            </Typography>

            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#00000080",
                  "&:hover": {
                    backgroundColor: "#000000B3",
                  },
                  fontWeight: "bold",
                }}
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= product.minimumPrintingQuantity}
              >
                -
              </Button>
              <TextField
                type="number"
                value={quantity}
                onChange={handleQuantityInputChange}
                onBlur={handleQuantityBlur}
                variant="outlined"
                size="small"
                InputLabelProps={{
                  sx: {
                    "&.Mui-focused": {
                      color: "black",
                    },
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "black",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "black",
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#00000080",
                  "&:hover": {
                    backgroundColor: "#000000B3",
                  },
                  fontWeight: "bold",
                }}
                onClick={() => handleQuantityChange(1)}
              >
                +
              </Button>
            </Box>

            <Button
              variant="contained"
              sx={{
                mb: 2,
                backgroundColor: "#28a745",
                "&:hover": {
                  backgroundColor: "#218838",
                },
                color: "white",
                width: "auto",
                padding: "6px 16px",
                minWidth: "120px",
                maxWidth: "200px",
              }}
              onClick={handleAddToCart}
              className="mt-4"
            >
              Add to Cart
            </Button>
          </Box>
        </Box>
      </div>

      <Dialog
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xl"
        sx={{ "& .MuiDialog-paper": { margin: 0, padding: 0 } }}
      >
        <Box position="relative" display="flex" justifyContent="center">
          <IconButton
            onClick={() => setDialogOpen(false)}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              color: "#fff",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
            }}
          >
            <Close />
          </IconButton>
          <img
            src={activeImage}
            alt="Full View"
            style={{
              maxHeight: "100vh",
              maxWidth: "100vw",
              objectFit: "contain",
            }}
          />
        </Box>
      </Dialog>

      <hr />

      <Footer />

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
