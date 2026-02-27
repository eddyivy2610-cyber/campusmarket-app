export type FilterType = 'multi-select' | 'checkbox' | 'range';

export interface FilterOption {
    label: string;
    value: string;
}

export interface DynamicFilter {
    id: string;
    label: string;
    type: FilterType;
    options?: FilterOption[]; // Used for multi-select
    rangeConfig?: {
        minPlaceholder: string;
        maxPlaceholder: string;
        unit?: string;
    }; // Used for range inputs
}

// Helper to easily create options
const buildOptions = (items: string[]): FilterOption[] => items.map(item => ({ label: item, value: item }));

export const CATEGORY_FILTERS: Record<string, DynamicFilter[]> = {
    "Electronics": [
        {
            id: "brand",
            label: "Brand",
            type: "multi-select",
            options: buildOptions(["Apple", "Samsung", "Dell", "HP", "Lenovo", "Xiaomi", "Tecno", "Infinix", "Nokia", "Google", "Sony", "Other"])
        },
        {
            id: "deviceType",
            label: "Device Type",
            type: "multi-select",
            options: buildOptions(["Smartphone", "Laptop", "Tablet", "Desktop", "Headphones", "Smartwatch", "Gaming Console", "Accessories"])
        },
        {
            id: "storage",
            label: "Storage Capacity",
            type: "multi-select",
            options: buildOptions(["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB+"])
        },
        {
            id: "ram",
            label: "RAM",
            type: "multi-select",
            options: buildOptions(["2GB", "4GB", "6GB", "8GB", "16GB", "32GB", "64GB+"])
        },
        {
            id: "processor",
            label: "Processor",
            type: "multi-select",
            options: buildOptions(["Intel i3", "Intel i5", "Intel i7", "Intel i9", "AMD Ryzen 3", "Ryzen 5", "Ryzen 7", "Ryzen 9", "M1", "M2", "M3", "Snapdragon", "MediaTek"])
        },
        {
            id: "screenSize",
            label: "Screen Size",
            type: "range",
            rangeConfig: { minPlaceholder: "Min", maxPlaceholder: "Max", unit: "inches" }
        },
        {
            id: "batteryHealth",
            label: "Battery Health",
            type: "range",
            rangeConfig: { minPlaceholder: "Min %", maxPlaceholder: "Max %", unit: "%" }
        },
        {
            id: "network",
            label: "Network",
            type: "multi-select",
            options: buildOptions(["4G", "5G", "WiFi Only", "GSM Unlocked"])
        },
        {
            id: "os",
            label: "Operating System",
            type: "multi-select",
            options: buildOptions(["iOS", "Android", "Windows", "macOS", "Linux", "Chrome OS"])
        },
        {
            id: "accessories",
            label: "Includes Accessories",
            type: "checkbox",
            options: buildOptions(["Original box", "Charger", "Earphones", "Case"])
        },
        {
            id: "warranty",
            label: "Warranty",
            type: "checkbox",
            options: buildOptions(["Under warranty", "Warranty included"])
        },
        {
            id: "year",
            label: "Year of Manufacture",
            type: "range",
            rangeConfig: { minPlaceholder: "Min Year", maxPlaceholder: "Max Year" }
        }
    ],
    "Academics": [
        {
            id: "level",
            label: "Course Level",
            type: "multi-select",
            options: buildOptions(["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "Postgraduate", "General"])
        },
        {
            id: "format",
            label: "Format",
            type: "multi-select",
            options: buildOptions(["Textbook", "Notes/Handouts", "Past Questions", "Laboratory Equipment", "Drawing Materials"])
        },
        {
            id: "condition",
            label: "Material Condition",
            type: "multi-select",
            options: buildOptions(["Brand New", "Like New", "Slightly Used", "Heavily Used (Readable)"])
        }
    ],
    "Accomodation": [
        {
            id: "roomType",
            label: "Room Type",
            type: "multi-select",
            options: buildOptions(["Single Room", "Self Contain", "1 Bedroom Flat", "2 Bedroom Flat", "Shared Room (Squatting)", "Hostel Bed Space"])
        },
        {
            id: "furnished",
            label: "Furnishing Status",
            type: "multi-select",
            options: buildOptions(["Fully Furnished", "Semi-Furnished", "Unfurnished"])
        },
        {
            id: "genderPref",
            label: "Gender Preference",
            type: "multi-select",
            options: buildOptions(["Any", "Male Only", "Female Only"])
        },
        {
            id: "amenities",
            label: "Amenities Included",
            type: "checkbox",
            options: buildOptions(["Running Water", "Prepaid Meter", "Generator/Inverter", "Security Guard", "WiFi"])
        }
    ],
    "Fashion": [
        {
            id: "gender",
            label: "Gender",
            type: "multi-select",
            options: buildOptions(["Men", "Women", "Unisex"])
        },
        {
            id: "category",
            label: "Clothing Type",
            type: "multi-select",
            options: buildOptions(["Shirts & Tops", "Trousers & Jeans", "Dresses", "Shoes & Sneakers", "Bags & Backpacks", "Jackets & Hoodies", "Accessories (Watches, Jewelry)"])
        },
        {
            id: "size",
            label: "Size",
            type: "multi-select",
            options: buildOptions(["XS", "S", "M", "L", "XL", "XXL", "Freesize"])
        }
    ],
    "Food & Provisions": [
        {
            id: "foodType",
            label: "Type",
            type: "multi-select",
            options: buildOptions(["Cooked Meals", "Snacks & Pastries", "Groceries", "Beverages & Drinks", "Raw Food Items"])
        },
        {
            id: "dietary",
            label: "Dietary Preferences",
            type: "checkbox",
            options: buildOptions(["Vegetarian", "Vegan", "Halal", "Gluten-Free"])
        }
    ],
    "Personal Care": [
        {
            id: "careType",
            label: "Type",
            type: "multi-select",
            options: buildOptions(["Skincare", "Haircare", "Bodycare", "Fragrances & Perfumes", "Makeup", "Grooming Tools"])
        },
        {
            id: "condition",
            label: "Condition",
            type: "multi-select",
            options: buildOptions(["Brand New (Sealed)", "Brand New (Unsealed)"])
        }
    ],
    "Sports & Fitness": [
        {
            id: "sportType",
            label: "Category",
            type: "multi-select",
            options: buildOptions(["Gym Equipment", "Sports Gear (Football, Basketball)", "Fitness Apparel", "Supplements & Nutrition", "Footwear"])
        },
        {
            id: "condition",
            label: "Condition",
            type: "multi-select",
            options: buildOptions(["Brand New", "Used - Like New", "Used - Good"])
        }
    ],
    "Entertainment": [
        {
            id: "entType",
            label: "Type",
            type: "multi-select",
            options: buildOptions(["Gaming Console", "Video Games", "Movies (DVDs)", "Musical Instruments", "Board Games"])
        },
        {
            id: "format",
            label: "Format",
            type: "multi-select",
            options: buildOptions(["Physical", "Digital Proxy/Account", "Ticket"])
        }
    ],
    "Transport": [
        {
            id: "transType",
            label: "Type",
            type: "multi-select",
            options: buildOptions(["Bicycle", "Electric Scooter", "Carpooling Offer", "Travel Ticket", "Car Rentals"])
        }
    ],
    "Events": [
        {
            id: "eventType",
            label: "Event Type",
            type: "multi-select",
            options: buildOptions(["Party/Clubbing", "Seminar/Conference", "Workshop", "Sports Event", "Meetup"])
        },
        {
            id: "ticketType",
            label: "Ticket Type",
            type: "multi-select",
            options: buildOptions(["Regular", "VIP", "VVIP", "Table"])
        }
    ],
    "Services": [
        {
            id: "serviceType",
            label: "Service Category",
            type: "multi-select",
            options: buildOptions(["Academic Tutoring", "Graphic Design", "Writing/Editing", "Laundry Services", "Cleaning Services", "Hair Styling/Barber", "Tech Repair", "Photography"])
        },
        {
            id: "rateType",
            label: "Rate Type",
            type: "multi-select",
            options: buildOptions(["Fixed Price", "Hourly Rate", "Negotiable"])
        },
        {
            id: "deliveryTime",
            label: "Delivery Time",
            type: "multi-select",
            options: buildOptions(["Same Day", "24 Hours", "3 Days", "1 Week+"])
        }
    ]
};
