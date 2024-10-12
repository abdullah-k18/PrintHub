"use client";

import Link from 'next/link';
import { AppBar, Toolbar, Button, Container, Typography, useMediaQuery } from '@mui/material';
import Image from 'next/image';

export default function Home() {
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Navigation Bar */}
      <AppBar position="fixed" className="bg-green-600 shadow-md">
        <Toolbar className="flex justify-between">
          {/* Logo on the left */}
          <div className="flex items-center">
            <Link href="#home" passHref>
              <Typography variant="h5" className="ml-2 text-white font-bold">
                Print<span className="ml-1 text-green-600 bg-white px-2 py-1 rounded-lg font-bold">Hub</span>
              </Typography>
            </Link>
          </div>

          {/* Conditionally render Navigation Items and Login Button based on screen size */}
          <div className="flex items-center space-x-4">
            {!isSmallScreen && (
              <>
                <Link href="#home" passHref>
                  <Button className="text-white font-bold">Home</Button>
                </Link>
                <Link href="#features" passHref>
                  <Button className="text-white font-bold">Features</Button>
                </Link>
                <Link href="#testimonials" passHref>
                  <Button className="text-white font-bold">Testimonials</Button>
                </Link>
              </>
            )}
            <Button variant="contained" color="default" className="bg-white text-green-600 font-bold">
              Login
            </Button>
          </div>
        </Toolbar>
      </AppBar>

      {/* Home Section */}
      <section id="home" className="flex flex-col items-center justify-center h-screen py-16 text-center bg-white">
        <Container>
          <Typography variant="h2" className="text-4xl font-bold mb-4">
            Welcome to PrintHub
          </Typography>
          <Typography className="text-lg text-gray-700 mb-4">
            The one-stop platform for all your printing needs. Find, compare, and order from printing presses effortlessly.
          </Typography>
          <Typography className="text-md text-gray-600 mb-8">
            Whether you're a business or an individual, PrintHub connects you to a wide range of printing services at your fingertips.
          </Typography>
          <Button variant="contained" color="primary" className="bg-green-600 text-white hover:bg-green-700">
            Get Started
          </Button>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="flex items-center justify-center h-screen py-16 bg-gray-50">
        <Container>
          <Typography variant="h3" className="text-3xl font-bold text-center mb-8">
            Features
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white shadow rounded-lg text-center">
              <Typography variant="h5" className="font-bold mb-4">
                Advanced Search
              </Typography>
              <Typography className="text-gray-600">
                Easily find printing presses by location, product type, and more.
              </Typography>
            </div>
            <div className="p-6 bg-white shadow rounded-lg text-center">
              <Typography variant="h5" className="font-bold mb-4">
                User Reviews
              </Typography>
              <Typography className="text-gray-600">
                Make informed decisions with user reviews and ratings.
              </Typography>
            </div>
            <div className="p-6 bg-white shadow rounded-lg text-center">
              <Typography variant="h5" className="font-bold mb-4">
                Product Listings
              </Typography>
              <Typography className="text-gray-600">
                View and compare products, prices, and minimum order quantities.
              </Typography>
            </div>
          </div>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="flex items-center justify-center h-screen py-16 bg-white">
        <Container>
          <Typography variant="h3" className="text-3xl font-bold text-center mb-8">
            What Our Users Say
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-gray-50 shadow rounded-lg">
              <Typography className="text-gray-800">
                "PrintHub made it so easy to find the right printing press for our business. Highly recommend!"
              </Typography>
              <Typography variant="subtitle1" className="font-bold text-gray-700 mt-4">
                - John Doe
              </Typography>
            </div>
            <div className="p-6 bg-gray-50 shadow rounded-lg">
              <Typography className="text-gray-800">
                "Finally, a platform that simplifies the printing process. I saved so much time."
              </Typography>
              <Typography variant="subtitle1" className="font-bold text-gray-700 mt-4">
                - Jane Smith
              </Typography>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="py-4 bg-gray-50">
        <Container className="text-center">
          <Typography className="text-black text-xs">
            &copy; 2024 PrintHub. All rights reserved.
          </Typography>
        </Container>
      </footer>
    </div>
  );
}
