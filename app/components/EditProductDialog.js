import { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { doc, updateDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../../firebase";
import { toast } from "react-toastify";

export default function EditProductDialog({ open, onClose, product, onSave }) {
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

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [inventoryQuantity, setInventoryQuantity] = useState(0);
  const [minimumPrintingQuantity, setMinimumPrintingQuantity] = useState(0);
  const [category, setCategory] = useState("");
  const [productPrice, setProductPrice] = useState(0);
  const [images, setImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);

  useEffect(() => {
    if (product) {
      setProductName(product.productName || "");
      setProductDescription(product.productDescription || "");
      setInventoryQuantity(product.inventoryQuantity || 0);
      setMinimumPrintingQuantity(product.minimumPrintingQuantity || 0);
      setCategory(product.category || "");
      setProductPrice(product.productPrice || 0);
      setImages(product.images || []);
      setDeletedImages([]);
    }
  }, [product]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  const handleImageDelete = (index) => {
    const imageToDelete = images[index];
    if (!imageToDelete.file) {
      setDeletedImages((prev) => [...prev, imageToDelete]);
    }
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (
      !productName ||
      !productDescription ||
      !category ||
      !productPrice ||
      inventoryQuantity < 0 ||
      minimumPrintingQuantity < 0
    ) {
      toast.error("Please fill out all fields correctly.");
      return;
    }

    const uploadedImages = [];
    await Promise.all(
      images.map(async (image, index) => {
        if (image.file) {
          const file = image.file;
          const uniqueFileName = `product-${Date.now()}-${index + 1}-${
            file.name
          }`;
          const storageRef = ref(storage, `products/${uniqueFileName}`);
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);
          uploadedImages.push(downloadURL);
        } else {
          uploadedImages.push(image);
        }
      })
    );

    await Promise.all(
      deletedImages.map(async (imageUrl) => {
        const storageRef = ref(storage, imageUrl);
        try {
          await deleteObject(storageRef);
          console.log(`Deleted image: ${imageUrl}`);
        } catch (error) {
          console.error(`Failed to delete image: ${imageUrl}`, error);
        }
      })
    );

    try {
      const productRef = doc(db, "products", product.id);
      await updateDoc(productRef, {
        productName,
        productDescription,
        inventoryQuantity,
        minimumPrintingQuantity,
        category,
        productPrice,
        images: uploadedImages,
      });

      toast.success("Product updated successfully!");
      onSave();
      onClose();
    } catch (error) {
      toast.error("Failed to update the product. Please try again.");
      console.error("Error updating product:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Edit Product</DialogTitle>
      <DialogContent>
        <TextField
          label="Product Name"
          fullWidth
          margin="dense"
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
          label="Description"
          fullWidth
          margin="dense"
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
          label="Quantity"
          fullWidth
          margin="dense"
          type="number"
          value={inventoryQuantity}
          onChange={(e) => setInventoryQuantity(Number(e.target.value))}
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
          label="Minimum Printing Quantity"
          fullWidth
          margin="dense"
          type="number"
          value={minimumPrintingQuantity}
          onChange={(e) => setMinimumPrintingQuantity(Number(e.target.value))}
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
          label="Price (RS/item)"
          fullWidth
          margin="dense"
          type="number"
          value={productPrice}
          onChange={(e) => setProductPrice(Number(e.target.value))}
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
                e.currentTarget.querySelector(".delete-icon").style.opacity = 1;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.querySelector(".delete-icon").style.opacity = 0;
              }}
            >
              <img
                src={image.url || image}
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
        <Button onClick={onClose} color="error" variant="contained">
          Cancel
        </Button>
        <Button onClick={handleSave} color="success" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
