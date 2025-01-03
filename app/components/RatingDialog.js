"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  TextField,
  Rating,
} from "@mui/material";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RatingDialog({
  open,
  onClose,
  productId,
  userId,
  existingReview,
  onReviewPosted,
}) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    if (open) {
      setRating(existingReview?.rating || 0);
      setReview(existingReview?.review || "");
      setReadOnly(!!existingReview);
    }
  }, [open, existingReview]);

  const handleSubmit = async () => {
    if (readOnly) return;

    try {
      const productRef = doc(db, "products", productId);
      const productDoc = await getDoc(productRef);
      const reviews = productDoc.data().reviews || [];
      const hasReviewed = reviews.some((rev) => rev.userId === userId);

      if (!hasReviewed) {
        await updateDoc(productRef, {
          reviews: arrayUnion({ userId, rating, review }),
        });

        onReviewPosted({ rating, review });
        setReadOnly(true);
        toast.success("Review posted successfully!");
      }
    } catch (error) {
      console.error("Error saving review:", error);
      toast.error("Error saving review. Please try again.");
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{readOnly ? "Your Review" : "Write a Review"}</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>Rate the Product</Typography>
          <Rating
            value={rating}
            onChange={(e, newValue) => setRating(newValue)}
            precision={1}
            readOnly={readOnly}
          />
          <Box mt={2}>
            <Typography gutterBottom>Write a Review</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write your review here"
              disabled={readOnly}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "black",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "black",
                  },
                },
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "black",
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          {!readOnly && (
            <>
              <Button
                onClick={onClose}
                color="error"
                sx={{ fontWeight: "bold" }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                color="success"
                sx={{ fontWeight: "bold" }}
              >
                Post
              </Button>
            </>
          )}
          {readOnly && (
            <Button onClick={onClose} color="error" sx={{ fontWeight: "bold" }}>
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
