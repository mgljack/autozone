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

// News and media related images for media cards (round-robin assignment)
// High-quality professional news, journalism, and media images from Pexels/Unsplash (no people)
const NEWS_IMAGES = [
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop&auto=format", // News desk (empty)
  "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=600&fit=crop&auto=format", // Newspaper
  "https://images.pexels.com/photos/159751/book-address-book-learning-learn-159751.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Books/News
  "https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Newspaper stack
  "https://images.pexels.com/photos/159744/pexels-photo-159744.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Magazine
  "https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // News article text
  "https://images.pexels.com/photos/159751/book-address-book-learning-learn-159751.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // News headlines
  "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=600&fit=crop&auto=format", // Media equipment
  "https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Editorial desk
  "https://images.pexels.com/photos/159744/pexels-photo-159744.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // News print
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop&auto=format", // Newsroom (empty)
  "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=600&fit=crop&auto=format", // Media studio (empty)
];

function getNewsImage(index: number): string {
  return NEWS_IMAGES[index % NEWS_IMAGES.length] || NEWS_IMAGES[0]!;
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
    thumbnail: getNewsImage(0),
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
    thumbnail: getNewsImage(1),
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
    thumbnail: getNewsImage(2),
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
    thumbnail: getNewsImage(3),
    excerpt: "Electric vehicles are becoming increasingly popular in Mongolia. Learn about the benefits, charging infrastructure, and available EV models in the market.",
  },
  {
    id: "m_5",
    type: "video",
    title: "Car Maintenance Tips for Winter Driving",
    createdAt: "2025-12-16T14:00:00.000Z",
    thumbnail: getNewsImage(4),
    excerpt: "Prepare your vehicle for harsh winter conditions. Expert advice on winter tires, battery care, engine warm-up, and essential maintenance checks.",
  },
  {
    id: "m_6",
    type: "event",
    title: "Classic Car Show 2025",
    createdAt: "2025-12-15T11:00:00.000Z",
    thumbnail: getNewsImage(5),
    excerpt: "Celebrate automotive history at our annual classic car show. Featuring vintage vehicles, restoration workshops, and collector meetups.",
  },
  {
    id: "m_7",
    type: "news",
    title: "New Safety Regulations for Imported Vehicles",
    createdAt: "2025-12-14T09:30:00.000Z",
    thumbnail: getNewsImage(6),
    excerpt: "Important updates on new safety regulations affecting imported vehicles. Understand compliance requirements and certification processes.",
  },
  {
    id: "m_8",
    type: "video",
    title: "DIY Car Repair: Basic Troubleshooting Guide",
    createdAt: "2025-12-13T15:00:00.000Z",
    thumbnail: getNewsImage(7),
    excerpt: "Learn basic car repair techniques you can do at home. From changing oil to replacing air filters, master essential maintenance skills.",
  },
  {
    id: "m_9",
    type: "event",
    title: "Off-Road Adventure Rally 2025",
    createdAt: "2025-12-12T08:00:00.000Z",
    thumbnail: getNewsImage(8),
    excerpt: "Join fellow off-road enthusiasts for an exciting adventure rally. Test your driving skills on challenging terrains and connect with the community.",
  },
  {
    id: "m_10",
    type: "news",
    title: "Best Fuel-Efficient Cars for City Driving",
    createdAt: "2025-12-11T13:00:00.000Z",
    thumbnail: getNewsImage(9),
    excerpt: "Discover the most fuel-efficient vehicles perfect for urban driving in Mongolia. Compare fuel consumption, features, and pricing of top models.",
  },
  {
    id: "m_11",
    type: "video",
    title: "Understanding Car Insurance in Mongolia",
    createdAt: "2025-12-10T10:30:00.000Z",
    thumbnail: getNewsImage(10),
    excerpt: "A comprehensive guide to car insurance options available in Mongolia. Learn about coverage types, premiums, and how to choose the right policy.",
  },
  {
    id: "m_12",
    type: "event",
    title: "Hybrid Vehicle Technology Workshop",
    createdAt: "2025-12-09T14:00:00.000Z",
    thumbnail: getNewsImage(11),
    excerpt: "Attend our workshop on hybrid vehicle technology. Learn about how hybrid systems work, maintenance requirements, and environmental benefits.",
  },
];


