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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Select,
  MenuItem,
  IconButton,
  FormControl,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import SellerNavbar from "@/app/components/SellerNavbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Download } from "yet-another-react-lightbox/plugins";
import FormHelperText from "@mui/material/FormHelperText";

export default function SellerOrders() {
  const [loading, setLoading] = useState(true);
  const [pressName, setPressName] = useState("");
  const [orders, setOrders] = useState([]);
  const [productImages, setProductImages] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedBuyerDetails, setSelectedBuyerDetails] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newStatus, setNewStatus] = useState("");
  const [filterStatus, setFilterStatus] = useState("Pending");
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

  const handleEditStatusClick = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setStatusDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleStatusChange = async () => {
    if (selectedOrder) {
      try {
        const updatedOrders = orders.map((order) =>
          order.orderId === selectedOrder.orderId
            ? { ...order, orderStatus: newStatus }
            : order
        );
        setOrders(updatedOrders);

        await updateDoc(doc(db, "sellerOrders", auth.currentUser.uid), {
          orders: updatedOrders,
        });

        const buyerOrderRef = doc(
          db,
          "orders",
          selectedOrder.buyerId,
          "userOrders",
          selectedOrder.orderId
        );

        const buyerOrderDoc = await getDoc(buyerOrderRef);
        if (buyerOrderDoc.exists()) {
          const buyerOrderData = buyerOrderDoc.data();
          const updatedProducts = buyerOrderData.products.map((product) => {
            if (product.productId === selectedOrder.products[0].productId) {
              return { ...product, orderStatus: newStatus };
            }
            return product;
          });

          await updateDoc(buyerOrderRef, {
            products: updatedProducts,
          });
        }

        toast.success("Status Updated Successfully", {
          position: "bottom-right",
          autoClose: 3000,
        });

        handleCloseStatusDialog();
      } catch (error) {
        console.error("Error updating order status:", error);
      }
    }
  };

  const handleOpenLightbox = (index) => {
    setCurrentIndex(index);
    setOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "gray";
      case "Processing":
        return "orange";
      case "Out for Delivery":
        return "yellow";
      case "Delivered":
        return "green";
      case "Cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
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
      <div className="pt-[80px]">
        <Box
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            maxWidth: "1000px",
            width: "100%",
            margin: "0 auto",
          }}
        >
          <FormControl
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
          >
            <Select
              value={filterStatus}
              onChange={handleFilterChange}
              sx={{
                mb: 1,
                width: "160px",
              }}
              size="small"
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Processing">Processing</MenuItem>
              <MenuItem value="Out for Delivery">Out for Delivery</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <FormHelperText sx={{ mb: 3 }}>Order Status</FormHelperText>

          {orders.filter((order) =>
            filterStatus === "All" ? true : order.orderStatus === filterStatus
          ).length > 0 ? (
            orders
              .filter((order) =>
                filterStatus === "All"
                  ? true
                  : order.orderStatus === filterStatus
              )
              .map((order, index) => (
                <Card
                  key={order.orderId}
                  sx={{ mb: 3, width: "100%", maxWidth: "1000px" }}
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
                      onClick={() =>
                        handleBuyerDetailsClick(order.buyerDetails)
                      }
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
                              {product.instructions ||
                                "No specific instructions"}
                            </Typography>
                            <>
                              <Box sx={{ display: "flex", mt: 1 }}>
                                {product.design.map((designUrl, i) => (
                                  <Box
                                    key={i}
                                    sx={{
                                      mr: 1,
                                      width: "50px",
                                      height: "50px",
                                    }}
                                    onClick={() => handleOpenLightbox(i)}
                                  >
                                    <img
                                      src={designUrl}
                                      alt={`Design ${i + 1}`}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                      }}
                                    />
                                  </Box>
                                ))}
                              </Box>

                              <Lightbox
                                open={open}
                                close={() => setOpen(false)}
                                currentIndex={currentIndex}
                                slides={product.design.map((src) => ({
                                  src,
                                  alt: "Product design",
                                  width: 3840,
                                  height: 2560,
                                  srcSet: [
                                    { src, width: 320, height: 213 },
                                    { src, width: 640, height: 427 },
                                    { src, width: 1200, height: 800 },
                                    { src, width: 2048, height: 1365 },
                                    { src, width: 3840, height: 2560 },
                                  ],
                                  download: src,
                                }))}
                                plugins={[Download]}
                              />
                            </>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: getStatusColor(order.orderStatus),
                            mr: 1,
                          }}
                        />

                        <Typography variant="subtitle2" color="textSecondary">
                          {order.orderStatus}
                        </Typography>
                      </Box>

                      <IconButton
                        sx={{
                          backgroundColor: "#28a745",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "#1e7e34",
                          },
                        }}
                        onClick={() => handleEditStatusClick(order)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                textAlign: "center",
              }}
            >
              <Typography variant="subtitle1" color="textSecondary">
                No orders with the &quot;{filterStatus}&quot; status.
              </Typography>
            </Box>
          )}
        </Box>

        <Dialog open={dialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>Buyer Details</DialogTitle>
          <DialogContent>
            {selectedBuyerDetails ? (
              <DialogContentText>
                <strong>Name:</strong> {selectedBuyerDetails.name || "N/A"}{" "}
                <br />
                <strong>Contact Number:</strong>{" "}
                {selectedBuyerDetails.number || "N/A"} <br />
                <strong>City:</strong> {selectedBuyerDetails.city || "N/A"}{" "}
                <br />
                <strong>Postal Code:</strong>{" "}
                {selectedBuyerDetails.postalCode || "N/A"} <br />
                <strong>Address:</strong>{" "}
                {selectedBuyerDetails.address || "N/A"} <br />
                <strong>Payment Method:</strong>{" "}
                {selectedBuyerDetails.paymentMethod || "COD"}
              </DialogContentText>
            ) : (
              <DialogContentText>
                Buyer details not available.
              </DialogContentText>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog}>
          <DialogTitle>Change Order Status</DialogTitle>
          <DialogContent>
            <FormControl
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
            >
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                sx={{ width: "160px" }}
                size="small"
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Processing">Processing</MenuItem>
                <MenuItem value="Out for Delivery">Out for Delivery</MenuItem>
                <MenuItem value="Delivered">Delivered</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseStatusDialog}
              color="error"
              sx={{ fontWeight: "bold" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusChange}
              color="success"
              sx={{ fontWeight: "bold" }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={true}
          closeOnClick
          pauseOnHover
          draggable
        />
      </div>
    </div>
  );
}
