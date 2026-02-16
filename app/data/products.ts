export interface Product {
    id: number;
    title: string;
    price: number;
    image: string;
    category: "Electronics" | "Academics" | "Accomodation" | "Fashion" | "Personal Care" | "Sports & Fitness" | "Entertainment" | "Micellanous" | "Transport" | "Events" | "Urgent" | "Services";
    rating: number;
    location: string;
    condition: "New" | "Used - Like New" | "Used - Good" | "Used - Fair";
    tags: string[];
    sellerId: string;
}

export const CATEGORIES = [
    { name: "Electronics", icon: "📱", lucideIcon: "MonitorSmartphone" },
    { name: "Academics", icon: "📚", lucideIcon: "BookOpen" },
    { name: "Accomodation", icon: "🏠", lucideIcon: "Home" },
    { name: "Fashion", icon: "👕", lucideIcon: "Shirt" },
    { name: "Personal Care", icon: "✨", lucideIcon: "Sparkles" },
    { name: "Sports & Fitness", icon: "🏋️‍♂️", lucideIcon: "Dumbbell" },
    { name: "Entertainment", icon: "🎸", lucideIcon: "Music" },
    { name: "Micellanous", icon: "📦", lucideIcon: "Package" },
    { name: "Transport", icon: "🚲", lucideIcon: "Bike" },
    { name: "Events", icon: "📅", lucideIcon: "Calendar" },
    { name: "Urgent", icon: "🚨", lucideIcon: "AlertCircle" },
    { name: "Services", icon: "🛠️", lucideIcon: "Wrench" }
];

export const PRODUCTS: Product[] = [
    {
        id: 1,
        title: "Calculus Early Transcendentals",
        price: 4500,
        image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80",
        category: "Academics",
        rating: 5,
        location: "Moremi Hall, Unilag",
        condition: "Used - Good",
        tags: ["math", "book", "course", "study"],
        sellerId: "S1"
    },
    {
        id: 2,
        title: "Apple iPad Air 4th Gen",
        price: 350000,
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80",
        category: "Electronics",
        rating: 4,
        location: "Jaja Hall, Unilag",
        condition: "Used - Like New",
        tags: ["tablet", "apple", "ios", "device"],
        sellerId: "S1"
    },
    {
        id: 3,
        title: "Dorm Mini Fridge",
        price: 80000,
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80",
        category: "Accomodation",
        rating: 5,
        location: "Eni Njoku Hall",
        condition: "Used - Good",
        tags: ["appliance", "kitchen", "cooling", "room"],
        sellerId: "S2"
    },
    {
        id: 4,
        title: "Graphics Calculator TI-84",
        price: 90000,
        image: "https://images.unsplash.com/photo-1574607383476-f517f220d398?auto=format&fit=crop&w=400&q=80",
        category: "Electronics",
        rating: 5,
        location: "FSS Faculty",
        condition: "New",
        tags: ["math", "calculator", "tool", "school"],
        sellerId: "S3"
    },
    {
        id: 5,
        title: "Desk Lamp LED",
        price: 15000,
        image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&w=400&q=80",
        category: "Accomodation",
        rating: 4,
        location: "Mariere Hall",
        condition: "New",
        tags: ["light", "study", "room", "lamp"],
        sellerId: "S2"
    },
    {
        id: 6,
        title: "Chemistry Lab Coat",
        price: 5000,
        image: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&w=400&q=80",
        category: "Academics",
        rating: 3,
        location: "Science Block",
        condition: "Used - Fair",
        tags: ["science", "lab", "coat", "wear"],
        sellerId: "S4"
    },
    {
        id: 7,
        title: "Bike Lock U-Lock",
        price: 12000,
        image: "https://images.unsplash.com/photo-1541625602330-2277a1c4b6c3?auto=format&fit=crop&w=400&q=80",
        category: "Sports & Fitness",
        rating: 5,
        location: "Main Gate",
        condition: "New",
        tags: ["security", "bicycle", "lock", "gym"],
        sellerId: "S1"
    },
    {
        id: 8,
        title: "Power Bank 20000mAh",
        price: 25000,
        image: "https://images.unsplash.com/photo-1619441201928-3d3b785d775f?auto=format&fit=crop&w=400&q=80",
        category: "Electronics",
        rating: 4,
        location: "New Hall",
        condition: "Used - Like New",
        tags: ["charging", "battery", "phone", "power"],
        sellerId: "S5"
    },
    {
        id: 9,
        title: "Nike Air Force 1",
        price: 45000,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80",
        category: "Fashion",
        rating: 5,
        location: "Sports Centre",
        condition: "Used - Good",
        tags: ["shoes", "sneakers", "fashion", "wear"],
        sellerId: "S3"
    },
    {
        id: 10,
        title: "HP Pavilion Laptop",
        price: 250000,
        image: "https://images.unsplash.com/photo-1588872657478-7c439f055ccf?auto=format&fit=crop&w=400&q=80",
        category: "Electronics",
        rating: 4,
        location: "CITS",
        condition: "Used - Good",
        tags: ["computer", "windows", "pc", "laptop"],
        sellerId: "S2"
    },
    {
        id: 11,
        title: "Study Table",
        price: 20000,
        image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=400&q=80",
        category: "Accomodation",
        rating: 4,
        location: "Honours Hall",
        condition: "Used - Fair",
        tags: ["desk", "wood", "room", "furniture"],
        sellerId: "S4"
    },
    {
        id: 12,
        title: "Football Cleats",
        price: 15000,
        image: "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=400&q=80",
        category: "Sports & Fitness",
        rating: 4,
        location: "Unilag Stadium",
        condition: "Used - Good",
        tags: ["boots", "soccer", "sports", "shoes"],
        sellerId: "S5"
    }
];
