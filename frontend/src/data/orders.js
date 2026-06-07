export const orders = [
  {
    id: "ORD-20240601-001",
    userId: 1,
    items: [
      {
        productId: 1,
        name: "Floral Modal Kurti",
        quantity: 2,
        size: "M",
        color: "#D8B4A0",
        price: 1299,
        image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200"
      },
      {
        productId: 11,
        name: "Palazzo Pants",
        quantity: 1,
        size: "L",
        color: "#2F4F4F",
        price: 999,
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200"
      }
    ],
    totalAmount: 3597,
    discount: 750,
    finalAmount: 2847,
    status: "delivered",
    paymentMethod: "UPI",
    shippingAddress: {
      name: "Priya Sharma",
      phone: "+91-9876543210",
      line1: "42, Lake View Apartments",
      line2: "Sector 14, Rohini",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110085"
    },
    createdAt: "2024-06-01T10:30:00Z",
    deliveredAt: "2024-06-04T14:20:00Z"
  },
  {
    id: "ORD-20240615-002",
    userId: 1,
    items: [
      {
        productId: 4,
        name: "Anarkali Party Wear Dress",
        quantity: 1,
        size: "S",
        color: "#FF0000",
        price: 2499,
        image: "https://images.unsplash.com/photo-1604890532358-74e6b394ced6?w=200"
      }
    ],
    totalAmount: 2499,
    discount: 500,
    finalAmount: 1999,
    status: "shipped",
    paymentMethod: "Credit Card",
    shippingAddress: {
      name: "Priya Sharma",
      phone: "+91-9876543210",
      line1: "42, Lake View Apartments",
      line2: "Sector 14, Rohini",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110085"
    },
    createdAt: "2024-06-15T16:45:00Z",
    deliveredAt: null
  },
  {
    id: "ORD-20240620-003",
    userId: 2,
    items: [
      {
        productId: 7,
        name: "Cotton Crop Top",
        quantity: 3,
        size: "M",
        color: "#FF6347",
        price: 699,
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200"
      },
      {
        productId: 15,
        name: "Silver Jhumka Earrings",
        quantity: 1,
        size: null,
        color: "#C0C0C0",
        price: 499,
        image: "https://images.unsplash.com/photo-1535632066927-ab7c8ab60908?w=200"
      },
      {
        productId: 20,
        name: "Block Print Midi Skirt",
        quantity: 1,
        size: "S",
        color: "#DEB887",
        price: 1349,
        image: "https://images.unsplash.com/photo-1583498716277-878a7c4227d4?w=200"
      }
    ],
    totalAmount: 3945,
    discount: 800,
    finalAmount: 3145,
    status: "processing",
    paymentMethod: "COD",
    shippingAddress: {
      name: "Ananya Gupta",
      phone: "+91-9988776655",
      line1: "7B, Green Valley Colony",
      line2: "Near City Mall",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400076"
    },
    createdAt: "2024-06-20T09:15:00Z",
    deliveredAt: null
  },
  {
    id: "ORD-20240622-004",
    userId: 3,
    items: [
      {
        productId: 21,
        name: "Embellished Saree",
        quantity: 1,
        size: null,
        color: "#FFD700",
        price: 4999,
        image: "https://images.unsplash.com/photo-1604890532358-74e6b394ced6?w=200"
      },
      {
        productId: 17,
        name: "Beaded Statement Necklace",
        quantity: 1,
        size: null,
        color: "#FFD700",
        price: 1299,
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200"
      }
    ],
    totalAmount: 6298,
    discount: 1200,
    finalAmount: 5098,
    status: "cancelled",
    paymentMethod: "UPI",
    shippingAddress: {
      name: "Neha Patel",
      phone: "+91-8877665544",
      line1: "15, Sunrise Towers",
      line2: "SG Highway",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380054"
    },
    createdAt: "2024-06-18T11:00:00Z",
    cancelledAt: "2024-06-19T08:30:00Z",
    deliveredAt: null
  },
  {
    id: "ORD-20240625-005",
    userId: 2,
    items: [
      {
        productId: 8,
        name: "Embroidered Peplum Top",
        quantity: 1,
        size: "L",
        color: "#FF1493",
        price: 1099,
        image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=200"
      },
      {
        productId: 14,
        name: "Tailored Trousers",
        quantity: 1,
        size: "M",
        color: "#36454F",
        price: 1799,
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200"
      }
    ],
    totalAmount: 2898,
    discount: 400,
    finalAmount: 2498,
    status: "pending",
    paymentMethod: "Credit Card",
    shippingAddress: {
      name: "Ananya Gupta",
      phone: "+91-9988776655",
      line1: "7B, Green Valley Colony",
      line2: "Near City Mall",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400076"
    },
    createdAt: "2024-06-25T18:20:00Z",
    deliveredAt: null
  }
];
