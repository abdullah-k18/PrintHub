import { Container, Typography } from "@mui/material";

export default function Footer() {
    return(
        <footer className="py-4 bg-gray-100">
        <Container className="text-center">
          <Typography sx={{ color: "black", fontSize: "0.8rem" }}>
            &copy; 2024 PrintHub. All rights reserved.
          </Typography>
        </Container>
      </footer>
    );
}