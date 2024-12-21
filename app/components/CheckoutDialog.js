"use client";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { doc, setDoc, arrayUnion, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { auth, db } from "../../firebase";

export default function CheckoutDialog({
  open,
  onClose,
  cartProducts,
  selectedProducts,
  subtotal,
}) {
  const [buyerDetails, setBuyerDetails] = useState({
    name: "",
    number: "",
    city: "",
    postalCode: "",
    address: "",
    paymentMethod: "COD",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBuyerDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("User not authenticated!");
      return;
    }

    if (
      !buyerDetails.name ||
      !buyerDetails.number ||
      !buyerDetails.city ||
      !buyerDetails.postalCode ||
      !buyerDetails.address
    ) {
      toast.error("Please fill in all the buyer details!");
      return;
    }

    try {
      const orderId = Date.now().toString();

      const orderData = {
        orderId,
        buyerDetails: {
          name: buyerDetails.name || "N/A",
          number: buyerDetails.number || "N/A",
          city: buyerDetails.city || "N/A",
          postalCode: buyerDetails.postalCode || "N/A",
          address: buyerDetails.address || "N/A",
          paymentMethod: buyerDetails.paymentMethod || "COD",
        },
        products: selectedProducts.map((product) => ({
          productId: product.productId || "unknown",
          productName: product.productName || "unknown",
          quantity: product.quantity || 0,
          totalPrice: product.totalPrice || 0,
          design: product.design || [],
          instructions: product.instructions || "No instructions",
          sellerId: product.sellerID || "unknown",
        })),
        totalOrderPrice: subtotal || 0,
        orderStatus: "pending",
        orderDate: new Date(),
      };

      console.log("Order Data:", orderData);

      const orderRef = doc(db, "orders", user.uid, "userOrders", orderId);
      await setDoc(orderRef, orderData);

      const sellerOrders = {};
      selectedProducts.forEach((product) => {
        const { sellerID } = product;
        if (!sellerOrders[sellerID]) {
          sellerOrders[sellerID] = [];
        }
        sellerOrders[sellerID].push({
          buyerDetails: {
            name: buyerDetails.name || "N/A",
            number: buyerDetails.number || "N/A",
            city: buyerDetails.city || "N/A",
            postalCode: buyerDetails.postalCode || "N/A",
            address: buyerDetails.address || "N/A",
            paymentMethod: buyerDetails.paymentMethod || "COD",
          },
          orderId,
          productId: product.productId || "unknown",
          productName: product.productName || "unknown",
          quantity: product.quantity || 0,
          totalPrice: product.totalPrice || 0,
          design: product.design || [],
          instructions: product.instructions || "No instructions",
          buyerId: user.uid,
          orderDate: new Date(),
        });
      });

      for (const sellerID in sellerOrders) {
        const sellerOrdersRef = doc(db, "sellerOrders", sellerID);
        await setDoc(
          sellerOrdersRef,
          {
            orders: arrayUnion(...sellerOrders[sellerID]),
          },
          { merge: true }
        );
      }

      const cartRef = doc(db, "cart", user.uid);

      const remainingCartProducts = cartProducts.filter(
        (product) =>
          !selectedProducts.some(
            (selected) => selected.productId === product.productId
          )
      );

      await updateDoc(cartRef, { products: remainingCartProducts });

      onClose(remainingCartProducts);

      toast.success("Order placed successfully!");
      onClose();
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Order</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Your subtotal is: <strong>RS {subtotal}</strong>. Please enter your
          details to proceed.
        </Typography>
        <TextField
          label="Name"
          name="name"
          value={buyerDetails.name}
          onChange={handleInputChange}
          fullWidth
          margin="dense"
        />
        <TextField
          label="Phone Number"
          name="number"
          value={buyerDetails.number}
          onChange={handleInputChange}
          fullWidth
          margin="dense"
        />
        <TextField
          label="City"
          name="city"
          value={buyerDetails.city}
          onChange={handleInputChange}
          fullWidth
          margin="dense"
        />
        <TextField
          label="Postal Code"
          name="postalCode"
          value={buyerDetails.postalCode}
          onChange={handleInputChange}
          fullWidth
          margin="dense"
        />
        <TextField
          label="Address"
          name="address"
          value={buyerDetails.address}
          onChange={handleInputChange}
          fullWidth
          margin="dense"
          multiline
          rows={2}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error" sx={{ fontWeight: "bold" }}>
          Cancel
        </Button>
        <Button
          onClick={handlePlaceOrder}
          color="success"
          sx={{ fontWeight: "bold" }}
        >
          Place Order
        </Button>
      </DialogActions>
    </Dialog>
  );
}
