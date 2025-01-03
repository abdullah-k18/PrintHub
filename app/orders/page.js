"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, collection, getDocs, getDoc } from "firebase/firestore";
import {
  CircularProgress,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Divider,
  Box,
} from "@mui/material";
import BuyerNavbar from "../components/BuyerNavbar";
import Footer from "../components/Footer";

export default function Orders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
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

            const ordersSnapshot = await getDocs(
              collection(db, "orders", user.uid, "userOrders")
            );

            const ordersData = await Promise.all(
              ordersSnapshot.docs.map(async (orderDoc) => {
                const order = orderDoc.data();

                const productsWithImages = await Promise.all(
                  order.products.map(async (product) => {
                    const productDoc = await getDoc(
                      doc(db, "products", product.productId)
                    );

                    if (productDoc.exists()) {
                      return {
                        ...product,
                        image: productDoc.data().images[0],
                      };
                    }

                    return { ...product, image: "" };
                  })
                );

                return { ...order, products: productsWithImages };
              })
            );

            setOrders(ordersData);
            setLoading(false);
          } else if (sellerDoc.exists() && sellerDoc.data().role === "seller") {
            router.push("/login");
          } else {
            router.push("/login");
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

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

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={50} sx={{ color: "#28a745" }} />
      </Box>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <BuyerNavbar name={name} />

      <div className="flex-grow mt-[20%] lg:mt-[5%] pl-2 pr-2">
        <Box>
          {orders.map((order) => (
            <Card
              key={order.orderId}
              sx={{ mb: 4, boxShadow: 3, maxWidth: "1000px", mx: "auto" }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Order # {order.orderId}
                </Typography>

                {order.products.map((product, index) => (
                  <div key={index}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <CardMedia
                        component="img"
                        image={product.image || "/placeholder.png"}
                        alt={product.productName}
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: 1,
                          mr: 2,
                          objectFit: "cover",
                        }}
                      />

                      <Box sx={{ flexGrow: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            {product.productName}
                          </Typography>

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
                                backgroundColor: getStatusColor(
                                  product.orderStatus
                                ),
                                mr: 1,
                              }}
                            />
                            <Typography
                              variant="subtitle2"
                              color="textSecondary"
                            >
                              {product.orderStatus}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2">
                          Quantity: {product.quantity}
                        </Typography>
                        <Typography variant="body2">
                          Price: Rs. {product.totalPrice}
                        </Typography>
                      </Box>
                    </Box>

                    {index < order.products.length - 1 && (
                      <Divider sx={{ my: 2 }} />
                    )}
                  </div>
                ))}

                <Divider sx={{ my: 2 }} />

                <Typography
                  variant="subtitle1"
                  sx={{ textAlign: "right", fontWeight: "bold" }}
                >
                  Total Price: Rs. {order.totalOrderPrice}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </div>

      <hr />

      <Footer />
    </div>
  );
}
