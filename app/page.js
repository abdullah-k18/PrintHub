"use client";

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from 'next/link';
import { AppBar, Toolbar, Button, Container, Typography, useMediaQuery } from '@mui/material';

export default function Home() {
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const buyerDoc = await getDoc(doc(db, "buyers", user.uid));
          const sellerDoc = await getDoc(doc(db, "sellers", user.uid));

          if (buyerDoc.exists()) {
            router.push("/home");
          } else if (sellerDoc.exists()) {
            router.push("/press/dashboard");
          }
        } catch (error) {
        } finally {
          setLoading(false);
        }
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <AppBar 
        position="fixed" 
        sx={{ backgroundColor: '#28a745', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <div className="flex items-center">
            <Link href="#home" passHref>
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

          <div className="flex items-center space-x-4">
            {!isSmallScreen && (
              <>
                <Link href="#home" passHref className='transition-transform duration-100 ease-in-out hover:scale-105'>
                  <Button sx={{ color: 'white', fontWeight: 'bold' }}>
                    Home
                  </Button>
                </Link>
                <Typography sx={{fontWeight: 'bold'}}>|</Typography>
                <Link href="#features" passHref className='transition-transform duration-100 ease-in-out hover:scale-105'>
                  <Button sx={{ color: 'white', fontWeight: 'bold' }}>
                    Features
                  </Button>
                </Link>
                <Typography sx={{fontWeight: 'bold'}}>|</Typography>
                <Link href="#reviews" passHref className='transition-transform duration-100 ease-in-out hover:scale-105'>
                  <Button sx={{ color: 'white', fontWeight: 'bold' }}>
                    Reviews
                  </Button>
                </Link>
              </>
            )}
            <Link href="/login" passHref>
              <Button 
                variant="contained" 
                sx={{ backgroundColor: 'white', color: '#28a745', fontWeight: 'bold' }}
                className='transition-transform duration-300 ease-in-out hover:scale-105'
              >
                Login
              </Button>
            </Link>

            <Link href="/signup" passHref>
              <Button 
                variant="contained" 
                sx={{ backgroundColor: 'white', color: '#28a745', fontWeight: 'bold' }}
                className='transition-transform duration-300 ease-in-out hover:scale-105'
              >
                Register
              </Button>
            </Link>
          </div>
        </Toolbar>
      </AppBar>

      <section id="home" className="flex flex-col items-center justify-center h-screen py-16 text-center bg-white">
        <Container>
          <Typography 
            variant="h2" 
            sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 'bold', mb: 4 }}
          >
            Welcome to PrintHub
          </Typography>
          <Typography 
            sx={{ fontSize: { xs: '1rem', md: '1.25rem' }, color: 'gray', mb: 4 }}
          >
            The one-stop platform for all your printing needs. Find, compare, and order from printing presses effortlessly.
          </Typography>
          <Typography 
            sx={{ fontSize: { xs: '0.9rem', md: '1.1rem' }, color: 'gray', mb: 8 }}
          >
            Whether you&apos;re a business or an individual, PrintHub connects you to a wide range of printing services at your fingertips.
          </Typography>
          <Link href="/home" passHref>
            <Button 
              variant="contained" 
              sx={{ backgroundColor: '#28a745', color: 'white', '&:hover': { backgroundColor: '#218838' } }}
            >
              Get Started
            </Button>
          </Link>
        </Container>
      </section>

      <section id="features" className="flex items-center justify-center lg:h-screen h-auto py-16  bg-gray-100">
        <Container>
          <Typography 
            variant="h3" 
            sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 'bold', textAlign: 'center', mb: 8 }}
          >
            Features
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white shadow rounded-lg text-center transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer">
              <Typography 
                variant="h5" 
                sx={{ fontWeight: 'bold', mb: 4 }}
              >
                Advanced Search
              </Typography>
              <Typography sx={{ color: 'gray' }}>
                Easily find printing presses by location, product type, and more.
              </Typography>
            </div>
            <div className="p-6 bg-white shadow rounded-lg text-center transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer">
              <Typography 
                variant="h5" 
                sx={{ fontWeight: 'bold', mb: 4 }}
              >
                User Reviews
              </Typography>
              <Typography sx={{ color: 'gray' }}>
                Make informed decisions with user reviews and ratings.
              </Typography>
            </div>
            <div className="p-6 bg-white shadow rounded-lg text-center transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer">
              <Typography 
                variant="h5" 
                sx={{ fontWeight: 'bold', mb: 4 }}
              >
                Product Listings
              </Typography>
              <Typography sx={{ color: 'gray' }}>
                View and compare products, prices, and minimum order quantities.
              </Typography>
            </div>
          </div>
        </Container>
      </section>

      <section id="reviews" className="flex items-center justify-center lg:h-screen h-auto py-16 bg-white">
        <Container>
          <Typography 
            variant="h3" 
            sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 'bold', textAlign: 'center', mb: 8 }}
          >
            What Our Users Say
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6  bg-gray-100 shadow rounded-lg transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer">
              <Typography sx={{ color: 'gray.800' }}>
                &quot;PrintHub made it so easy to find the right printing press for our business. Highly recommend!&quot;
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ fontWeight: 'bold', color: 'gray.700', mt: 4 }}
              >
                - Ahmad Shaikh
              </Typography>
            </div>
            <div className="p-6  bg-gray-100 shadow rounded-lg transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer">
              <Typography sx={{ color: 'gray.800' }}>
                &quot;Finally, a platform that simplifies the printing process. I saved so much time.&quot;
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ fontWeight: 'bold', color: 'gray.700', mt: 4 }}
              >
                - Jan Ali
              </Typography>
            </div>
          </div>
        </Container>
      </section>

      <footer className="py-8  bg-gray-100">
        <Container className="text-center">
          <div className="flex justify-center mb-6 space-x-8">
            <Link href="#home" passHref>
              <Typography 
                sx={{ color: 'gray', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
                className='transition-transform duration-100 ease-in-out hover:scale-105 cursor-pointer hover:text-green-600'
              >
                Home
              </Typography>
            </Link>
            <Typography sx={{ color: 'gray', fontSize: '1rem', fontWeight: 'bold' }}>|</Typography>
            <Link href="#features" passHref>
              <Typography 
                sx={{ color: 'gray', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
                className='transition-transform duration-100 ease-in-out hover:scale-105 cursor-pointer hover:text-green-600'
              >
                Features
              </Typography>
            </Link>
            <Typography sx={{ color: 'gray', fontSize: '1rem', fontWeight: 'bold' }}>|</Typography>
            <Link href="#reviews" passHref>
              <Typography 
                sx={{ color: 'gray', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
                className='transition-transform duration-100 ease-in-out hover:scale-105 cursor-pointer hover:text-green-600'
              >
                Reviews
              </Typography>
            </Link>
          </div>

          <div className="mb-8">
            <Typography 
              sx={{ fontSize: '1.2rem', fontWeight: 'bold', mb: 2 }}
            >
              Join PrintHub as a Seller
            </Typography>
            <Typography 
              sx={{ fontSize: '1rem', color: 'gray', mb: 4 }}
            >
              Expand your reach and showcase your products to a broader audience. Start selling with us today.
            </Typography>
            <Link href="/press/register" passHref>
              <Button 
                variant="contained" 
                sx={{ backgroundColor: '#28a745', color: 'white', '&:hover': { backgroundColor: '#218838' } }}
              >
                Become a Seller
              </Button>
            </Link>
          </div>

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
