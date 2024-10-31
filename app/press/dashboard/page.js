"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { CircularProgress, AppBar, Toolbar, Box, Button, Typography, Avatar, Menu, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, ListItemIcon } from '@mui/material';
import { Logout, Person, Inventory2, ShoppingCart } from '@mui/icons-material';
import Link from "next/link";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [sellerName, setSellerName] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirmLogout = () => {
    setOpen(false);
    handleLogout();
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const sellerDoc = await getDoc(doc(db, "sellers", user.uid));
          if (sellerDoc.exists() && sellerDoc.data().role === "seller") {
            setSellerName(sellerDoc.data().pressName);
            setLoading(false);
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

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
        <CircularProgress size={50} sx={{ color: '#28a745' }} />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <AppBar 
        position="fixed" 
        sx={{ backgroundColor: '#28a745', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <div className="flex items-center">
            <Link href="/press/dashboard" passHref>
              <Typography 
                variant="h5" 
                sx={{ ml: 2, fontWeight: 'bold', color: 'white' }}
              >
                Print
                <span 
                  style={{ color: '#28a745', backgroundColor: 'white', padding: '2px 8px', borderRadius: '6px', marginLeft: '5px' }}
                >
                  Hub
                </span>
              </Typography>
            </Link>
          </div>

          <div>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: '50px',
              padding: '3px 6px',
              cursor: 'pointer',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                transform: 'scale(1.05)',
              }
            }}
            onClick={handleMenuOpen}
          >
              <Avatar sx={{ bgcolor: '#28a745', color: 'white', marginRight: '8px' }}>
                {sellerName.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" sx={{ color: '#28a745', textTransform: 'capitalize', pr: 1 }}>{sellerName}</Typography>
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                <Link href="/press/profile" passHref>
                  <Typography>Profile</Typography>
                </Link>
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <Inventory2 fontSize="small" />
                </ListItemIcon>
                <Link href="/press/inventory" passHref>
                  <Typography>Inventory</Typography>
                </Link>
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <ShoppingCart fontSize="small" />
                </ListItemIcon>
                <Link href="/press/orders" passHref>
                  <Typography>Orders</Typography>
                </Link>
              </MenuItem>
              <MenuItem onClick={handleClickOpen}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <Typography>Logout</Typography>
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">
          {"Confirm Logout"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleClose} color="success">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleConfirmLogout} color="error" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
