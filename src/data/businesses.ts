import carRental from "@/assets/car-rental.jpg";
import equipmentRental from "@/assets/equipment-rental.jpg";
import eventRental from "@/assets/event-rental.jpg";
import storageRental from "@/assets/storage-rental.jpg";
import bikeRental from "@/assets/bike-rental.jpg";
import partyRental from "@/assets/party-rental.jpg";

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export interface Service {
  name: string;
  description?: string;
  price?: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  date: string;
  text: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
}

export interface Business {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryId: string;
  description: string;
  fullDescription?: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  rating: number;
  image: string;
  photos?: string[];
  verified?: boolean;
  hours?: BusinessHours[];
  services?: Service[];
  serviceArea?: string[];
  socialLinks?: SocialLinks;
  reviews?: Review[];
}

export const businesses: Business[] = [
  {
    id: "1",
    slug: "elite-auto-rentals",
    name: "Elite Auto Rentals",
    category: "Car Rental",
    categoryId: "car",
    description: "Premium car rental service with a wide selection of luxury and economy vehicles. Daily, weekly, and monthly rates available.",
    fullDescription: "Elite Auto Rentals is your premier destination for premium vehicle rentals. We offer an extensive fleet ranging from economy cars perfect for daily commutes to luxury vehicles for special occasions. Our commitment to excellence ensures every vehicle is meticulously maintained and thoroughly cleaned before each rental. Whether you need a car for a day, a week, or longer, we have flexible rental packages to suit your needs. Our competitive rates and exceptional customer service have made us the top choice for discerning customers in the area.",
    address: "1234 Main Street, Downtown",
    phone: "(555) 123-4567",
    email: "info@eliteautorentals.com",
    website: "https://eliteautorentals.com",
    rating: 4.8,
    image: carRental,
    photos: [carRental, carRental, carRental, carRental],
    verified: true,
    hours: [
      { day: "Monday", open: "8:00 AM", close: "8:00 PM" },
      { day: "Tuesday", open: "8:00 AM", close: "8:00 PM" },
      { day: "Wednesday", open: "8:00 AM", close: "8:00 PM" },
      { day: "Thursday", open: "8:00 AM", close: "8:00 PM" },
      { day: "Friday", open: "8:00 AM", close: "9:00 PM" },
      { day: "Saturday", open: "9:00 AM", close: "6:00 PM" },
      { day: "Sunday", open: "10:00 AM", close: "4:00 PM" },
    ],
    services: [
      { name: "Economy Car Rental", description: "Compact and fuel-efficient vehicles", price: "$35/day" },
      { name: "SUV Rental", description: "Spacious SUVs for families", price: "$65/day" },
      { name: "Luxury Car Rental", description: "Premium vehicles for special occasions", price: "$150/day" },
      { name: "Weekly Package", description: "7 days with unlimited mileage", price: "$199/week" },
      { name: "Airport Pickup", description: "Convenient pickup at terminal", price: "$25" },
    ],
    serviceArea: ["Downtown", "Midtown", "Airport", "Suburbs", "Metro Area"],
    socialLinks: {
      facebook: "https://facebook.com/eliteautorentals",
      instagram: "https://instagram.com/eliteautorentals",
      twitter: "https://twitter.com/eliteautorentals",
    },
    reviews: [
      { id: "r1", reviewerName: "John D.", rating: 5, date: "2024-01-15", text: "Excellent service! The car was immaculate and the staff was incredibly helpful." },
      { id: "r2", reviewerName: "Sarah M.", rating: 5, date: "2024-01-10", text: "Best rental experience I've ever had. Will definitely use again!" },
      { id: "r3", reviewerName: "Mike R.", rating: 4, date: "2024-01-05", text: "Great selection of vehicles and fair prices. Quick pickup process." },
    ],
  },
  {
    id: "2",
    slug: "probuild-equipment-co",
    name: "ProBuild Equipment Co.",
    category: "Equipment",
    categoryId: "equipment",
    description: "Professional construction equipment rental including excavators, bobcats, scaffolding, and power tools for contractors and DIY projects.",
    fullDescription: "ProBuild Equipment Co. has been serving contractors and DIY enthusiasts for over 15 years. We maintain the largest inventory of construction equipment in the region, from small power tools to heavy machinery. Our equipment is regularly serviced and inspected to ensure safety and reliability. Our knowledgeable staff can help you select the right equipment for your project and provide operation guidance. We offer flexible rental terms and competitive rates for both short-term and long-term rentals.",
    address: "5678 Industrial Blvd, West Side",
    phone: "(555) 234-5678",
    email: "rentals@probuildequip.com",
    website: "https://probuildequip.com",
    rating: 4.9,
    image: equipmentRental,
    photos: [equipmentRental, equipmentRental, equipmentRental, equipmentRental],
    verified: true,
    hours: [
      { day: "Monday", open: "6:00 AM", close: "6:00 PM" },
      { day: "Tuesday", open: "6:00 AM", close: "6:00 PM" },
      { day: "Wednesday", open: "6:00 AM", close: "6:00 PM" },
      { day: "Thursday", open: "6:00 AM", close: "6:00 PM" },
      { day: "Friday", open: "6:00 AM", close: "6:00 PM" },
      { day: "Saturday", open: "7:00 AM", close: "3:00 PM" },
      { day: "Sunday", open: "", close: "", closed: true },
    ],
    services: [
      { name: "Excavator Rental", description: "Mini to full-size excavators", price: "$250/day" },
      { name: "Bobcat/Skid Steer", description: "Compact loaders for tight spaces", price: "$175/day" },
      { name: "Scaffolding", description: "Complete scaffolding systems", price: "$50/day" },
      { name: "Power Tools", description: "Drills, saws, and more", price: "$25/day" },
      { name: "Delivery Service", description: "Equipment delivery to your site", price: "$75" },
    ],
    serviceArea: ["West Side", "Industrial District", "Construction Zone", "Metro Area", "Suburbs"],
    socialLinks: {
      facebook: "https://facebook.com/probuildequip",
      linkedin: "https://linkedin.com/company/probuildequip",
    },
    reviews: [
      { id: "r1", reviewerName: "Tom C.", rating: 5, date: "2024-01-18", text: "Always reliable equipment. Never had a breakdown on the job." },
      { id: "r2", reviewerName: "Lisa K.", rating: 5, date: "2024-01-12", text: "Fantastic service and fair prices. My go-to for all construction equipment." },
      { id: "r3", reviewerName: "James W.", rating: 4, date: "2024-01-08", text: "Great selection. Staff really knows their equipment." },
    ],
  },
  {
    id: "3",
    slug: "perfect-events-rental",
    name: "Perfect Events Rental",
    category: "Event Supplies",
    categoryId: "event",
    description: "Complete event rental solutions featuring tables, chairs, linens, tents, and decor for weddings, corporate events, and parties.",
    fullDescription: "Perfect Events Rental transforms ordinary spaces into extraordinary venues. We provide comprehensive event rental solutions for weddings, corporate functions, private parties, and community events. Our inventory includes elegant furniture, beautiful linens, stunning decor, and professional-grade tents and canopies. Our experienced team works closely with event planners and clients to ensure every detail is perfect. From intimate gatherings to grand celebrations, we have everything you need to create memorable events.",
    address: "910 Event Plaza, Midtown",
    phone: "(555) 345-6789",
    email: "events@perfecteventsrental.com",
    website: "https://perfecteventsrental.com",
    rating: 4.7,
    image: eventRental,
    photos: [eventRental, eventRental, eventRental, eventRental],
    verified: true,
    hours: [
      { day: "Monday", open: "9:00 AM", close: "6:00 PM" },
      { day: "Tuesday", open: "9:00 AM", close: "6:00 PM" },
      { day: "Wednesday", open: "9:00 AM", close: "6:00 PM" },
      { day: "Thursday", open: "9:00 AM", close: "6:00 PM" },
      { day: "Friday", open: "9:00 AM", close: "7:00 PM" },
      { day: "Saturday", open: "10:00 AM", close: "4:00 PM" },
      { day: "Sunday", open: "", close: "", closed: true },
    ],
    services: [
      { name: "Table & Chair Package", description: "Seating for 50 guests", price: "$200" },
      { name: "Tent Rental", description: "20x40 canopy tent", price: "$500/day" },
      { name: "Linen Service", description: "Tablecloths and napkins", price: "$75/table" },
      { name: "Decor Package", description: "Centerpieces and lighting", price: "$150" },
      { name: "Full Event Setup", description: "Complete setup and teardown", price: "Custom" },
    ],
    serviceArea: ["Midtown", "Downtown", "Uptown", "Suburbs", "Beach Areas"],
    socialLinks: {
      facebook: "https://facebook.com/perfecteventsrental",
      instagram: "https://instagram.com/perfecteventsrental",
      youtube: "https://youtube.com/perfecteventsrental",
    },
    reviews: [
      { id: "r1", reviewerName: "Emily B.", rating: 5, date: "2024-01-20", text: "Made our wedding day absolutely perfect! Highly recommend!" },
      { id: "r2", reviewerName: "David L.", rating: 4, date: "2024-01-14", text: "Great selection and professional service. Very responsive." },
      { id: "r3", reviewerName: "Amanda T.", rating: 5, date: "2024-01-09", text: "The team went above and beyond for our corporate event." },
    ],
  },
  {
    id: "4",
    slug: "securestore-facilities",
    name: "SecureStore Facilities",
    category: "Storage",
    categoryId: "storage",
    description: "Climate-controlled storage units in various sizes. 24/7 access, advanced security, and month-to-month leasing options available.",
    fullDescription: "SecureStore Facilities offers premium storage solutions for residential and commercial needs. Our state-of-the-art facilities feature climate-controlled units, 24/7 video surveillance, and secure access controls. We offer a variety of unit sizes from small lockers to large warehouse spaces. Our month-to-month leasing provides flexibility without long-term commitments. Whether you're storing household items during a move, business inventory, or valuable collectibles, your belongings are safe with us.",
    address: "2468 Storage Lane, East District",
    phone: "(555) 456-7890",
    email: "info@securestore.com",
    website: "https://securestore.com",
    rating: 4.6,
    image: storageRental,
    photos: [storageRental, storageRental, storageRental, storageRental],
    verified: false,
    hours: [
      { day: "Monday", open: "6:00 AM", close: "10:00 PM" },
      { day: "Tuesday", open: "6:00 AM", close: "10:00 PM" },
      { day: "Wednesday", open: "6:00 AM", close: "10:00 PM" },
      { day: "Thursday", open: "6:00 AM", close: "10:00 PM" },
      { day: "Friday", open: "6:00 AM", close: "10:00 PM" },
      { day: "Saturday", open: "6:00 AM", close: "10:00 PM" },
      { day: "Sunday", open: "6:00 AM", close: "10:00 PM" },
    ],
    services: [
      { name: "Small Unit (5x5)", description: "Perfect for boxes and small items", price: "$50/month" },
      { name: "Medium Unit (10x10)", description: "Fits furniture and appliances", price: "$100/month" },
      { name: "Large Unit (10x20)", description: "Room for a full household", price: "$175/month" },
      { name: "Climate Control", description: "Temperature regulated storage", price: "+$25/month" },
      { name: "Vehicle Storage", description: "Cars, boats, and RVs", price: "$150/month" },
    ],
    serviceArea: ["East District", "Metro Area", "Suburbs"],
    socialLinks: {
      facebook: "https://facebook.com/securestore",
    },
    reviews: [
      { id: "r1", reviewerName: "Chris P.", rating: 5, date: "2024-01-16", text: "Clean facility and great security. Peace of mind for my belongings." },
      { id: "r2", reviewerName: "Nicole H.", rating: 4, date: "2024-01-11", text: "Convenient access and friendly staff. Good value." },
    ],
  },
  {
    id: "5",
    slug: "city-cycle-rentals",
    name: "City Cycle Rentals",
    category: "Bikes & Scooters",
    categoryId: "bike",
    description: "Eco-friendly bike and electric scooter rentals. Hourly and daily rates. Perfect for exploring the city or commuting.",
    fullDescription: "City Cycle Rentals promotes sustainable transportation and outdoor adventure. We offer a diverse fleet of bicycles including road bikes, mountain bikes, cruisers, and electric scooters. Our rental locations are strategically placed throughout the city for convenient pickup and drop-off. Whether you're a tourist exploring the sights, a commuter looking for eco-friendly transportation, or a fitness enthusiast wanting to hit the trails, we have the perfect ride for you. All rentals include helmets and locks.",
    address: "789 Park Avenue, Central",
    phone: "(555) 567-8901",
    email: "ride@citycyclerentals.com",
    website: "https://citycyclerentals.com",
    rating: 4.5,
    image: bikeRental,
    photos: [bikeRental, bikeRental, bikeRental, bikeRental],
    verified: true,
    hours: [
      { day: "Monday", open: "7:00 AM", close: "8:00 PM" },
      { day: "Tuesday", open: "7:00 AM", close: "8:00 PM" },
      { day: "Wednesday", open: "7:00 AM", close: "8:00 PM" },
      { day: "Thursday", open: "7:00 AM", close: "8:00 PM" },
      { day: "Friday", open: "7:00 AM", close: "9:00 PM" },
      { day: "Saturday", open: "8:00 AM", close: "9:00 PM" },
      { day: "Sunday", open: "8:00 AM", close: "7:00 PM" },
    ],
    services: [
      { name: "Standard Bike", description: "City cruiser or hybrid", price: "$10/hour" },
      { name: "Electric Bike", description: "Pedal-assist e-bike", price: "$20/hour" },
      { name: "Electric Scooter", description: "Stand-up e-scooter", price: "$15/hour" },
      { name: "Day Pass", description: "Unlimited rides for 24 hours", price: "$45" },
      { name: "Guided Tour", description: "2-hour city tour", price: "$35/person" },
    ],
    serviceArea: ["Central", "Downtown", "Park District", "Waterfront", "University Area"],
    socialLinks: {
      instagram: "https://instagram.com/citycyclerentals",
      facebook: "https://facebook.com/citycyclerentals",
      twitter: "https://twitter.com/citycyclerent",
    },
    reviews: [
      { id: "r1", reviewerName: "Alex R.", rating: 5, date: "2024-01-19", text: "Great way to see the city! Bikes were in excellent condition." },
      { id: "r2", reviewerName: "Jenny S.", rating: 4, date: "2024-01-13", text: "Fun experience. The e-bikes are a blast!" },
      { id: "r3", reviewerName: "Mark T.", rating: 5, date: "2024-01-07", text: "Affordable and convenient. Perfect for tourists." },
    ],
  },
  {
    id: "6",
    slug: "party-paradise-rentals",
    name: "Party Paradise Rentals",
    category: "Party Supplies",
    categoryId: "party",
    description: "Bounce houses, carnival games, photo booths, and party entertainment equipment. Making your celebrations unforgettable!",
    fullDescription: "Party Paradise Rentals brings the fun to your celebrations! We specialize in party entertainment equipment including bounce houses, water slides, carnival games, photo booths, and much more. Our equipment is professionally cleaned and safety-inspected before every rental. We cater to birthday parties, school events, church functions, corporate picnics, and community festivals. Our team handles delivery, setup, and pickup so you can focus on enjoying the party. Let us help create memories that last a lifetime!",
    address: "3456 Celebration Way, Northside",
    phone: "(555) 678-9012",
    email: "fun@partyparadise.com",
    website: "https://partyparadise.com",
    rating: 4.9,
    image: partyRental,
    photos: [partyRental, partyRental, partyRental, partyRental],
    verified: true,
    hours: [
      { day: "Monday", open: "9:00 AM", close: "5:00 PM" },
      { day: "Tuesday", open: "9:00 AM", close: "5:00 PM" },
      { day: "Wednesday", open: "9:00 AM", close: "5:00 PM" },
      { day: "Thursday", open: "9:00 AM", close: "5:00 PM" },
      { day: "Friday", open: "9:00 AM", close: "6:00 PM" },
      { day: "Saturday", open: "8:00 AM", close: "6:00 PM" },
      { day: "Sunday", open: "10:00 AM", close: "4:00 PM" },
    ],
    services: [
      { name: "Bounce House", description: "Various sizes and themes", price: "$150/day" },
      { name: "Water Slide", description: "Giant inflatable slide", price: "$250/day" },
      { name: "Photo Booth", description: "Props and prints included", price: "$300/event" },
      { name: "Carnival Game Package", description: "5 classic games", price: "$100/day" },
      { name: "Party Package", description: "Bounce house + games + setup", price: "$350" },
    ],
    serviceArea: ["Northside", "Suburbs", "Metro Area", "Beach Communities"],
    socialLinks: {
      facebook: "https://facebook.com/partyparadise",
      instagram: "https://instagram.com/partyparadise",
      youtube: "https://youtube.com/partyparadise",
    },
    reviews: [
      { id: "r1", reviewerName: "Michelle K.", rating: 5, date: "2024-01-21", text: "The kids had an absolute blast! Setup was quick and professional." },
      { id: "r2", reviewerName: "Robert J.", rating: 5, date: "2024-01-15", text: "Best party rental company in town. Always reliable!" },
      { id: "r3", reviewerName: "Laura M.", rating: 5, date: "2024-01-10", text: "Photo booth was a huge hit at our wedding. Thank you!" },
    ],
  },
  {
    id: "7",
    slug: "metro-car-share",
    name: "Metro Car Share",
    category: "Car Rental",
    categoryId: "car",
    description: "Affordable car sharing service with convenient pickup locations throughout the city. Book by the hour or day through our mobile app.",
    fullDescription: "Metro Car Share revolutionizes urban transportation with our convenient car sharing service. Access vehicles parked throughout the city using our mobile app - no membership fees or long-term commitments required. Simply book, unlock with your phone, and drive. Our fleet includes fuel-efficient compact cars, perfect for quick errands or longer trips. Gas and insurance are included in our transparent pricing. Join thousands of city residents who have embraced smart, flexible transportation.",
    address: "1357 Transit Hub, Downtown",
    phone: "(555) 789-0123",
    email: "support@metrocarshare.com",
    website: "https://metrocarshare.com",
    rating: 4.4,
    image: carRental,
    photos: [carRental, carRental, carRental],
    verified: false,
    hours: [
      { day: "Monday", open: "24 Hours", close: "" },
      { day: "Tuesday", open: "24 Hours", close: "" },
      { day: "Wednesday", open: "24 Hours", close: "" },
      { day: "Thursday", open: "24 Hours", close: "" },
      { day: "Friday", open: "24 Hours", close: "" },
      { day: "Saturday", open: "24 Hours", close: "" },
      { day: "Sunday", open: "24 Hours", close: "" },
    ],
    services: [
      { name: "Hourly Rental", description: "By the hour, gas included", price: "$12/hour" },
      { name: "Day Rental", description: "24-hour access", price: "$65/day" },
      { name: "Weekly Plan", description: "Best value for frequent users", price: "$250/week" },
    ],
    serviceArea: ["Downtown", "Transit Hub", "University District", "Business District"],
    socialLinks: {
      facebook: "https://facebook.com/metrocarshare",
      twitter: "https://twitter.com/metrocarshare",
    },
    reviews: [
      { id: "r1", reviewerName: "Steve H.", rating: 4, date: "2024-01-17", text: "Convenient for quick trips around the city. App works great." },
      { id: "r2", reviewerName: "Diana C.", rating: 5, date: "2024-01-12", text: "Love the flexibility. No hassle pickup!" },
    ],
  },
  {
    id: "8",
    slug: "toolmaster-rentals",
    name: "ToolMaster Rentals",
    category: "Equipment",
    categoryId: "equipment",
    description: "Specialty tool rental for home improvement projects. From lawn care to painting equipment, we have everything you need.",
    fullDescription: "ToolMaster Rentals is your neighborhood hardware partner, specializing in tools for home improvement and DIY projects. We stock everything from pressure washers and lawn aerators to floor sanders and paint sprayers. Our friendly staff provides expert advice on tool selection and usage tips. We believe in making professional-grade tools accessible to everyone, whether you're tackling weekend projects or major renovations. Rent by the hour, day, or week with no hidden fees.",
    address: "2468 Hardware Street, South Side",
    phone: "(555) 890-1234",
    email: "tools@toolmasterrentals.com",
    website: "https://toolmasterrentals.com",
    rating: 4.8,
    image: equipmentRental,
    photos: [equipmentRental, equipmentRental, equipmentRental],
    verified: true,
    hours: [
      { day: "Monday", open: "7:00 AM", close: "7:00 PM" },
      { day: "Tuesday", open: "7:00 AM", close: "7:00 PM" },
      { day: "Wednesday", open: "7:00 AM", close: "7:00 PM" },
      { day: "Thursday", open: "7:00 AM", close: "7:00 PM" },
      { day: "Friday", open: "7:00 AM", close: "7:00 PM" },
      { day: "Saturday", open: "8:00 AM", close: "5:00 PM" },
      { day: "Sunday", open: "9:00 AM", close: "3:00 PM" },
    ],
    services: [
      { name: "Pressure Washer", description: "Gas and electric models", price: "$45/day" },
      { name: "Floor Sander", description: "Drum and orbital sanders", price: "$55/day" },
      { name: "Paint Sprayer", description: "Airless sprayer systems", price: "$65/day" },
      { name: "Lawn Aerator", description: "Core aerator for lawns", price: "$50/day" },
      { name: "Tile Saw", description: "Wet tile cutting saw", price: "$40/day" },
    ],
    serviceArea: ["South Side", "Residential Areas", "Metro Area"],
    socialLinks: {
      facebook: "https://facebook.com/toolmasterrentals",
    },
    reviews: [
      { id: "r1", reviewerName: "Paul G.", rating: 5, date: "2024-01-22", text: "Great selection and the staff really knows their stuff!" },
      { id: "r2", reviewerName: "Karen B.", rating: 5, date: "2024-01-16", text: "Saved me hundreds vs buying. Tools were clean and worked perfectly." },
      { id: "r3", reviewerName: "Tim S.", rating: 4, date: "2024-01-11", text: "Fair prices and helpful tips on how to use the equipment." },
    ],
  },
  {
    id: "9",
    slug: "grand-occasions-rentals",
    name: "Grand Occasions Rentals",
    category: "Event Supplies",
    categoryId: "event",
    description: "Upscale event furnishings and decor rental. Specializing in weddings, galas, and corporate functions with white-glove service.",
    fullDescription: "Grand Occasions Rentals sets the standard for luxury event rentals. Our curated collection features designer furniture, fine china, crystal glassware, and elegant decor pieces. We work with the most prestigious venues and discerning clients to create stunning events that leave lasting impressions. Our white-glove service includes consultation, delivery, setup, and post-event pickup. From intimate dinner parties to grand galas, we bring sophistication and style to every occasion.",
    address: "7890 Luxury Lane, Uptown",
    phone: "(555) 901-2345",
    email: "concierge@grandoccasions.com",
    website: "https://grandoccasions.com",
    rating: 5.0,
    image: eventRental,
    photos: [eventRental, eventRental, eventRental, eventRental],
    verified: true,
    hours: [
      { day: "Monday", open: "10:00 AM", close: "6:00 PM" },
      { day: "Tuesday", open: "10:00 AM", close: "6:00 PM" },
      { day: "Wednesday", open: "10:00 AM", close: "6:00 PM" },
      { day: "Thursday", open: "10:00 AM", close: "6:00 PM" },
      { day: "Friday", open: "10:00 AM", close: "7:00 PM" },
      { day: "Saturday", open: "By Appointment", close: "" },
      { day: "Sunday", open: "", close: "", closed: true },
    ],
    services: [
      { name: "Luxury Lounge Package", description: "Designer sofas and accent pieces", price: "$800" },
      { name: "Fine Dining Set", description: "China, crystal, and flatware for 10", price: "$250" },
      { name: "Floral Arrangements", description: "Custom centerpieces", price: "Custom" },
      { name: "Lighting Design", description: "Uplighting and chandeliers", price: "$500+" },
      { name: "Full Event Design", description: "Consultation to execution", price: "Custom" },
    ],
    serviceArea: ["Uptown", "Historic District", "Waterfront", "Exclusive Venues"],
    socialLinks: {
      instagram: "https://instagram.com/grandoccasions",
      facebook: "https://facebook.com/grandoccasions",
      linkedin: "https://linkedin.com/company/grandoccasions",
    },
    reviews: [
      { id: "r1", reviewerName: "Victoria S.", rating: 5, date: "2024-01-23", text: "Absolutely exquisite! Our gala was featured in the society pages." },
      { id: "r2", reviewerName: "Jonathan P.", rating: 5, date: "2024-01-18", text: "The attention to detail is unmatched. True professionals." },
      { id: "r3", reviewerName: "Elizabeth M.", rating: 5, date: "2024-01-13", text: "Made our daughter's wedding a fairy tale. Forever grateful!" },
    ],
  },
];

export const getBusinessBySlug = (slug: string): Business | undefined => {
  return businesses.find((business) => business.slug === slug);
};
