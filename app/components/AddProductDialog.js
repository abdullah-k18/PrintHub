import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import { db, storage } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddProductDialog({ open, onClose, onAdd, uid }) {
  const categories = [
    "Business Essentials",
    "Marketing Materials",
    "Stationery",
    "Packaging Materials",
    "Event Materials",
    "Apparel / Clothing",
    "Personalized Items",
    "Others",
  ];

  const [category, setCategory] = useState("");
  const [images, setImages] = useState([]);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [inventoryQuantity, setInventoryQuantity] = useState("");
  const [minimumPrintingQuantity, setMinimumPrintingQuantity] = useState("");
  const [productPrice, setProductPrice] = useState("");

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  const handleImageDelete = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setProductName("");
    setProductDescription("");
    setInventoryQuantity("");
    setMinimumPrintingQuantity("");
    setCategory("");
    setProductPrice("");
    setImages([]);
  };

  const handleAddProduct = async () => {
    if (category === "") {
        toast.error("Please select a category before adding the product.");
        return;
      }

    if (images.length === 0) {
      toast.error(
        "Please upload at least one image before adding the product."
      );
      return;
    }

    const imageUrls = [];

    await Promise.all(
      images.map(async (image, index) => {
        const file = image.file;
        const uniqueFileName = `product-${Date.now()}-${index + 1}-${
          file.name
        }`;
        const storageRef = ref(storage, `products/${uniqueFileName}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        imageUrls.push(downloadURL);
      })
    );

    const productData = {
      uid,
      productName,
      productDescription,
      inventoryQuantity: Number(inventoryQuantity),
      minimumPrintingQuantity: Number(minimumPrintingQuantity),
      category,
      productPrice: Number(productPrice),
      images: imageUrls,
    };

    try {
      await addDoc(collection(db, "products"), productData);
      resetForm();
      toast.success("Product added successfully!");
      onAdd();
      onClose();
    } catch (error) {
      toast.error(`Error adding product: ${error.message}`);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="productName"
            label="Product Name"
            type="text"
            fullWidth
            variant="outlined"
            required
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            InputLabelProps={{
              sx: {
                "&.Mui-focused": {
                  color: "black",
                },
              },
            }}
            sx={{
              mb: 3,
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
            margin="dense"
            id="productDescription"
            label="Product Description"
            type="text"
            fullWidth
            variant="outlined"
            required
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            InputLabelProps={{
              sx: {
                "&.Mui-focused": {
                  color: "black",
                },
              },
            }}
            sx={{
              mb: 3,
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
            margin="dense"
            id="inventoryQuantity"
            label="Inventory Quantity"
            type="number"
            fullWidth
            variant="outlined"
            required
            value={inventoryQuantity}
            onChange={(e) => setInventoryQuantity(e.target.value)}
            InputLabelProps={{
              sx: {
                "&.Mui-focused": {
                  color: "black",
                },
              },
            }}
            sx={{
              mb: 3,
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
            margin="dense"
            id="minimumPrintingQuantity"
            label="Minimum Printing Quantity"
            type="number"
            fullWidth
            variant="outlined"
            required
            value={minimumPrintingQuantity}
            onChange={(e) => setMinimumPrintingQuantity(e.target.value)}
            InputLabelProps={{
              sx: {
                "&.Mui-focused": {
                  color: "black",
                },
              },
            }}
            sx={{
              mb: 3,
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
          <FormControl
            fullWidth
            required
            sx={{
              mb: 3,
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
            <InputLabel
              id="category-label"
              sx={{
                "&.Mui-focused": {
                  color: "black",
                },
              }}
            >
              Select Category
            </InputLabel>
            <Select
              labelId="category-label"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              displayEmpty
              fullWidth
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            id="productPrice"
            label="Price per Item"
            type="number"
            fullWidth
            variant="outlined"
            required
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            InputLabelProps={{
              sx: {
                "&.Mui-focused": {
                  color: "black",
                },
              },
            }}
            sx={{
              mb: 3,
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
              Upload Images
            </Button>
          </label>

          <div style={{ display: "flex", marginTop: 10, position: "relative" }}>
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
                  src={image.url}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="contained" color="error">
            Cancel
          </Button>
          <Button
            onClick={handleAddProduct}
            variant="contained"
            color="success"
          >
            Add
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
    </>
  );
}
