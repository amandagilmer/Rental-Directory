import carRental from "@/assets/car-rental.jpg";
import equipmentRental from "@/assets/equipment-rental.jpg";
import eventRental from "@/assets/event-rental.jpg";
import storageRental from "@/assets/storage-rental.jpg";
import bikeRental from "@/assets/bike-rental.jpg";
import partyRental from "@/assets/party-rental.jpg";

export interface Business {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  description: string;
  address: string;
  phone: string;
  rating: number;
  image: string;
}

export const businesses: Business[] = [
  {
    id: "1",
    name: "Elite Auto Rentals",
    category: "Car Rental",
    categoryId: "car",
    description: "Premium car rental service with a wide selection of luxury and economy vehicles. Daily, weekly, and monthly rates available.",
    address: "1234 Main Street, Downtown",
    phone: "(555) 123-4567",
    rating: 4.8,
    image: carRental,
  },
  {
    id: "2",
    name: "ProBuild Equipment Co.",
    category: "Equipment",
    categoryId: "equipment",
    description: "Professional construction equipment rental including excavators, bobcats, scaffolding, and power tools for contractors and DIY projects.",
    address: "5678 Industrial Blvd, West Side",
    phone: "(555) 234-5678",
    rating: 4.9,
    image: equipmentRental,
  },
  {
    id: "3",
    name: "Perfect Events Rental",
    category: "Event Supplies",
    categoryId: "event",
    description: "Complete event rental solutions featuring tables, chairs, linens, tents, and decor for weddings, corporate events, and parties.",
    address: "910 Event Plaza, Midtown",
    phone: "(555) 345-6789",
    rating: 4.7,
    image: eventRental,
  },
  {
    id: "4",
    name: "SecureStore Facilities",
    category: "Storage",
    categoryId: "storage",
    description: "Climate-controlled storage units in various sizes. 24/7 access, advanced security, and month-to-month leasing options available.",
    address: "2468 Storage Lane, East District",
    phone: "(555) 456-7890",
    rating: 4.6,
    image: storageRental,
  },
  {
    id: "5",
    name: "City Cycle Rentals",
    category: "Bikes & Scooters",
    categoryId: "bike",
    description: "Eco-friendly bike and electric scooter rentals. Hourly and daily rates. Perfect for exploring the city or commuting.",
    address: "789 Park Avenue, Central",
    phone: "(555) 567-8901",
    rating: 4.5,
    image: bikeRental,
  },
  {
    id: "6",
    name: "Party Paradise Rentals",
    category: "Party Supplies",
    categoryId: "party",
    description: "Bounce houses, carnival games, photo booths, and party entertainment equipment. Making your celebrations unforgettable!",
    address: "3456 Celebration Way, Northside",
    phone: "(555) 678-9012",
    rating: 4.9,
    image: partyRental,
  },
  {
    id: "7",
    name: "Metro Car Share",
    category: "Car Rental",
    categoryId: "car",
    description: "Affordable car sharing service with convenient pickup locations throughout the city. Book by the hour or day through our mobile app.",
    address: "1357 Transit Hub, Downtown",
    phone: "(555) 789-0123",
    rating: 4.4,
    image: carRental,
  },
  {
    id: "8",
    name: "ToolMaster Rentals",
    category: "Equipment",
    categoryId: "equipment",
    description: "Specialty tool rental for home improvement projects. From lawn care to painting equipment, we have everything you need.",
    address: "2468 Hardware Street, South Side",
    phone: "(555) 890-1234",
    rating: 4.8,
    image: equipmentRental,
  },
  {
    id: "9",
    name: "Grand Occasions Rentals",
    category: "Event Supplies",
    categoryId: "event",
    description: "Upscale event furnishings and decor rental. Specializing in weddings, galas, and corporate functions with white-glove service.",
    address: "7890 Luxury Lane, Uptown",
    phone: "(555) 901-2345",
    rating: 5.0,
    image: eventRental,
  },
];
