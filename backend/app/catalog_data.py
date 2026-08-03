"""Catalog seed — product images matched to each product name (verified Unsplash URLs)."""

def _img(photo_id: str) -> str:
    return f"https://images.unsplash.com/{photo_id}?auto=format&fit=crop&w=400&h=400&q=80"


CATALOG: list[dict] = [
    {
        "name": "Snacks",
        "icon": "🍿",
        "color": "#FFF3E0",
        "products": [
            # Lay's Classic bag
            ("Lay's Classic Salted", 20, "52 g", _img("photo-1741520149946-d2e652514b5a")),
            # Doritos pack
            ("Doritos Nacho Cheese", 45, "70 g", _img("photo-1585557444334-1fb2db12d234")),
            # Crispy snack chips in bag (namkeen-style)
            ("Kurkure Masala Munch", 20, "55 g", _img("photo-1759465201025-0f4a876efa47")),
            # Pringles tube
            ("Pringles Original", 99, "107 g", _img("photo-1702097034630-88a759b9923f")),
            # Popcorn
            ("Act II Butter Popcorn", 30, "90 g", _img("photo-1578849278619-e73505e9610f")),
            # Tortilla / angled chips
            ("Bingo Mad Angles", 20, "70 g", _img("photo-1756129725761-09b86c4a9935")),
        ],
    },
    {
        "name": "Dairy",
        "icon": "🥛",
        "color": "#E3F2FD",
        "products": [
            ("Amul Taaza Toned Milk", 28, "500 ml", _img("photo-1563636619-e9143da7973b")),
            ("Amul Butter", 58, "100 g", _img("photo-1589985270826-4b7bb135bc9d")),
            ("Mother Dairy Curd", 32, "400 g", _img("photo-1488477181946-6428a0291777")),
            ("Britannia Cheese Slices", 145, "200 g", _img("photo-1486297678162-eb2a19b0a32d")),
            ("Amul Fresh Cream", 66, "200 ml", _img("photo-1628088062854-d1870b4553da")),
        ],
    },
    {
        "name": "Fruits & Vegetables",
        "icon": "🍎",
        "color": "#E8F5E9",
        "products": [
            ("Banana Robusta", 49, "6 pcs", _img("photo-1603833665858-e61d17a86224")),
            ("Tomato Hybrid", 36, "500 g", _img("photo-1592924357228-91a4daadcfea")),
            ("Onion", 32, "1 kg", _img("photo-1518977676601-b53f82aba655")),
            ("Potato", 28, "1 kg", _img("photo-1518977956812-cd3dbadaaf31")),
            ("Apple Shimla", 189, "4 pcs", _img("photo-1568702846914-96b305d2aaeb")),
            ("Coriander", 10, "100 g", _img("photo-1557844352-761f2565b576")),
        ],
    },
    {
        "name": "Frozen Foods",
        "icon": "🧊",
        "color": "#E0F7FA",
        "products": [
            ("McCain French Fries", 115, "400 g", _img("photo-1573080496219-bb080dd4f877")),
            ("Safal Mixed Vegetables", 75, "500 g", _img("photo-1540420773420-3366772f4999")),
            ("Venky's Chicken Nuggets", 210, "400 g", _img("photo-1626082927389-6cd097cdc6ec")),
            ("Amul Ice Cream Vanilla", 60, "125 ml", _img("photo-1497034825429-c343d7c6a68f")),
            ("Sumeru Veggie Fingers", 135, "300 g", _img("photo-1601050690597-df0568f70950")),
        ],
    },
    {
        "name": "Bakery",
        "icon": "🍞",
        "color": "#FBE9E7",
        "products": [
            ("Britannia Bread White", 45, "400 g", _img("photo-1509440159596-0249088772ff")),
            ("Theobroma Brownie", 99, "1 pc", _img("photo-1564355808539-22fda35bed7e")),
            ("English Oven Pav", 35, "6 pcs", _img("photo-1549931319-a545dcf3bc73")),
            ("Croissant Butter", 55, "1 pc", _img("photo-1555507036-ab1f4038808a")),
            ("Whole Wheat Bread", 50, "400 g", _img("photo-1542838132-92c53300491e")),
        ],
    },
    {
        "name": "Pharmacy",
        "icon": "💊",
        "color": "#F3E5F5",
        "products": [
            ("Crocin Advance", 30, "15 tablets", _img("photo-1584308666744-24d5c474f2ae")),
            ("Digene Acidity Relief", 28, "15 tablets", _img("photo-1471864190281-a93a3070b6de")),
            ("Band-Aid Assorted", 45, "10 strips", _img("photo-1635091237278-a882f31bc310")),
            ("Electral ORS", 22, "21.8 g", _img("photo-1587854692152-cbe660dbde88")),
            ("Limcee Vitamin C", 25, "15 tablets", _img("photo-1550572017-edd951b55104")),
            ("Dettol Antiseptic", 95, "125 ml", _img("photo-1631549916768-4119b2e5f926")),
        ],
    },
    {
        "name": "Personal Care",
        "icon": "🧴",
        "color": "#FCE4EC",
        "products": [
            ("Dove Soap", 55, "75 g", _img("photo-1556228578-0d85b1a4d571")),
            # Toothpaste tubes
            ("Colgate Strong Teeth", 98, "200 g", _img("photo-1702097034631-4283d8979de6")),
            ("Head & Shoulders Shampoo", 185, "180 ml", _img("photo-1535585209827-a15fcdbc4c2d")),
            ("Nivea Soft Cream", 149, "100 ml", _img("photo-1556228720-195a672e8a03")),
            ("Gillette Guard Razor", 35, "1 pc", _img("photo-1621607512214-68297480165e")),
        ],
    },
    {
        "name": "Home Cleaning",
        "icon": "🧹",
        "color": "#E8EAF6",
        "products": [
            ("Harpic Toilet Cleaner", 99, "500 ml", _img("photo-1585421514738-01798e348b17")),
            ("Lizol Disinfectant", 110, "500 ml", _img("photo-1563453392212-326f5e854473")),
            ("Vim Dishwash Gel", 55, "250 ml", _img("photo-1558317374-067fb5f30001")),
            ("Surf Excel Matic", 145, "500 g", _img("photo-1610557892470-55d9e80c0bce")),
            ("Scotch-Brite Scrub Pad", 35, "3 pcs", _img("photo-1581578731548-c64695cc6952")),
        ],
    },
    {
        "name": "Kitchen Essentials",
        "icon": "🍳",
        "color": "#FFF8E1",
        "products": [
            ("Non-stick Frying Pan", 449, "24 cm", _img("photo-1687185426093-3efcbc9fe951")),
            ("Plastic Storage Box Set", 299, "3 pcs", _img("photo-1584568694244-14fbdf83bd30")),
            ("Stainless Steel Knife Set", 399, "3 pcs", _img("photo-1593618998160-e34014e67546")),
            ("Wooden Cutting Board", 249, "1 pc", _img("photo-1594282486552-05b4d80fbb9f")),
            ("Measuring Cups & Spoons", 179, "8 pcs", _img("photo-1556911220-e15b29be8c8f")),
        ],
    },
    {
        "name": "Stationery",
        "icon": "✏️",
        "color": "#EFEBE9",
        "products": [
            ("Classmate Notebook A4", 65, "172 pages", _img("photo-1517842645767-c639042777db")),
            ("Cello Butterflow Pens", 50, "5 pcs", _img("photo-1586075010923-2dd4570fb338")),
            ("Post-it Sticky Notes", 89, "3 pads", _img("photo-1586281380349-632531db7ed4")),
            ("Faber-Castell Highlighter", 40, "1 pc", _img("photo-1452860606245-08befc0ff44b")),
            ("Camlin Permanent Marker", 25, "1 pc", _img("photo-1513542789411-b6a5d4f31634")),
        ],
    },
    {
        "name": "Pet Care",
        "icon": "🐶",
        "color": "#E0F2F1",
        "products": [
            ("Pedigree Adult Dog Food", 385, "1.2 kg", _img("photo-1587300003388-59208cc962cb")),
            ("Whiskas Cat Food", 320, "1.2 kg", _img("photo-1574158622682-e40e69881006")),
            ("Pet Shampoo Mild", 199, "200 ml", _img("photo-1548199973-03cce0bbc87b")),
            ("Dog Chew Treats", 149, "150 g", _img("photo-1544568100-847a948585b9")),
            ("Cat Litter Clumping", 275, "5 kg", _img("photo-1514888286974-6c03e2ca1dba")),
        ],
    },
    {
        "name": "Baby Care",
        "icon": "🍼",
        "color": "#FFF3E0",
        "products": [
            ("Pampers Baby Dry Diapers", 449, "M 42 pcs", _img("photo-1515488042361-ee00e0ddd4e4")),
            ("Johnson's Baby Lotion", 175, "200 ml", _img("photo-1556228720-195a672e8a03")),
            ("Himalaya Baby Powder", 99, "100 g", _img("photo-1503454537195-1dcabb73ffb9")),
            ("Cerelac Wheat Apple", 245, "300 g", _img("photo-1516684669134-de6f7c473a2a")),
            ("Baby Wipes Soft", 99, "72 pcs", _img("photo-1555252333-9f8e92e65df9")),
        ],
    },
]
