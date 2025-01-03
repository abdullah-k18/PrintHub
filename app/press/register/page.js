"use client";

import { useState } from 'react';
import { auth, db } from '../../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { AppBar, Toolbar, Button, Container, TextField, Typography, CircularProgress, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Register() {
  const [pressName, setPressName] = useState('');
  const [email, setEmail] = useState('');
  const [ownerNumber, setOwnerNumber] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.error(null);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "sellers", user.uid), {
        uid: user.uid,
        email: user.email,
        pressName,
        ownerNumber,
        city,
        address,
        role: "seller",
      });

      setLoading(false);
      toast.success("Registration Successful!");

      router.push('/login');
    } catch (error) {
      toast.error("Registration failed. " + error.message);
      setLoading(false);
    }
  };

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
            Register Your Press
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Printing Press Name"
              fullWidth
              required
              value={pressName}
              onChange={(e) => setPressName(e.target.value)}
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
              label="Owner Number"
              fullWidth
              required
              value={ownerNumber}
              onChange={(e) => setOwnerNumber(e.target.value)}
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

            <FormControl fullWidth required
              sx={{ mb: 3, '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'black',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'black',
                },
              }, }}>
                <InputLabel id="city-label" sx={{
                  '&.Mui-focused': {
                    color: 'black',
                  },
                }}>City</InputLabel>
                <Select
                    labelId="city-label"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    label="City"
                >
                    {cities.map((city) => (
                    <MenuItem key={city} value={city}>
                        {city}
                    </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
              label="Address"
              fullWidth
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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
