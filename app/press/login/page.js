"use client";

import { useState } from 'react';
import { auth } from '../../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { AppBar, Toolbar, Button, Container, TextField, Typography, CircularProgress } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login Successful!");
      router.push('/press/dashboard');
    } catch (error) {
      setError("Login failed. " + error.message);
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
          <Typography 
            variant="h5" 
            sx={{ ml: 2, fontWeight: 'bold', color: 'white' }}
          >
            Print<span style={{ color: '#28a745', backgroundColor: 'white', padding: '2px 8px', borderRadius: '6px', marginLeft: '5px' }}>Hub</span>
          </Typography>

          <div className="flex items-center space-x-4">
            <Link href="/press" passHref>
              <Button sx={{ color: 'white', fontWeight: 'bold' }}>
                Home
              </Button>
            </Link>
            <Link href="/press/register" passHref>
              <Button variant="contained" sx={{ backgroundColor: 'white', color: '#28a745', fontWeight: 'bold' }}>
                Register
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
            Login
          </Typography>

          <form onSubmit={handleLogin}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 3 }}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
            />

            {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

            <Typography variant="body2" sx={{ mb: 2, textAlign: 'right' }}>
              <Link href="/press/forgot-password" className='text-blue-600 hover:underline'>
                Forgot Password?
              </Link>
            </Typography>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mb: 2,
                backgroundColor: '#28a745',
                '&:hover': {
                  backgroundColor: '#218838',
                },
                color: 'white',
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#28a745' }} /> : "Login"}
            </Button>

            <Typography>
              Don&apos;t have an account?{" "}
              <Link href="/press/register" className='text-blue-600 hover:underline'>
                Register
              </Link>
            </Typography>
          </form>
        </div>
      </Container>

      <footer className="py-4 bg-gray-50">
        <Container className="text-center">
          <Typography 
            sx={{ color: 'black', fontSize: '0.8rem' }}
          >
            &copy; 2024 PrintHub. All rights reserved.
          </Typography>
        </Container>
      </footer>
    </div>
  );
}
