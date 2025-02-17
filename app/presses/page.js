"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  CircularProgress,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import BuyerNavbar from "../components/BuyerNavbar";
import Footer from "../components/Footer";

export default function PrintingPresses() {
  const [presses, setPresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPrintingPresses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "sellers"));
        const pressesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPresses(pressesData);
      } catch (error) {
        console.error("Error fetching printing presses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrintingPresses();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const buyerDocRef = doc(db, "buyers", user.uid);
          const buyerDoc = await getDoc(buyerDocRef);

          if (buyerDoc.exists()) {
            setName(buyerDoc.data().name);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredPresses = presses.filter(
    (press) =>
      press.pressName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      press.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      press.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress size={50} sx={{ color: "#28a745" }} />
      </Box>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <BuyerNavbar name={name} />

      <div className="flex justify-center lg:pt-[5%] pt-[20%]">
        <input
          type="text"
          placeholder="Search by name, address, or city"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-3/4 sm:w-1/2 px-4 py-2 rounded-lg shadow-md"
          sx={{
            "&:focus": {
              outline: "2px solid black",
            },
          }}
        />
      </div>

      <Box sx={{ padding: 2 }} className="flex-grow">
        <Grid container spacing={3}>
          {filteredPresses.map((press) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={press.id}>
              <Link href={`/presses/${press.id}`}>
                <Card
                  sx={{ textAlign: "center" }}
                  className="cursor-pointer hover:shadow-xl"
                >
                  <div className="bg-green-600 p-4 rounded-t-md">
                    <StorefrontIcon sx={{ fontSize: 40, color: "white" }} />
                  </div>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                      {press.pressName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {`${press.address}, ${press.city}`}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
          {filteredPresses.length === 0 && (
            <Typography
              variant="body1"
              className="w-full text-center text-gray-500"
              sx={{ marginTop: 4 }}
            >
              No printing presses found.
            </Typography>
          )}
        </Grid>
      </Box>

      <hr />

      <Footer />
    </div>
  );
}
