"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  CircularProgress,
  Checkbox,
  IconButton,
  Typography,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import BuyerNavbar from "../components/BuyerNavbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CheckoutDialog from "../components/CheckoutDialog";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

export default function Cart() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [cartProducts, setCartProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCartAndProducts = async (user) => {
      try {
        const buyerDoc = await getDoc(doc(db, "buyers", user.uid));
        if (buyerDoc.exists() && buyerDoc.data().role === "buyer") {
          setName(buyerDoc.data().name);
          const cartDoc = await getDoc(doc(db, "cart", user.uid));

          if (cartDoc.exists()) {
            const cartItems = cartDoc.data().products || [];
            const enrichedProducts = await Promise.all(
              cartItems
                .filter((cartItem) => cartItem.status === "Pending")
                .map(async (cartItem) => {
                  const productDoc = await getDoc(
                    doc(db, "products", cartItem.productId)
                  );
                  if (productDoc.exists()) {
                    const productData = productDoc.data();
                    return {
                      ...cartItem,
                      productName: productData.productName,
                      productImage: productData.images?.[0] || "",
                      selected: false,
                    };
                  }
                  return {
                    ...cartItem,
                    productName: "Unknown Product",
                    productImage: "",
                    selected: false,
                  };
                })
            );
            setCartProducts(enrichedProducts);
          }
          setLoading(false);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching cart or product data:", error);
        router.push("/login");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchCartAndProducts(user);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const calculateSubtotal = () => {
    const total = cartProducts
      .filter((product) => product.selected)
      .reduce((sum, product) => sum + product.totalPrice, 0);
    setSubtotal(total);
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    setCartProducts((prev) => {
      const updatedProducts = prev.map((product) => ({
        ...product,
        selected: isChecked,
      }));
      const total = updatedProducts
        .filter((product) => product.selected)
        .reduce((sum, product) => sum + product.totalPrice, 0);
      setSubtotal(total);
      return updatedProducts;
    });
  };

  const handleProductSelect = (index) => {
    const updatedProducts = [...cartProducts];
    updatedProducts[index].selected = !updatedProducts[index].selected;

    const allSelected = updatedProducts.every((product) => product.selected);
    setSelectAll(allSelected);

    setCartProducts(updatedProducts);
    calculateSubtotal();
  };

  const handleOpenDialog = (index) => {
    setProductToDelete(index);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setProductToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete === null) return;

    const updatedProducts = [...cartProducts];
    updatedProducts.splice(productToDelete, 1);
    setCartProducts(updatedProducts);

    const user = auth.currentUser;
    if (user) {
      const cartRef = doc(db, "cart", user.uid);
      try {
        await updateDoc(cartRef, { products: updatedProducts });
        toast.success("Product removed from cart!");
      } catch (error) {
        console.error("Error deleting product from cart:", error);
        toast.error("Failed to remove product from cart.");
      }
    }

    setDialogOpen(false);
    setProductToDelete(null);
    calculateSubtotal();
  };

  const handleCheckoutClick = () => {
    if (subtotal === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    setCheckoutOpen(true);
  };

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
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <BuyerNavbar name={name} />
      <div className="lg:pt-[5%] pt-[20%] md:pt-[10%] flex-grow w-full max-w-4xl p-6 mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button
            startIcon={<ArrowBackIosIcon />}
            onClick={() => router.push("/products")}
            sx={{
              fontWeight: "bold",
              textTransform: "none",
              color: "black",
              display: { xs: "flex", sm: "inline-flex" },
              justifyContent: "center",
              alignItems: "center",
              "& .MuiButton-startIcon": {
                margin: { xs: 0, sm: "0 4px" },
              },
              fontSize: { xs: "0", sm: "1rem" },
              minWidth: "auto",
            }}
          >
            Continue Shopping
          </Button>
          <Typography
            variant="h4"
            className="text-center"
            fontWeight="bold"
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
            }}
          >
            Your Cart
          </Typography>
        </div>

        <div className="flex items-center mb-4">
          <Checkbox checked={selectAll} onChange={handleSelectAll} />
          <Typography variant="body1">Select All</Typography>
        </div>
        <hr className="mb-4" />
        <div>
          {Array.isArray(cartProducts) &&
            cartProducts.map((product, index) => (
              <div key={index} className="mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
                  <Checkbox
                    checked={product.selected}
                    onChange={() => handleProductSelect(index)}
                  />
                  <div className="flex-grow flex items-center">
                    <img
                      src={product.productImage}
                      alt="Product"
                      className="w-20 h-20 object-cover mr-4"
                    />
                    <div className="flex-grow">
                      <Link href={`/products/${product.productId}`}>
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          sx={{
                            textDecorationColor: "inherit",
                            cursor: "pointer",
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          }}
                        >
                          {product.productName}
                        </Typography>
                      </Link>
                      <div
                        style={{
                          marginBottom: "1rem",
                          width: "200px",
                          marginTop: "1rem",
                        }}
                      >
                        <TextField
                          label="Quantity"
                          type="number"
                          value={product.quantity}
                          InputProps={{ readOnly: true }}
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
                      </div>
                      <div style={{ marginBottom: "1rem", width: "300px" }}>
                        <TextField
                          label="Instructions"
                          value={product.instructions}
                          InputProps={{ readOnly: true }}
                          multiline
                          rows={3}
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
                      </div>
                      <div className="flex mt-2">
                        {product.design.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt={`Design ${i + 1}`}
                            className="mr-2"
                            style={{
                              width: 50,
                              height: 50,
                              objectFit: "cover",
                              borderRadius: 4,
                            }}
                          />
                        ))}
                      </div>
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        sx={{ marginTop: "5px" }}
                      >
                        RS {product.totalPrice}
                      </Typography>
                    </div>
                  </div>
                  <div className="self-start sm:self-center sm:ml-4 mt-4 sm:mt-0">
                    <IconButton onClick={() => handleOpenDialog(index)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </div>
                </div>
                <hr />
              </div>
            ))}
        </div>

        {cartProducts.length === 0 && (
          <Typography variant="body1" className="text-center text-gray-500">
            Your cart is empty.
          </Typography>
        )}

        <div className="flex justify-between items-center mt-6">
          <Typography variant="h6" fontWeight="bold">
            Subtotal: RS {subtotal}
          </Typography>
          <Button
            variant="contained"
            disabled={subtotal === 0}
            onClick={handleCheckoutClick}
            sx={{
              fontWeight: "bold",
              backgroundColor: "#28a745",
              "&:hover": {
                backgroundColor: "#218838",
              },
            }}
          >
            Check Out
          </Button>

          <CheckoutDialog
            open={checkoutOpen}
            onClose={(updatedCart) => {
              setCheckoutOpen(false);
              if (Array.isArray(updatedCart)) {
                const clearedSelection = updatedCart.map((item) => ({
                  ...item,
                  selected: false,
                }));
                setCartProducts(clearedSelection);
              }
              setSelectAll(false);
              setSubtotal(0);
            }}
            cartProducts={cartProducts}
            selectedProducts={cartProducts.filter(
              (product) => product.selected
            )}
            subtotal={subtotal}
          />
        </div>
      </div>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Remove Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to remove this product from your cart?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            color="success"
            sx={{ fontWeight: "bold" }}
          >
            No
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            autoFocus
            sx={{ fontWeight: "bold" }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={true}
      />
      <hr />
      <Footer />
    </div>
  );
}
