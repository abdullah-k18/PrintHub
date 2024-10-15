"use client";

import Link from 'next/link';
import { AppBar, Toolbar, Button, Container, Typography, useMediaQuery } from '@mui/material';

export default function Press() {
  const isSmallScreen = useMediaQuery('(max-width:600px)');

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
                <Typography sx={{ fontWeight: 'bold' }}>|</Typography>
                <Link href="#features" passHref className='transition-transform duration-100 ease-in-out hover:scale-105'>
                  <Button sx={{ color: 'white', fontWeight: 'bold' }}>
                    Features
                  </Button>
                </Link>
                <Typography sx={{ fontWeight: 'bold' }}>|</Typography>
                <Link href="#reviews" passHref className='transition-transform duration-100 ease-in-out hover:scale-105'>
                  <Button sx={{ color: 'white', fontWeight: 'bold' }}>
                    Reviews
                  </Button>
                </Link>
              </>
            )}
            <Button 
              variant="contained" 
              sx={{ backgroundColor: 'white', color: '#28a745', fontWeight: 'bold' }}
              className='transition-transform duration-300 ease-in-out hover:scale-105'
            >
              Login
            </Button>
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
            Connect your printing press with clients in need of your services.
          </Typography>
          <Typography 
            sx={{ fontSize: { xs: '0.9rem', md: '1.1rem' }, color: 'gray', mb: 8 }}
          >
            List your products, manage inventory, and reach a broader audience with PrintHub.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ backgroundColor: '#28a745', color: 'white', '&:hover': { backgroundColor: '#218838' } }}
          >
            Get Started
          </Button>
        </Container>
      </section>

      <section id="features" className="flex items-center justify-center h-screen py-16 bg-gray-50">
        <Container>
          <Typography 
            variant="h3" 
            sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 'bold', textAlign: 'center', mb: 8 }}
          >
            Features for Sellers
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white shadow rounded-lg text-center transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer">
              <Typography 
                variant="h5" 
                sx={{ fontWeight: 'bold', mb: 4 }}
              >
                Inventory Management
              </Typography>
              <Typography sx={{ color: 'gray' }}>
                Easily add, update, and manage your printing inventory with real-time stats.
              </Typography>
            </div>
            <div className="p-6 bg-white shadow rounded-lg text-center transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer">
              <Typography 
                variant="h5" 
                sx={{ fontWeight: 'bold', mb: 4 }}
              >
                Increase Visibility
              </Typography>
              <Typography sx={{ color: 'gray' }}>
                Get discovered by businesses and individuals seeking top-tier printing services.
              </Typography>
            </div>
            <div className="p-6 bg-white shadow rounded-lg text-center transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer">
              <Typography 
                variant="h5" 
                sx={{ fontWeight: 'bold', mb: 4 }}
              >
                Streamline Orders
              </Typography>
              <Typography sx={{ color: 'gray' }}>
                Manage incoming orders seamlessly with our integrated order management system.
              </Typography>
            </div>
          </div>
        </Container>
      </section>

      <section id="reviews" className="flex items-center justify-center h-screen py-16 bg-white">
        <Container>
          <Typography 
            variant="h3" 
            sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 'bold', textAlign: 'center', mb: 8 }}
          >
            What Other Sellers Say
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-gray-50 shadow rounded-lg transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer">
              <Typography sx={{ color: 'gray.800' }}>
                &quot;PrintHub helped us increase our orders by 40% within the first quarter of joining.&quot;
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ fontWeight: 'bold', color: 'gray.700', mt: 4 }}
              >
                - Benifit Printers
              </Typography>
            </div>
            <div className="p-6 bg-gray-50 shadow rounded-lg transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer">
              <Typography sx={{ color: 'gray.800' }}>
                &quot;Our inventory management has never been easier. PrintHub is a game changer!&quot;
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ fontWeight: 'bold', color: 'gray.700', mt: 4 }}
              >
                - Farooq Printers
              </Typography>
            </div>
          </div>
        </Container>
      </section>

      <footer className="py-8 bg-gray-50">
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
