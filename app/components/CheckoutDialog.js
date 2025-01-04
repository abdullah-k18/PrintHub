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
import { doc, setDoc, arrayUnion, updateDoc, getDoc } from "firebase/firestore";
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
      const inventoryErrors = [];
      for (const product of selectedProducts) {
        const productDocRef = doc(db, "products", product.productId);
        const productDoc = await getDoc(productDocRef);

        if (!productDoc.exists()) {
          inventoryErrors.push(
            `Product with ID ${product.productId} not found.`
          );
          continue;
        }

        const productData = productDoc.data();

        if (productData.inventoryQuantity === 0) {
          inventoryErrors.push(
            `${product.productName || "Product"} is out of stock.`
          );
          continue;
        }

        if (product.quantity > productData.inventoryQuantity) {
          inventoryErrors.push(
            `Can't proceed with the quantity for ${
              product.productName || "Product"
            }. Only ${
              productData.inventoryQuantity
            } products left in inventory.`
          );
        }
      }

      if (inventoryErrors.length > 0) {
        inventoryErrors.forEach((error) =>
          toast.error(error, { position: "bottom-right" })
        );
        return;
      }

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
          orderStatus: "pending",
        })),
        totalOrderPrice: subtotal || 0,
        orderDate: new Date(),
      };

      console.log("Order Data:", orderData);

      const orderRef = doc(db, "orders", user.uid, "userOrders", orderId);
      await setDoc(orderRef, orderData);

      const sellerOrders = {};
      selectedProducts.forEach((product) => {
        const { sellerID } = product;

        if (!sellerOrders[sellerID]) {
          sellerOrders[sellerID] = {
            orderId,
            buyerDetails: {
              name: buyerDetails.name || "N/A",
              number: buyerDetails.number || "N/A",
              city: buyerDetails.city || "N/A",
              postalCode: buyerDetails.postalCode || "N/A",
              address: buyerDetails.address || "N/A",
              paymentMethod: buyerDetails.paymentMethod || "COD",
            },
            products: [],
            totalOrderPrice: 0,
            orderDate: new Date(),
            orderStatus: "pending",
            buyerId: user.uid,
          };
        }

        sellerOrders[sellerID].products.push({
          productId: product.productId || "unknown",
          productName: product.productName || "unknown",
          quantity: product.quantity || 0,
          totalPrice: product.totalPrice || 0,
          design: product.design || [],
          instructions: product.instructions || "No instructions",
          orderStatus: "pending",
        });

        sellerOrders[sellerID].totalOrderPrice += product.totalPrice || 0;
      });

      for (const sellerID in sellerOrders) {
        const sellerOrdersRef = doc(db, "sellerOrders", sellerID);
        await setDoc(
          sellerOrdersRef,
          {
            orders: arrayUnion(sellerOrders[sellerID]),
          },
          { merge: true }
        );
      }

      for (const product of selectedProducts) {
        const productDocRef = doc(db, "products", product.productId);
        const productDoc = await getDoc(productDocRef);
  
        if (productDoc.exists()) {
          const productData = productDoc.data();
          const newInventoryQuantity =
            productData.inventoryQuantity - product.quantity;
  
          await updateDoc(productDocRef, {
            inventoryQuantity: newInventoryQuantity,
          });
        }
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
        <TextField
          label="Phone Number"
          name="number"
          value={buyerDetails.number}
          onChange={handleInputChange}
          fullWidth
          margin="dense"
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
        <TextField
          label="City"
          name="city"
          value={buyerDetails.city}
          onChange={handleInputChange}
          fullWidth
          margin="dense"
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
        <TextField
          label="Postal Code"
          name="postalCode"
          value={buyerDetails.postalCode}
          onChange={handleInputChange}
          fullWidth
          margin="dense"
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
        <TextField
          label="Address"
          name="address"
          value={buyerDetails.address}
          onChange={handleInputChange}
          fullWidth
          margin="dense"
          multiline
          rows={2}
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
