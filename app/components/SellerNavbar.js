"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../firebase";
import { AppBar, Toolbar, Avatar, Menu, MenuItem, Typography, ListItemIcon, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { Logout } from '@mui/icons-material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Boxes } from "lucide-react";
import Link from "next/link";

export default function SellerNavbar({ pressName }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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

  const handleLogout = () => {
    auth.signOut();
    router.push("/login");
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ backgroundColor: '#28a745', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <div className="flex items-center">
            <Link href="/press/dashboard" passHref>
              <Typography variant="h5" sx={{ ml: 2, fontWeight: 'bold', color: 'white' }}>
                Print
                <span style={{ color: '#28a745', backgroundColor: 'white', padding: '2px 8px', borderRadius: '6px', marginLeft: '5px' }}>
                  Hub
                </span>
              </Typography>
            </Link>
          </div>

          <div>
            <IconButton onClick={handleMenuOpen}>
              <Avatar sx={{ bgcolor: 'white', color: '#28a745', fontWeight: 'bold' }}>
                {pressName.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <Link href="/press/profile" passHref>
                <MenuItem>
                  <Avatar sx={{ bgcolor: '#28a745', color: 'white', marginRight: '8px', fontWeight: 'bold' }}>
                    {pressName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography sx={{ color: '#28a745', textTransform: 'capitalize', fontWeight: 'bold' }}>{pressName}</Typography>
                </MenuItem>
              </Link>
              <Link href="/press/dashboard" passHref>
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon>
                    <DashboardIcon fontSize="small" style={{ color: 'black' }} />
                  </ListItemIcon>
                  <Typography>Dashboard</Typography>
                </MenuItem>
              </Link>
              <Link href="/press/inventory" passHref>
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon>
                    <Boxes fontSize="small" color="black" />
                  </ListItemIcon>
                  <Typography>Inventory</Typography>
                </MenuItem>
              </Link>
              <Link href="/press/orders" passHref>
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon>
                    <ShoppingBagIcon fontSize="small" style={{ color: 'black' }} />
                  </ListItemIcon>
                  <Typography>Orders</Typography>
                </MenuItem>
              </Link>
              <MenuItem onClick={handleClickOpen}>
                <ListItemIcon>
                  <Logout fontSize="small" style={{ color: 'black' }} />
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
        <DialogTitle id="logout-dialog-title">{"Confirm Logout"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="success" sx={{ fontWeight: 'bold' }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmLogout} color="error" autoFocus sx={{ fontWeight: 'bold' }}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
