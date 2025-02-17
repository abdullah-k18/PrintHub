"use client";

import { useState } from 'react';
import { auth } from '../../../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { AppBar, Toolbar, Button, Container, TextField, Typography, CircularProgress } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ForgotPassword() {
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!resetEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success("Password reset email sent! Please check your inbox.");
      router.push('/press/login');
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <AppBar 
        position="fixed" 
        sx={{ backgroundColor: '#28a745', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Link href="/" passHref>
            <Typography 
              variant="h5" 
              sx={{ ml: 2, fontWeight: 'bold', color: 'white' }}
              className='hover:cursor-pointer'
            >
              Print<span style={{ color: '#28a745', backgroundColor: 'white', padding: '2px 8px', borderRadius: '6px', marginLeft: '5px' }}>Hub</span>
            </Typography>
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/login" passHref>
              <Button variant="contained" sx={{ backgroundColor: 'white', color: '#28a745', fontWeight: 'bold' }}>
                Login
              </Button>
            </Link>
          </div>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          mt: '60px',
          overflowY: 'auto',
          mb: '60px',
        }}
      >
        <div className="bg-white p-6 rounded-md shadow-lg w-full max-h-[90vh] overflow-y-auto">
          <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
            Reset Password
          </Typography>

          <form onSubmit={handlePasswordReset}>
            <TextField
              label="Enter your email for password reset"
              type="email"
              fullWidth
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              InputLabelProps={{
                sx: {
                  '&.Mui-focused': {
                    color: 'black',
                  },
                },
              }}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'black',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'black',
                },
              }, }}
            />
            <Button
              type="submit"
              variant="outlined"
              fullWidth
              sx={{
                mb: 2,
                backgroundColor: '#28a745',
                '&:hover': {
                  backgroundColor: '#218838',
                },
                color: 'white',
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#28a745' }} /> : "Send Reset Email"}
            </Button>
          </form>
        </div>
      </Container>
      <hr />
      <footer className="py-4 bg-gray-100">
        <Container className="text-center">
          <Typography 
            sx={{ color: 'black', fontSize: '0.8rem' }}
          >
            &copy; 2024 PrintHub. All rights reserved.
          </Typography>
        </Container>
      </footer>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
