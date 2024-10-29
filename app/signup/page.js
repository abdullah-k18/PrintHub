"use client";

import { useState } from 'react';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { AppBar, Toolbar, Button, Container, TextField, Typography, CircularProgress } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Signup() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "buyers", user.uid), {
        uid: user.uid,
        name: name,
        phone: phone,
        email: email,
        role: "buyer",
      });

      setLoading(false);
      toast.success("Registration Successful!");

      router.push('/login');
    } catch (error) {
      toast.error("Registration failed. " + error.message);
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
            Signup
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Full Name"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            <TextField
              label="Phone Number"
              fullWidth
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mb: 2, backgroundColor: '#28a745', '&:hover': { backgroundColor: '#218838' }, color: 'white' }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#28a745' }} /> : "Register"}
            </Button>

            <Typography>
              Already have an account?{" "}
              <Link href="/login" className='text-blue-600 hover:underline'>
                Login
              </Link>
            </Typography>
          </form>
        </div>
      </Container>

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
