export type MediaItem = {
  id: string;
  type: "news" | "video" | "event";
  title: string;
  createdAt: string; // ISO
  thumbnail: string;
  excerpt: string;
  // Optional fields for home page cards
  subtitle?: string;
  category?: string;
  author?: string;
};

// Car center / auto repair service images for media cards (round-robin assignment)
// High-quality professional car service, auto repair, and mechanic images from Pexels
const CAR_CENTER_IMAGES = [
  "https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Car service center
  "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Auto repair shop
  "https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Car maintenance service
  "https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Mechanic working
  "https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Car inspection
  "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Auto workshop interior
  "https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Car diagnostic
  "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Engine repair
  "https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Vehicle service
  "https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Auto technician
  "https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Car care center
  "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Professional auto service
];

function getCarCenterImage(index: number): string {
  return CAR_CENTER_IMAGES[index % CAR_CENTER_IMAGES.length] || CAR_CENTER_IMAGES[0]!;
}

export const media: MediaItem[] = [
  {
    id: "m_1",
    type: "news",
    title: "Start bidding",
    subtitle: "We offer reliable vehicles at the most reasonable prices",
    category: "Auction Guide",
    author: "AutoZone Team",
    createdAt: "2025-12-21T09:00:00.000Z",
    thumbnail: getCarCenterImage(0),
    excerpt: "Explore the latest trends in Mongolia's car market for 2025. Discover new models, pricing strategies, and consumer preferences shaping the automotive industry.",
  },
  {
    id: "m_2",
    type: "video",
    title: "GET IN TOUCH",
    subtitle: "We are here to help you",
    category: "Contact Guide",
    author: "Support Team",
    createdAt: "2025-12-19T12:00:00.000Z",
    thumbnail: getCarCenterImage(1),
    excerpt: "Learn essential tips and techniques for inspecting used vehicles. This comprehensive guide covers engine checks, body condition, and important red flags to watch for.",
  },
  {
    id: "m_3",
    type: "event",
    title: "Best Way",
    subtitle: "to export your cars",
    category: "Seller's Guide",
    author: "Sales Team",
    createdAt: "2025-12-18T16:30:00.000Z",
    thumbnail: getCarCenterImage(2),
    excerpt: "Join us for the biggest automotive expo of the year. Featuring new car launches, test drives, special discounts, and expert consultations.",
  },
  {
    id: "m_4",
    type: "news",
    title: "How to Buy a Used Car",
    subtitle: "You don't have to struggle with other sites",
    category: "Buyer's Guide",
    author: "Editorial Team",
    createdAt: "2025-12-17T10:00:00.000Z",
    thumbnail: getCarCenterImage(3),
    excerpt: "Electric vehicles are becoming increasingly popular in Mongolia. Learn about the benefits, charging infrastructure, and available EV models in the market.",
  },
  {
    id: "m_5",
    type: "video",
    title: "Car Maintenance Tips for Winter Driving",
    createdAt: "2025-12-16T14:00:00.000Z",
    thumbnail: getCarCenterImage(4),
    excerpt: "Prepare your vehicle for harsh winter conditions. Expert advice on winter tires, battery care, engine warm-up, and essential maintenance checks.",
  },
  {
    id: "m_6",
    type: "event",
    title: "Classic Car Show 2025",
    createdAt: "2025-12-15T11:00:00.000Z",
    thumbnail: getCarCenterImage(5),
    excerpt: "Celebrate automotive history at our annual classic car show. Featuring vintage vehicles, restoration workshops, and collector meetups.",
  },
  {
    id: "m_7",
    type: "news",
    title: "New Safety Regulations for Imported Vehicles",
    createdAt: "2025-12-14T09:30:00.000Z",
    thumbnail: getCarCenterImage(6),
    excerpt: "Important updates on new safety regulations affecting imported vehicles. Understand compliance requirements and certification processes.",
  },
  {
    id: "m_8",
    type: "video",
    title: "DIY Car Repair: Basic Troubleshooting Guide",
    createdAt: "2025-12-13T15:00:00.000Z",
    thumbnail: getCarCenterImage(7),
    excerpt: "Learn basic car repair techniques you can do at home. From changing oil to replacing air filters, master essential maintenance skills.",
  },
  {
    id: "m_9",
    type: "event",
    title: "Off-Road Adventure Rally 2025",
    createdAt: "2025-12-12T08:00:00.000Z",
    thumbnail: getCarCenterImage(8),
    excerpt: "Join fellow off-road enthusiasts for an exciting adventure rally. Test your driving skills on challenging terrains and connect with the community.",
  },
  {
    id: "m_10",
    type: "news",
    title: "Best Fuel-Efficient Cars for City Driving",
    createdAt: "2025-12-11T13:00:00.000Z",
    thumbnail: getCarCenterImage(9),
    excerpt: "Discover the most fuel-efficient vehicles perfect for urban driving in Mongolia. Compare fuel consumption, features, and pricing of top models.",
  },
  {
    id: "m_11",
    type: "video",
    title: "Understanding Car Insurance in Mongolia",
    createdAt: "2025-12-10T10:30:00.000Z",
    thumbnail: getCarCenterImage(10),
    excerpt: "A comprehensive guide to car insurance options available in Mongolia. Learn about coverage types, premiums, and how to choose the right policy.",
  },
  {
    id: "m_12",
    type: "event",
    title: "Hybrid Vehicle Technology Workshop",
    createdAt: "2025-12-09T14:00:00.000Z",
    thumbnail: getCarCenterImage(11),
    excerpt: "Attend our workshop on hybrid vehicle technology. Learn about how hybrid systems work, maintenance requirements, and environmental benefits.",
  },
];


