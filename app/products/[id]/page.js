"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  getFirestore,
  collection,
  where,
  limit,
  getDocs,
  query,
} from "firebase/firestore";
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
  Avatar,
  Card,
  CardContent,
} from "@mui/material";
import { Close, Visibility } from "@mui/icons-material";
import { Textarea } from "@mui/joy";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BuyerNavbar from "@/app/components/BuyerNavbar";
import Footer from "@/app/components/Footer";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { storage } from "../../../firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import Divider from "@mui/material/Divider";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [name, setName] = useState("");
  const [pressName, setPressName] = useState("");
  const [pressId, setPressId] = useState("");
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(0);
  const [instructions, setInstructions] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [images, setImages] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [similarProducts, setSimilarProducts] = useState([]);

  const uploadDesignImage = async (file) => {
    const uniqueFileName = `design-${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `design/${uniqueFileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    try {
      const uploadedUrls = await Promise.all(
        files.map((file) => uploadDesignImage(file))
      );
      setImages((prevImages) => [...prevImages, ...uploadedUrls]);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload design images. Please try again.");
    }
  };

  const handleImageDelete = async (index) => {
    try {
      const imageToDelete = images[index];

      const storageRef = ref(storage, imageToDelete);

      await deleteObject(storageRef);

      setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete the image.");
    }
  };

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

  const handleInstructions = (event) => {
    setInstructions(event.target.value);
  };

  const handleQuantityBlur = () => {
    if (quantity < product.minimumPrintingQuantity || !quantity) {
      toast.error(
        `Minimum quantity required is ${product.minimumPrintingQuantity}.`,
        { position: "bottom-right" }
      );
      setQuantity(product.minimumPrintingQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!quantity || quantity < product.minimumPrintingQuantity) {
      toast.error(
        `Please select a quantity greater than or equal to ${product.minimumPrintingQuantity}.`,
        { position: "bottom-right" }
      );
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload design images.", {
        position: "bottom-right",
      });
      return;
    }

    if (!instructions.trim()) {
      toast.error("Please provide printing instructions.", {
        position: "bottom-right",
      });
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast.error("You must be logged in to add products to the cart.", {
        position: "top-center",
      });
      router.push("/login");
      return;
    }

    const totalPrice = product.productPrice * quantity;

    try {
      const productDocRef = doc(db, "products", id);
      const productDoc = await getDoc(productDocRef);

      if (!productDoc.exists()) {
        toast.error("Product not found.", { position: "bottom-right" });
        return;
      }

      const sellerID = productDoc.data().uid;

      const cartDocRef = doc(db, "cart", user.uid);
      const cartDoc = await getDoc(cartDocRef);

      const productData = {
        productId: id,
        quantity,
        design: images,
        instructions,
        totalPrice,
        status: "pending",
        sellerID,
      };

      if (cartDoc.exists()) {
        await updateDoc(cartDocRef, {
          products: arrayUnion(productData),
        });
      } else {
        await setDoc(cartDocRef, {
          userId: user.uid,
          products: [productData],
        });
      }

      toast.success("Product added to cart successfully!", {
        position: "bottom-right",
      });

      setImages([]);
      setInstructions("");
      router.push("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add product to cart. Please try again.", {
        position: "bottom-right",
      });
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const productDocRef = doc(db, "products", id);
        const productDoc = await getDoc(productDocRef);

        if (productDoc.exists()) {
          const productData = productDoc.data();
          const reviewsData = productData.reviews || [];
          setReviews(reviewsData);

          const totalRatings = reviewsData.reduce(
            (acc, review) => acc + review.rating,
            0
          );
          const avgRating =
            reviewsData.length > 0 ? totalRatings / reviewsData.length : 0;
          setAverageRating(avgRating);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [id]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const db = getFirestore();
      const details = {};

      for (const review of reviews) {
        if (!details[review.userId]) {
          try {
            const userDocRef = doc(db, "buyers", review.userId);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              details[review.userId] = userDoc.data();
            } else {
              details[review.userId] = { name: "Unknown User", avatar: null };
            }
          } catch (error) {
            console.error("Error fetching user details:", error);
          }
        }
      }
      setUserDetails(details);
    };

    fetchUserDetails();
  }, [reviews]);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return (
      <>
        {Array.from({ length: 5 }, (_, index) =>
          index < fullStars ? (
            <StarIcon key={index} sx={{ color: "#FFD700" }} />
          ) : index === fullStars && hasHalfStar ? (
            <StarIcon key={index} sx={{ color: "#FFD700" }} />
          ) : (
            <StarBorderIcon key={index} sx={{ color: "#FFD700" }} />
          )
        )}
      </>
    );
  };

  const fetchSimilarProducts = async () => {
    try {
      if (!product?.category) return;

      const productsRef = collection(db, "products");

      const q = query(
        productsRef,
        where("category", "==", product.category),
        limit(3)
      );

      const querySnapshot = await getDocs(q);

      const products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filteredProducts = products.filter(
        (productItem) => productItem.id !== id
      );

      setSimilarProducts(filteredProducts);
    } catch (error) {
      console.error("Error fetching similar products: ", error);
    }
  };

  useEffect(() => {
    if (product && product.category) {
      fetchSimilarProducts();
    }
  }, [product]);

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

            <input
              accept="image/*"
              style={{ display: "none" }}
              id="upload-images"
              type="file"
              multiple
              onChange={handleImageUpload}
            />
            <label htmlFor="upload-images">
              <Button
                startIcon={<CloudUploadIcon />}
                size="small"
                variant="outlined"
                component="span"
                sx={{ color: "#28a745", borderColor: "#28a745" }}
              >
                Upload Design
              </Button>
            </label>

            <div style={{ display: "flex", position: "relative" }}>
              {images.map((image, index) => (
                <div
                  key={index}
                  style={{ position: "relative", marginRight: 10 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.querySelector(
                      ".delete-icon"
                    ).style.opacity = 1;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.querySelector(
                      ".delete-icon"
                    ).style.opacity = 0;
                  }}
                >
                  <img
                    src={image}
                    alt={`img-${index}`}
                    style={{
                      width: 50,
                      height: 50,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                  <IconButton
                    className="delete-icon"
                    onClick={() => handleImageDelete(index)}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      color: "red",
                      opacity: 0,
                      transition: "opacity 0.2s",
                    }}
                    size="small"
                  >
                    <DeleteIcon fontSize="large" />
                  </IconButton>
                </div>
              ))}
            </div>

            <Box display="flex" alignItems="center" gap={2}>
              <Textarea
                name="Outlined"
                variant="outlined"
                minRows={4}
                maxRows={4}
                placeholder="Instructions"
                required
                size="md"
                value={instructions}
                onChange={handleInstructions}
                sx={{
                  "&::before": {
                    display: "none",
                  },
                  "&:focus-within": {
                    outline: "2px solid black",
                    outlineOffset: "2px",
                  },
                }}
              />
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

        <Box>
          <Box display="flex" alignItems="center" mt={4}>
            <Typography variant="h6" fontWeight="bold" sx={{ marginRight: 1 }}>
              Reviews and Ratings
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              {renderStars(averageRating)}
              <Typography
                variant="body2"
                fontWeight="bold"
                color="textSecondary"
              >
                ({averageRating.toFixed(1)})
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 1 }} />

          {reviews.length > 0 ? (
            reviews.map((review, index) => {
              const user = userDetails[review.userId] || {};
              return (
                <Box key={index} mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      src={user.avatar}
                      alt={user.name}
                      sx={{ width: 32, height: 32 }}
                    />
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color="textPrimary"
                      gutterBottom
                      sx={{ lineHeight: "1", textAlign: "center" }}
                    >
                      {user.name || "Loading..."}
                    </Typography>
                    {renderStars(review.rating)}
                  </Box>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      paddingLeft: "40px",
                    }}
                  >
                    {review.review}
                  </Typography>
                  <Divider sx={{ mt: 1 }} />
                </Box>
              );
            })
          ) : (
            <Typography variant="body2" color="textSecondary">
              No reviews yet.
            </Typography>
          )}
        </Box>

        <Box mt={4}>
          <Typography variant="h6" fontWeight="bold">
            More Like This
          </Typography>
          <Box display="flex" justifyContent="center" mt={4} mb={2}> 
            <Box display="flex" gap={4} flexWrap="wrap" justifyContent="center">
              {similarProducts.length > 0 ? (
                similarProducts.slice(0, 3).map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`}>
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
                          Rs. {product.productPrice}{" "}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <Typography variant="body1">
                  No similar products available.
                </Typography>
              )}
            </Box>
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
