"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebase";
import {
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import SellerNavbar from "@/app/components/SellerNavbar";

export default function SellerOrders() {
  const [loading, setLoading] = useState(true);
  const [pressName, setPressName] = useState("");
  const [orders, setOrders] = useState([]);
  const [productImages, setProductImages] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBuyerDetails, setSelectedBuyerDetails] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const sellerDoc = await getDoc(doc(db, "sellers", user.uid));
          if (sellerDoc.exists() && sellerDoc.data().role === "seller") {
            setPressName(sellerDoc.data().pressName);

            const sellerOrdersDoc = await getDoc(
              doc(db, "sellerOrders", user.uid)
            );
            if (sellerOrdersDoc.exists()) {
              const fetchedOrders = sellerOrdersDoc.data().orders || [];
              setOrders(fetchedOrders);

              const productImagePromises = fetchedOrders.flatMap((order) =>
                order.products.map(async (product) => {
                  if (!productImages[product.productId]) {
                    const productDoc = await getDoc(
                      doc(db, "products", product.productId)
                    );
                    if (productDoc.exists()) {
                      const images = productDoc.data().images || [];
                      return {
                        productId: product.productId,
                        image: images[0] || "",
                      };
                    }
                  }
                  return null;
                })
              );

              const resolvedImages = await Promise.all(productImagePromises);
              const imagesMap = resolvedImages.reduce((acc, item) => {
                if (item) acc[item.productId] = item.image;
                return acc;
              }, {});
              setProductImages((prev) => ({ ...prev, ...imagesMap }));
            }
            setLoading(false);
          } else {
            router.push("/login");
          }
        } catch (error) {
          console.error("Error fetching seller orders:", error);
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router, productImages]);

  const handleBuyerDetailsClick = (buyerDetails) => {
    setSelectedBuyerDetails(buyerDetails);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedBuyerDetails(null);
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
    <div className="bg-gray-100 min-h-screen">
      <SellerNavbar pressName={pressName} />
      <Box
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Orders
        </Typography>
        {orders.map((order, index) => (
          <Card
            key={order.orderId}
            sx={{ mb: 3, width: "100%", maxWidth: "600px" }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Order # {order.orderId}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Total Price:</strong> RS {order.totalOrderPrice}
              </Typography>
              <Typography
                sx={{
                  color: "#1976d2",
                  textTransform: "none",
                  mb: 2,
                  cursor: "pointer",
                  borderBottom: "1px solid #e0e0e0",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
                onClick={() => handleBuyerDetailsClick(order.buyerDetails)}
              >
                Buyer Details
              </Typography>
              <Box>
                {order.products.map((product, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      mb: 2,
                      borderBottom: "1px solid #e0e0e0",
                      pb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        mr: 2,
                        width: "100px",
                        height: "100px",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={productImages[product.productId] || ""}
                        alt={product.productName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {product.productName}
                      </Typography>
                      <Typography variant="body2">
                        Quantity: {product.quantity}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {product.instructions || "No specific instructions"}
                      </Typography>

                      <Box sx={{ display: "flex", mt: 1 }}>
                        {product.design.map((designUrl, i) => (
                          <Box
                            key={i}
                            sx={{ mr: 1, width: "50px", height: "50px" }}
                          >
                            <img
                              src={designUrl}
                              alt={`Design ${i + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Typography variant="subtitle2" color="textSecondary">
                <strong>Status</strong> {order.orderStatus}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Buyer Details</DialogTitle>
        <DialogContent>
          {selectedBuyerDetails ? (
            <DialogContentText>
              <strong>Name:</strong> {selectedBuyerDetails.name || "N/A"} <br />
              <strong>Contact Number:</strong>{" "}
              {selectedBuyerDetails.number || "N/A"} <br />
              <strong>City:</strong> {selectedBuyerDetails.city || "N/A"} <br />
              <strong>Postal Code:</strong>{" "}
              {selectedBuyerDetails.postalCode || "N/A"} <br />
              <strong>Address:</strong> {selectedBuyerDetails.address || "N/A"}{" "}
              <br />
              <strong>Payment Method:</strong>{" "}
              {selectedBuyerDetails.paymentMethod || "COD"}
            </DialogContentText>
          ) : (
            <DialogContentText>Buyer details not available.</DialogContentText>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
