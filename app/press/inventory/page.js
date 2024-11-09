"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, onSnapshot, deleteDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { auth, db, storage } from "../../../firebase";
import SellerNavbar from "@/app/components/SellerNavbar";
import {
  CircularProgress,
  Fab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddProductDialog from "@/app/components/AddProductDialog";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DeleteProductDialog from "@/app/components/DeleteProductDialog";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Inventory() {
  const [loading, setLoading] = useState(true);
  const [pressName, setPressName] = useState(null);
  const [products, setProducts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [imageIndex, setImageIndex] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const sellerDoc = await getDoc(doc(db, "sellers", currentUser.uid));
  
          if (sellerDoc.exists() && sellerDoc.data().role === "seller") {
            const sellerData = sellerDoc.data();
            setPressName(sellerData.pressName);
            setLoading(false);
  
            const q = query(
              collection(db, "products"),
              where("uid", "==", currentUser.uid)
            );
            const unsubscribeProducts = onSnapshot(q, (querySnapshot) => {
              const productsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              setProducts(productsData);
            });
  
            return () => unsubscribeProducts();
          } else {
            router.push("/login");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    });
  
    return () => unsubscribe();
  }, [router]);
  

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleAddItem = () => {
    console.log("Item added");
    setDialogOpen(false);
  };

  const handleNextImage = (productId, totalImages) => {
    setImageIndex((prevIndex) => ({
      ...prevIndex,
      [productId]: ((prevIndex[productId] || 0) + 1) % totalImages,
    }));
  };

  const handlePrevImage = (productId, totalImages) => {
    setImageIndex((prevIndex) => ({
      ...prevIndex,
      [productId]: (prevIndex[productId] - 1 + totalImages) % totalImages,
    }));
  };

  const handleClickImage = (imageUrl) => {
    window.open(imageUrl, "_blank");
  };

  const handleDeleteClick = (productId) => {
    setSelectedProduct(productId);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setSelectedProduct(null);
  };
  
  const handleDeleteConfirm = async () => {
    if (selectedProduct) {
      try {
        const productToDelete = products.find((product) => product.id === selectedProduct);
        
        if (productToDelete && productToDelete.images && productToDelete.images.length > 0) {
          const deletePromises = productToDelete.images.map((imageUrl) => {
            const imageRef = ref(storage, imageUrl);
            return deleteObject(imageRef);
          });
  
          await Promise.all(deletePromises);
        }
  
        await deleteDoc(doc(db, "products", selectedProduct));
        toast.success('Product removed successfully from the inventory!');
        setDeleteDialogOpen(false);
        setSelectedProduct(null);
      } catch (error) {
        toast.error('Failed to remove the product from inventory. Please try again.');
        console.error("Error deleting product and images: ", error);
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
    <div className="bg-gray-100 min-h-screen">
      <SellerNavbar pressName={pressName} />
      <div className="pt-[80px] pl-4 pr-4 pb-[40px]">
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ borderRight: "1px solid #ccc", fontWeight: "bolder", fontSize: "16px", textAlign: "center" }}>Product Images</TableCell>
                <TableCell sx={{ borderRight: "1px solid #ccc", fontWeight: "bolder", fontSize: "16px", textAlign: "center" }}>Product Name</TableCell>
                <TableCell sx={{ borderRight: "1px solid #ccc", fontWeight: "bolder", fontSize: "16px", textAlign: "center" }}>Description</TableCell>
                <TableCell sx={{ borderRight: "1px solid #ccc", fontWeight: "bolder", fontSize: "16px", textAlign: "center" }}>Quantity</TableCell>
                <TableCell sx={{ borderRight: "1px solid #ccc", fontWeight: "bolder", fontSize: "16px", textAlign: "center" }}>Min Printing Quantity</TableCell>
                <TableCell sx={{ borderRight: "1px solid #ccc", fontWeight: "bolder", fontSize: "16px", textAlign: "center" }}>Category</TableCell>
                <TableCell sx={{ borderRight: "1px solid #ccc", fontWeight: "bolder", fontSize: "16px", textAlign: "center" }}>Price</TableCell>
                <TableCell sx={{ fontWeight: "bolder", fontSize: "16px", textAlign: "center" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No products in inventory
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell sx={{ borderRight: "1px solid #ccc", textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {product.images && product.images.length > 1 && (
                          <IconButton
                            onClick={() => handlePrevImage(product.id, product.images.length)}
                          >
                            <ArrowBackIosIcon />
                          </IconButton>
                        )}
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[imageIndex[product.id] || 0]}
                            alt={product.productName}
                            style={{ width: 50, height: 50, borderRadius: 4, cursor: "pointer" }}
                            onClick={() => handleClickImage(product.images[imageIndex[product.id] || 0])}
                          />
                        ) : (
                          "No Image"
                        )}
                        {product.images && product.images.length > 1 && (
                          <IconButton
                            onClick={() => handleNextImage(product.id, product.images.length)}
                          >
                            <ArrowForwardIosIcon />
                          </IconButton>
                        )}
                      </div>
                    </TableCell>
                    <TableCell sx={{ borderRight: "1px solid #ccc", textAlign: "center" }}>{product.productName}</TableCell>
                    <TableCell sx={{ borderRight: "1px solid #ccc", textAlign: "center" }}>{product.productDescription}</TableCell>
                    <TableCell sx={{ borderRight: "1px solid #ccc", textAlign: "center" }}>{product.inventoryQuantity}</TableCell>
                    <TableCell sx={{ borderRight: "1px solid #ccc", textAlign: "center" }}>{product.minimumPrintingQuantity}</TableCell>
                    <TableCell sx={{ borderRight: "1px solid #ccc", textAlign: "center" }}>{product.category}</TableCell>
                    <TableCell sx={{ borderRight: "1px solid #ccc", textAlign: "center" }}>{`${product.productPrice} RS/item`}</TableCell>
                    <TableCell sx={{ textAlign: "center", verticalAlign: "middle" }}>
                      <IconButton>
                        <EditIcon sx={{ color: "green" }} />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(product.id)}>
                        <DeleteIcon sx={{ color: "red" }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <Fab
        color="primary"
        aria-label="add"
        onClick={handleDialogOpen}
        sx={{
          position: "fixed",
          bottom: 50,
          right: 50,
          backgroundColor: "#28a745",
          "&:hover": {
            backgroundColor: "#218838",
          },
        }}
      >
        <AddIcon />
      </Fab>

      {user && (
        <AddProductDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          onAdd={handleAddItem}
          uid={user.uid}
        />
      )}

      <DeleteProductDialog
        open={deleteDialogOpen}
        onClose={handleDeleteClose}
        onDelete={handleDeleteConfirm}
      />
    </div>
  );
}
