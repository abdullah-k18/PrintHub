import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";

export default function DeleteProductDialog({ open, onClose, onDelete }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{"Delete Product"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
            Do you want to remove this product from your inventory?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="success">
          Cancel
        </Button>
        <Button onClick={onDelete} color="error">
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
