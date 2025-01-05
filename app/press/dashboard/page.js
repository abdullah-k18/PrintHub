"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebase";
import { CircularProgress } from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import SellerNavbar from "@/app/components/SellerNavbar";
import Footer from "@/app/components/Footer";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  TimeScale
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [pressName, setPressName] = useState("");
  const [orderData, setOrderData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const sellerDoc = await getDoc(doc(db, "sellers", user.uid));
          if (sellerDoc.exists() && sellerDoc.data().role === "seller") {
            setPressName(sellerDoc.data().pressName);
            const sellerOrdersDoc = await getDoc(
              doc(db, "sellerOrders", user.uid)
            );
            if (sellerOrdersDoc.exists()) {
              const orders = sellerOrdersDoc.data().orders || [];
              setOrderData(orders);

              const total = orders.reduce(
                (sum, order) => sum + (order.totalOrderPrice || 0),
                0
              );
              setTotalSales(total);
            }
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

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const filteredOrders = orderData.filter((order) => {
    const orderDate = order.orderDate?.toDate();
    return orderDate && orderDate >= sevenDaysAgo && orderDate <= now;
  });

  const salesByDate = {};
  filteredOrders.forEach((order) => {
    const orderDate = order.orderDate?.toDate().toISOString().split("T")[0];
    salesByDate[orderDate] =
      (salesByDate[orderDate] || 0) + order.totalOrderPrice;
  });

  const lineData = {
    labels: Object.keys(salesByDate),
    datasets: [
      {
        label: "Sales (RS)",
        data: Object.values(salesByDate),
        borderColor: "#4caf50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        tension: 0.2,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `RS ${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
          tooltipFormat: "MMM d",
        },
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Sales (RS)",
        },
        ticks: {
          callback: (value) => `RS ${value}`,
        },
      },
    },
  };

  const totalOrders = orderData?.length || 0;

  const statusCounts = {
    Pending: 0,
    Processing: 0,
    "Out for Delivery": 0,
    Delivered: 0,
    Cancelled: 0,
  };

  orderData?.forEach((order) => {
    if (statusCounts[order.orderStatus] !== undefined) {
      statusCounts[order.orderStatus]++;
    }
  });

  const barData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: "Number of Orders",
        data: Object.values(statusCounts),
        backgroundColor: ["gray", "orange", "yellow", "green", "red"],
        borderColor: ["#888", "#f57c00", "#fbc02d", "#388e3c", "#d32f2f"],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.raw} orders`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Order Status",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Orders",
        },
        ticks: {
          stepSize: 1,
        },
        max: Math.max(...Object.values(statusCounts), 10),
      },
    },
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <SellerNavbar pressName={pressName} />

      <div className="pt-[80px] pl-4 pr-4 pb-[40px] flex-grow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">
              Total Orders: {totalOrders}
            </h2>
            <Bar data={barData} options={barOptions} />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">
              Total Sales: RS {totalSales.toLocaleString()}
            </h2>
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
      </div>

      <hr />

      <Footer />
    </div>
  );
}
