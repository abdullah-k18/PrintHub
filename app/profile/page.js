"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  CircularProgress,
  TextField,
  Button,
  Container,
  Typography,
  Box,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BuyerNavbar from "../components/BuyerNavbar";
import Footer from "../components/Footer";

export default function BuyerProfile() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tempName, setTempName] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const buyerDoc = await getDoc(doc(db, "buyers", user.uid));

          if (buyerDoc.exists() && buyerDoc.data().role === "buyer") {
            const buyerData = buyerDoc.data();
            setName(buyerData.name);
            setEmail(buyerData.email);
            setPhone(buyerData.phone);
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

  const handleEdit = () => {
    setEditing(true);
    setTempName(name);
    setTempPhone(phone);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const buyerRef = doc(db, "buyers", user.uid);
        await updateDoc(buyerRef, {
          name: tempName,
          phone: tempPhone,
        });

        setName(tempName);
        setPhone(tempPhone);
        setEditing(false);
        setLoading(false);

        toast.success("Profile Updated Successfully!");
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      setLoading(false);
      toast.error("Error updating profile. Please try again.");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={50} sx={{ color: "#28a745" }} />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <BuyerNavbar name={name} />
      <div className="flex-grow mt-[20%] lg:mt-[5%]">
        <Container
          maxWidth="sm"
          sx={{
            backgroundColor: "#ffffff",
            padding: "2rem",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{ marginBottom: "1rem", fontWeight: "bold" }}
          >
            Your Profile
          </Typography>

          <TextField
            fullWidth
            label="Name"
            value={editing ? tempName : name}
            onChange={(e) => setTempName(e.target.value)}
            InputProps={{ readOnly: !editing }}
            variant="outlined"
            margin="normal"
            InputLabelProps={{
              sx: {
                "&.Mui-focused": {
                  color: "black",
                },
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "black",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "black",
                },
              },
            }}
          />
          <TextField
            fullWidth
            label="Email"
            value={email}
            InputProps={{ readOnly: true }}
            variant="outlined"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone"
            value={editing ? tempPhone : phone}
            onChange={(e) => setTempPhone(e.target.value)}
            InputProps={{ readOnly: !editing }}
            variant="outlined"
            margin="normal"
            type="tel"
          />

          {editing ? (
            <Box
              sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 10 }}
            >
              <Button
                color="error"
                variant="contained"
                sx={{ fontWeight: "bold" }}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="success"
                sx={{ fontWeight: "bold" }}
                onClick={handleSave}
              >
                Save
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              color="primary"
              sx={{
                marginTop: "1rem",
                fontWeight: "bold",
                backgroundColor: "#28a745",
                "&:hover": {
                  backgroundColor: "#218838",
                },
              }}
              onClick={handleEdit}
            >
              Edit Profile
            </Button>
          )}
        </Container>
      </div>

      <hr />

      <Footer />

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
