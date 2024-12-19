"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { CircularProgress, Checkbox, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import BuyerNavbar from "../components/BuyerNavbar";
import Footer from "@/app/components/Footer";

export default function Cart() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [cartProducts, setCartProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
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
              cartItems.map(async (cartItem) => {
                const productDoc = await getDoc(doc(db, "products", cartItem.productId));
                if (productDoc.exists()) {
                  const productData = productDoc.data();
                  return {
                    ...cartItem,
                    productName: productData.productName,
                    productImage: productData.images?.[0] || "",
                  };
                }
                return { ...cartItem, productName: "Unknown Product", productImage: "" };
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

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
  };

  const handleDelete = async (index) => {
    const updatedProducts = [...cartProducts];
    updatedProducts.splice(index, 1);
    setCartProducts(updatedProducts);

    const user = auth.currentUser;
    if (user) {
      const cartRef = doc(db, "cart", user.uid);
      try {
        await updateDoc(cartRef, { products: updatedProducts });
      } catch (error) {
        console.error("Error deleting product from cart:", error);
      }
    }
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
    <div className="bg-gray-100 min-h-screen flex flex-col items-center">
      <BuyerNavbar name={name} />
      <div className="mt-[10%] lg:mt-[3%] w-full max-w-4xl p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Your Cart</h1>
        <div className="flex items-center mb-4">
          <Checkbox checked={selectAll} onChange={handleSelectAll} />
          <span>Select All</span>
        </div>
        <hr className="mb-4" />
        <div>
          {cartProducts.map((product, index) => (
            <div key={index} className="mb-4">
              <div className="flex items-start mb-4">
                <Checkbox checked={selectAll} />
                <div className="flex-grow flex items-center">
                  <img
                    src={product.productImage}
                    alt="Product"
                    className="w-20 h-20 object-cover mr-4"
                  />
                  <div className="flex-grow">
                    <p className="font-semibold">{product.productName}</p>
                    <p>Quantity: {product.quantity}</p>
                    <p>Instructions: {product.instructions}</p>
                    <p>Total Price: RS {product.totalPrice}</p>
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
                  </div>
                </div>
                <IconButton onClick={() => handleDelete(index)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </div>
              <hr />
            </div>
          ))}
        </div>

        {cartProducts.length === 0 && (
          <p className="text-center text-gray-500">Your cart is empty.</p>
        )}
      </div>

      <hr />

      <Footer />
    </div>
  );
}
