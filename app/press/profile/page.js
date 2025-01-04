"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase";
import {
  CircularProgress,
  TextField,
  Button,
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import SellerNavbar from "@/app/components/SellerNavbar";
import Footer from "@/app/components/Footer";

const cities = [
    "Abbottabad", "Adezai", "Ali Bandar", "Amir Chah", "Attock", "Ayubia", "Bahawalpur",
    "Baden", "Bagh", "Bahawalnagar", "Burewala", "Banda Daud Shah", "Bannu", "Batagram", 
    "Bazdar", "Bela", "Bellpat", "Bhag", "Bhakkar", "Bhalwal", "Bhimber", "Birote", 
    "Buner", "Burj", "Chiniot", "Chachro", "Chagai", "Chah Sandan", "Chailianwala", 
    "Chakdara", "Chakku", "Chakwal", "Chaman", "Charsadda", "Chhatr", "Chichawatni", 
    "Chitral", "Dadu", "Dera Ghazi Khan", "Dera Ismail Khan", "Dalbandin", "Dargai", 
    "Darya Khan", "Daska", "Dera Bugti", "Dhana Sar", "Digri", "Dina", "Dinga", 
    "Diplo", "Diwana", "Dokri", "Drosh", "Duki", "Dushi", "Duzab", "Faisalabad", 
    "Fateh Jang", "Ghotki", "Gwadar", "Gujranwala", "Gujrat", "Gadra", "Gajar", 
    "Gandava", "Garhi Khairo", "Garruck", "Ghakhar Mandi", "Ghanian", "Ghauspur", 
    "Ghazluna", "Girdan", "Gulistan", "Gwash", "Hyderabad", "Hala", "Haripur", 
    "Hab Chauki", "Hafizabad", "Hameedabad", "Hangu", "Harnai", "Hasilpur", "Haveli Lakha", 
    "Hinglaj", "Hoshab", "Islamabad", "Islamkot", "Ispikan", "Jacobabad", "Jamshoro", 
    "Jhang", "Jhelum", "Jamesabad", "Jampur", "Janghar", "Jati", "Jauharabad", 
    "Jhal", "Jhal Jhao", "Jhatpat", "Jhudo", "Jiwani", "Jungshahi", "Karachi", 
    "Kotri", "Kalam", "Kalandi", "Kalat", "Kamalia", "Kamararod", "Kamber", 
    "Kamokey", "Kanak", "Kandi", "Kandiaro", "Kanpur", "Kapip", "Kappar", 
    "Karak City", "Karodi", "Kashmor", "Kasur", "Katuri", "Keti Bandar", "Khairpur", 
    "Khanaspur", "Khanewal", "Kharan", "Kharian", "Khokhropur", "Khora", "Khushab", 
    "Khuzdar", "Kikki", "Klupro", "Kohan", "Kohat", "Kohistan", "Kohlu", 
    "Korak", "Korangi", "Kot Sarae", "Kotli", "Lahore", "Larkana", "Lahri", 
    "Lakki Marwat", "Lasbela", "Latamber", "Layyah", "Leiah", "Liari", 
    "Lodhran", "Loralai", "Lower Dir", "Shadan Lund", "Multan", "Mandi Bahauddin", 
    "Mansehra", "Mian Chanu", "Mirpur", "Moro", "Mardan", "Mach", "Madyan", 
    "Malakand", "Mand", "Manguchar", "Mashki Chah", "Maslti", "Mastuj", 
    "Mastung", "Mathi", "Matiari", "Mehar", "Mekhtar", "Merui", "Mianwali", 
    "Mianez", "Mirpur Batoro", "Mirpur Khas", "Mirpur Sakro", "Mithi", "Mongora", 
    "Murgha Kibzai", "Muridke", "Musa Khel Bazar", "Muzaffar Garh"
  ];

export default function SellerProfile() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [pressName, setPressName] = useState("");
  const [email, setEmail] = useState("");
  const [ownerNumber, setOwnerNumber] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [tempPressName, setTempPressName] = useState("");
  const [tempOwnerNumber, setTempOwnerNumber] = useState("");
  const [tempCity, setTempCity] = useState("");
  const [tempAddress, setTempAddress] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const sellerDoc = await getDoc(doc(db, "sellers", user.uid));
          if (sellerDoc.exists() && sellerDoc.data().role === "seller") {
            const data = sellerDoc.data();
            setPressName(data.pressName);
            setEmail(data.email);
            setOwnerNumber(data.ownerNumber);
            setCity(data.city);
            setAddress(data.address);
            setLoading(false);
          } else {
            router.push("/login");
          }
        } catch (error) {
          console.error("Error fetching seller data:", error);
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
    setTempPressName(pressName);
    setTempOwnerNumber(ownerNumber);
    setTempCity(city);
    setTempAddress(address);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const sellerRef = doc(db, "sellers", user.uid);
        await updateDoc(sellerRef, {
          pressName: tempPressName,
          ownerNumber: tempOwnerNumber,
          city: tempCity,
          address: tempAddress,
        });

        setPressName(tempPressName);
        setOwnerNumber(tempOwnerNumber);
        setCity(tempCity);
        setAddress(tempAddress);

        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating seller data:", error);
    } finally {
      setLoading(false);
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
      <SellerNavbar pressName={pressName} />

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
            Press Details
          </Typography>

          <TextField
            fullWidth
            label="Press Name"
            value={editing ? tempPressName : pressName}
            onChange={(e) => setTempPressName(e.target.value)}
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
            label="Owner Number"
            value={editing ? tempOwnerNumber : ownerNumber}
            onChange={(e) => setTempOwnerNumber(e.target.value)}
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
          <FormControl
            fullWidth
            sx={{
              mb: 1,
              mt: 1.5,
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "black",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "black",
                },
              },
            }}
            disabled={!editing}
          >
            <InputLabel
              id="city-label"
              sx={{
                "&.Mui-focused": {
                  color: "black",
                },
                "&.Mui-disabled": {
                  color: "gray",
                },
              }}
            >
              City
            </InputLabel>
            <Select
              labelId="city-label"
              value={editing ? tempCity : city}
              onChange={(e) => setTempCity(e.target.value)}
              label="City"
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "black",
              },
            }}
            >
              {cities.map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Address"
            value={editing ? tempAddress : address}
            onChange={(e) => setTempAddress(e.target.value)}
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

          {editing ? (
            <Box
              sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 2 }}
            >
              <Button color="error" variant="contained" onClick={handleCancel}>
                Cancel
              </Button>
              <Button color="success" variant="contained" onClick={handleSave}>
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
                "&:hover": { backgroundColor: "#218838" },
              }}
              onClick={handleEdit}
            >
              Edit Details
            </Button>
          )}
        </Container>
      </div>

      <hr />

      <Footer />
    </div>
  );
}
