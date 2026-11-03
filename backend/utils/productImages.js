// Product image mapping with high-quality, product-specific URLs
const productImageMap = {
  // Electronics
  'iPhone 15 Pro': {
    main: 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1592286927505-1def25115558?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551431009-381d36ac3a99?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300&h=300&fit=crop'
    ]
  },
  'Samsung Galaxy S24 Ultra': {
    main: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551431009-381d36ac3a99?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1519336294541-d4ed697e8d81?w=300&h=300&fit=crop'
    ]
  },
  'MacBook Pro 14"': {
    main: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1588872657840-790ff3bde1c5?w=300&h=300&fit=crop'
    ]
  },
  'Sony WH-1000XM5': {
    main: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'
    ]
  },
  'iPad Pro 12.9"': {
    main: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507598676191-f7e7cd0b1f75?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1591290621749-4f900cd9ddde?w=300&h=300&fit=crop'
    ]
  },
  'Google Pixel 8 Pro': {
    main: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=300&h=300&fit=crop'
    ]
  },
  
  // Clothing/Fashion
  'Nike Air Max 270': {
    main: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1460353581641-694a0c2d7c2f?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=300&h=300&fit=crop'
    ]
  },
  'Adidas Ultraboost 22': {
    main: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop'
    ]
  },
  'Levi\'s 501 Jeans': {
    main: 'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506629082632-acff4e115332?w=300&h=300&fit=crop'
    ]
  },
  'Cotton T-Shirt Pack': {
    main: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&h=300&fit=crop'
    ]
  },
  'Under Armour Hoodie': {
    main: 'https://images.unsplash.com/photo-1556821552-5c63f2b196ce?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1556821552-5c63f2b196ce?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1516762689617-e1cffff0d5f9?w=300&h=300&fit=crop'
    ]
  },
  
  // Sports & Fitness
  'Yoga Mat Premium': {
    main: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1599092332633-90d53bca531d?w=300&h=300&fit=crop'
    ]
  },
  'Resistance Bands Set': {
    main: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop'
    ]
  },
  'Dumbbells Set (20lbs)': {
    main: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1590080876-e6dc4b32c8e9?w=300&h=300&fit=crop'
    ]
  },
  
  // Books
  'The Great Gatsby': {
    main: 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1507842217343-583f20270319?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=300&fit=crop'
    ]
  },
  '1984': {
    main: 'https://images.unsplash.com/photo-1495446815901-a7297e3eda8e?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1495446815901-a7297e3eda8e?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542759117-9a28b913c8b0?w=300&h=300&fit=crop'
    ]
  },
  'Harry Potter Series Set': {
    main: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507842217343-583f20270319?w=300&h=300&fit=crop'
    ]
  },
  
  // Home & Beauty
  'Smart Home Hub': {
    main: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1573968273910-67f1a59d4fa8?w=300&h=300&fit=crop'
    ]
  },
  'Organic Face Cream': {
    main: 'https://images.unsplash.com/photo-1556228578-8c89e6aef883?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1556228578-8c89e6aef883?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1570194280271-61fdf05ce3ef?w=300&h=300&fit=crop'
    ]
  },
  'LEGO Creator Expert': {
    main: 'https://images.unsplash.com/photo-1516387938669-c0ace3b33d0f?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1516387938669-c0ace3b33d0f?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1620024422406-0c3688ed566e?w=300&h=300&fit=crop'
    ]
  },
  
  // Additional Electronics
  'Dell XPS 15': {
    main: 'https://images.unsplash.com/photo-1587829191301-26ec86a49ba0?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1587829191301-26ec86a49ba0?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1588872657840-790ff3bde1c5?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=300&fit=crop'
    ]
  },
  'AirPods Pro 2': {
    main: 'https://images.unsplash.com/photo-1606534894481-fbb58b7ebfd5?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1606534894481-fbb58b7ebfd5?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=300&fit=crop'
    ]
  },
  'Samsung Galaxy Watch 6': {
    main: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=300&h=300&fit=crop'
    ]
  },
  
  // Additional Shoes
  'Nike Jordan 1 Low': {
    main: 'https://images.unsplash.com/photo-1600675119351-3818c6b2b0b5?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1600675119351-3818c6b2b0b5?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1460353581641-694a0c2d7c2f?w=300&h=300&fit=crop'
    ]
  },
  'Puma Running Shoes': {
    main: 'https://images.unsplash.com/photo-1542640244-7e0d2c29d4ee?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1542640244-7e0d2c29d4ee?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop'
    ]
  },
  
  // Additional Books
  'To Kill a Mockingbird': {
    main: 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1507842217343-583f20270319?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=300&h=300&fit=crop'
    ]
  },
  'The Catcher in the Rye': {
    main: 'https://images.unsplash.com/photo-1495446815901-a7297e3eda8e?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1495446815901-a7297e3eda8e?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1547819648-e0c93c65d59b?w=300&h=300&fit=crop'
    ]
  },
  'Pride and Prejudice': {
    main: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=300&fit=crop'
    ]
  },
  'The Hobbit': {
    main: 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1507842217343-583f20270319?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1495446815901-a7297e3eda8e?w=300&h=300&fit=crop'
    ]
  },
  
  // Home & Kitchen
  'Coffee Maker Deluxe': {
    main: 'https://images.unsplash.com/photo-1559056169-641ef0ac8b9d?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1559056169-641ef0ac8b9d?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1514432324607-2e467f4af445?w=300&h=300&fit=crop'
    ]
  },
  'Air Fryer Pro': {
    main: 'https://images.unsplash.com/photo-1587618002051-907e91b04cc0?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1587618002051-907e91b04cc0?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1584622281867-4b2c34f10c2b?w=300&h=300&fit=crop'
    ]
  },
  'Vacuum Cleaner Robot': {
    main: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1584622281867-4b2c34f10c2b?w=300&h=300&fit=crop'
    ]
  },
  
  // Beauty & Care
  'Perfume Premium Collection': {
    main: 'https://images.unsplash.com/photo-1506755855726-89cbb5cc3ec1?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1506755855726-89cbb5cc3ec1?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1523293182886-7651a19cd819?w=300&h=300&fit=crop'
    ]
  },
  'Hair Care Shampoo Set': {
    main: 'https://images.unsplash.com/photo-1629208946669-2b736e5154d7?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1629208946669-2b736e5154d7?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1556228578-8c89e6aef883?w=300&h=300&fit=crop'
    ]
  },
  'Skincare Kit Pro': {
    main: 'https://images.unsplash.com/photo-1570194280271-61fdf05ce3ef?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1570194280271-61fdf05ce3ef?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506755855726-89cbb5cc3ec1?w=300&h=300&fit=crop'
    ]
  },
  
  // Kids & Toys
  'Toy Action Figures Pack': {
    main: 'https://images.unsplash.com/photo-1576842355131-2aae66e38b13?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1576842355131-2aae66e38b13?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1516387938669-c0ace3b33d0f?w=300&h=300&fit=crop'
    ]
  },
  'Baby Monitor Smart': {
    main: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1589537797794-d2cd2da91d42?w=300&h=300&fit=crop'
    ]
  },
  
  // Additional Electronics
  'Drone with Camera': {
    main: 'https://images.unsplash.com/photo-1606933248051-5ce98fda68b6?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1606933248051-5ce98fda68b6?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1577720643272-265b5f8f4f41?w=300&h=300&fit=crop'
    ]
  },
  'Wireless Charging Pad': {
    main: 'https://images.unsplash.com/photo-1571290437773-a0d0c4bcbe96?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1571290437773-a0d0c4bcbe96?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'
    ]
  },
  'Microsoft Surface Pro 9': {
    main: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&h=300&fit=crop'
    ]
  },
  'Bose QuietComfort 45': {
    main: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=300&fit=crop'
    ]
  },
  
  // Toys & Games
  'LEGO Creator Expert': {
    main: 'https://images.unsplash.com/photo-1516387938669-c0ace3b33d0f?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1516387938669-c0ace3b33d0f?w=300&h=300&fit=crop'
    ]
  },
  
  // Toys & Games
  'LEGO Creator Expert': {
    main: 'https://images.unsplash.com/photo-1516387938669-c0ace3b33d0f?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1516387938669-c0ace3b33d0f?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1620024422406-0c3688ed566e?w=300&h=300&fit=crop'
    ]
  },
  
  // Cricket Equipment
  'SG Cricket Bat': {
    main: 'https://images.unsplash.com/photo-1614632537193-23e1a0f91d5b?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1614632537193-23e1a0f91d5b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1599122235597-cf85dbe7dc00?w=300&h=300&fit=crop'
    ]
  },
  'Kookaburra Cricket Bat': {
    main: 'https://images.unsplash.com/photo-1614632537193-23e1a0f91d5b?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1614632537193-23e1a0f91d5b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1616076970620-444a42d1fcac?w=300&h=300&fit=crop'
    ]
  },
  'Gray-Nicolls Cricket Bat': {
    main: 'https://images.unsplash.com/photo-1614632537193-23e1a0f91d5b?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1614632537193-23e1a0f91d5b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1588622772073-4e37dbd8fcc5?w=300&h=300&fit=crop'
    ]
  },
  'SS Cricket Bat': {
    main: 'https://images.unsplash.com/photo-1614632537193-23e1a0f91d5b?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1614632537193-23e1a0f91d5b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1617116555526-e22ee2cc9f95?w=300&h=300&fit=crop'
    ]
  },
  'Duke Cricket Ball': {
    main: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1599122235597-cf85dbe7dc00?w=300&h=300&fit=crop'
    ]
  },
  'Kookaburra Cricket Ball': {
    main: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1616076970620-444a42d1fcac?w=300&h=300&fit=crop'
    ]
  },
  'SG Cricket Ball': {
    main: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1588622772073-4e37dbd8fcc5?w=300&h=300&fit=crop'
    ]
  },
  
  // Cricket Protective Gear
  'SF Cricket Helmet': {
    main: 'https://images.unsplash.com/photo-1599122235597-cf85dbe7dc00?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1599122235597-cf85dbe7dc00?w=300&h=300&fit=crop'
    ]
  },
  'Masuri Cricket Helmet': {
    main: 'https://images.unsplash.com/photo-1616076970620-444a42d1fcac?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1616076970620-444a42d1fcac?w=300&h=300&fit=crop'
    ]
  },
  'Gray-Nicolls Pads': {
    main: 'https://images.unsplash.com/photo-1588622772073-4e37dbd8fcc5?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1588622772073-4e37dbd8fcc5?w=300&h=300&fit=crop'
    ]
  },
  'SG Batting Gloves': {
    main: 'https://images.unsplash.com/photo-1617116555526-e22ee2cc9f95?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1617116555526-e22ee2cc9f95?w=300&h=300&fit=crop'
    ]
  },
  'Kookaburra Wicket Keeping Gloves': {
    main: 'https://images.unsplash.com/photo-1599122235597-cf85dbe7dc00?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1599122235597-cf85dbe7dc00?w=300&h=300&fit=crop'
    ]
  },
  
  // Additional Sports Equipment
  'Wilson Tennis Racket': {
    main: 'https://images.unsplash.com/photo-1554068865-24cecd4e34a5?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34a5?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Babolat Tennis Racket': {
    main: 'https://images.unsplash.com/photo-1554068865-24cecd4e34a5?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34a5?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Head Tennis Racket': {
    main: 'https://images.unsplash.com/photo-1554068865-24cecd4e34a5?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34a5?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Wilson Basketball': {
    main: 'https://images.unsplash.com/photo-1546519638-68711109d298?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1546519638-68711109d298?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Spalding Basketball': {
    main: 'https://images.unsplash.com/photo-1546519638-68711109d298?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1546519638-68711109d298?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Nike Football': {
    main: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Adidas Football': {
    main: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Wilson Badminton Racket': {
    main: 'https://images.unsplash.com/photo-1598296793651-ccb39b8d6c63?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1598296793651-ccb39b8d6c63?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Yonex Badminton Racket': {
    main: 'https://images.unsplash.com/photo-1598296793651-ccb39b8d6c63?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1598296793651-ccb39b8d6c63?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Mikasa Volleyball': {
    main: 'https://images.unsplash.com/photo-1552318506-10e78c0fe84b?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1552318506-10e78c0fe84b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Wilson Volleyball': {
    main: 'https://images.unsplash.com/photo-1552318506-10e78c0fe84b?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1552318506-10e78c0fe84b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Speedo Swimming Goggles': {
    main: 'https://images.unsplash.com/photo-1595452707802-6b2ecef1c91f?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1595452707802-6b2ecef1c91f?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Arena Swimming Cap': {
    main: 'https://images.unsplash.com/photo-1595452707802-6b2ecef1c91f?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1595452707802-6b2ecef1c91f?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Table Tennis Paddle Set': {
    main: 'https://images.unsplash.com/photo-1591487227325-476caffd17e5?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1591487227325-476caffd17e5?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Carrom Board Set': {
    main: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Chess Board Premium': {
    main: 'https://images.unsplash.com/photo-1529699211952-daee226fbb89?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1529699211952-daee226fbb89?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Skateboard Pro': {
    main: 'https://images.unsplash.com/photo-1545821862-7dbbdcf1cff2?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1545821862-7dbbdcf1cff2?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Roller Skates Set': {
    main: 'https://images.unsplash.com/photo-1599122235597-cf85dbe7dc00?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1599122235597-cf85dbe7dc00?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Cycling Helmet': {
    main: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Golf Club Set': {
    main: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Boxing Gloves': {
    main: 'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Punching Bag': {
    main: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Fishing Rod Combo': {
    main: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Camping Tent 4-Person': {
    main: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Sleeping Bag Premium': {
    main: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Hiking Backpack': {
    main: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Mountain Bike': {
    main: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Treadmill Electric': {
    main: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Exercise Bike': {
    main: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Rowing Machine': {
    main: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Elliptical Trainer': {
    main: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Gym Weight Plates Set': {
    main: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Gym Barbell Set': {
    main: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Exercise Bench': {
    main: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Punching Bag Stand': {
    main: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Boxing Speed Bag': {
    main: 'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Karate Gi Uniform': {
    main: 'https://images.unsplash.com/photo-1599122235597-cf85dbe7dc00?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1599122235597-cf85dbe7dc00?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Judo Gi Uniform': {
    main: 'https://images.unsplash.com/photo-1599122235597-cf85dbe7dc00?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1599122235597-cf85dbe7dc00?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Taekwondo Dobok': {
    main: 'https://images.unsplash.com/photo-1599122235597-cf85dbe7dc00?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1599122235597-cf85dbe7dc00?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Climbing Rope': {
    main: 'https://images.unsplash.com/photo-1565732833294-cf79b8920b5d?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1565732833294-cf79b8920b5d?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Climbing Harness': {
    main: 'https://images.unsplash.com/photo-1565732833294-cf79b8920b5d?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1565732833294-cf79b8920b5d?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Climbing Carabiner Set': {
    main: 'https://images.unsplash.com/photo-1565732833294-cf79b8920b5d?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1565732833294-cf79b8920b5d?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Surfboard Beginner': {
    main: 'https://images.unsplash.com/photo-1502680390469-be75a433b8e1?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1502680390469-be75a433b8e1?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Snorkel Set Premium': {
    main: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Diving Mask Set': {
    main: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Wetsuit Full Body': {
    main: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },

  // Additional Electronics
  'Razer Blade 15': {
    main: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1588872657840-790ff3bde1c5?w=300&h=300&fit=crop'
    ]
  },
  'iPad Air 5': {
    main: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=300&fit=crop'
    ]
  },
  'Samsung Galaxy Tab S8': {
    main: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=300&fit=crop'
    ]
  },
  'Wireless Earbuds': {
    main: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1606534894481-fbb58b7ebfd5?w=300&h=300&fit=crop'
    ]
  },
  'Fitbit Charge 6': {
    main: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop'
    ]
  },
  'Garmin Forerunner 245': {
    main: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop'
    ]
  },
  'Smart Watch': {
    main: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop'
    ]
  },
  'Kindle Paperwhite': {
    main: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507842217343-583f20270319?w=300&h=300&fit=crop'
    ]
  },
  'JBL Flip 6 Speaker': {
    main: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1543512214-318c7553f230?w=300&h=300&fit=crop'
    ]
  },
  'Bose SoundLink Revolve': {
    main: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1543512214-318c7553f230?w=300&h=300&fit=crop'
    ]
  },
  'Sonos Beam Soundbar': {
    main: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1543512214-318c7553f230?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop'
    ]
  },
  'Amazon Echo Studio': {
    main: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1543512214-318c7553f230?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop'
    ]
  },
  'Logitech MX Master 3S': {
    main: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&h=300&fit=crop'
    ]
  },
  'Gaming Keyboard RGB': {
    main: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1587829191301-26ec86a49ba0?w=300&h=300&fit=crop'
    ]
  },
  'Gaming Mouse Wireless': {
    main: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&h=300&fit=crop'
    ]
  },
  '4K Webcam': {
    main: 'https://images.unsplash.com/photo-1587825110354-4cc99c314b4d?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1587825110354-4cc99c314b4d?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1587829191301-26ec86a49ba0?w=300&h=300&fit=crop'
    ]
  },
  'USB-C Hub': {
    main: 'https://images.unsplash.com/photo-1625948515291-69613d99261f?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1625948515291-69613d99261f?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1587829191301-26ec86a49ba0?w=300&h=300&fit=crop'
    ]
  },
  'Tablet Stand': {
    main: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=300&fit=crop'
    ]
  },
  'Anker PowerCore 10000': {
    main: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571290437773-a0d0c4bcbe96?w=300&h=300&fit=crop'
    ]
  },
  'Nintendo Switch OLED': {
    main: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1606933248051-5ce98fda68b6?w=300&h=300&fit=crop'
    ]
  },
  'Meta Quest 2': {
    main: 'https://images.unsplash.com/photo-1622979135225-d2ba269fb1bd?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1622979135225-d2ba269fb1bd?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1606933248051-5ce98fda68b6?w=300&h=300&fit=crop'
    ]
  },
  'LG OLED TV 55"': {
    main: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=300&h=300&fit=crop'
    ]
  },
  'Samsung QLED TV 65"': {
    main: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=300&h=300&fit=crop'
    ]
  },
  'Canon EOS R6': {
    main: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&h=300&fit=crop'
    ]
  },
  'Sony A7 IV': {
    main: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&h=300&fit=crop'
    ]
  },
  'GoPro Hero 11': {
    main: 'https://images.unsplash.com/photo-1561516400-f638842c6271?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1561516400-f638842c6271?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=300&fit=crop'
    ]
  },
  'DJI Mini 3 Pro': {
    main: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1606933248051-5ce98fda68b6?w=300&h=300&fit=crop'
    ]
  },
  'Dyson V15 Detect': {
    main: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1588618666-fcd25c85cd64?w=300&h=300&fit=crop'
    ]
  },
  'Ring Video Doorbell Pro': {
    main: 'https://images.unsplash.com/photo-1558002038-109177a15909?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1558002038-109177a15909?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop'
    ]
  },

  // Additional Sports Shoes
  'Nike Air Jordan 1': {
    main: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop'
    ]
  },
  'Adidas Stan Smith': {
    main: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop'
    ]
  },
  'Puma RS-X': {
    main: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop'
    ]
  },
  'Reebok CrossFit Nano 8': {
    main: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop'
    ]
  },
  'New Balance 990v5': {
    main: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop'
    ]
  },
  'ASICS Gel-Kayano 29': {
    main: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop'
    ]
  },
  'Manduka Yoga Mat': {
    main: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1599092332633-90d53bca531d?w=300&h=300&fit=crop'
    ]
  },
  'Kettlebell Set': {
    main: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1590080876793-90d53bca531d?w=300&h=300&fit=crop'
    ]
  },
  'Foam Roller': {
    main: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1590080876793-90d53bca531d?w=300&h=300&fit=crop'
    ]
  },
  'Jump Rope': {
    main: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop'
    ]
  },
  'Exercise Ball': {
    main: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop'
    ]
  },
  'Protein Powder': {
    main: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop'
    ]
  },
  'The North Face Backpack': {
    main: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop'
    ]
  },

  // Additional Clothing
  'Columbia Rain Jacket': {
    main: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=300&fit=crop'
    ]
  },
  'Patagonia Fleece Jacket': {
    main: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop'
    ]
  },
  'Merino Wool Sweater': {
    main: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop'
    ]
  },
  'Cargo Pants': {
    main: 'https://images.unsplash.com/photo-1517445312882-676f7b57e47e?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1517445312882-676f7b57e47e?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=300&h=300&fit=crop'
    ]
  },
  'Polo Shirt': {
    main: 'https://images.unsplash.com/photo-1625910513413-5fc45e60f85b?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1625910513413-5fc45e60f85b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'
    ]
  },
  'Wool Coat': {
    main: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=300&fit=crop'
    ]
  },
  'Hiking Boots': {
    main: 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop'
    ]
  },
  'Running Shorts': {
    main: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'
    ]
  },
  'Sports Bra': {
    main: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'
    ]
  },
  'Winter Gloves': {
    main: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=300&fit=crop'
    ]
  },
  'Denim Jacket': {
    main: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=300&h=300&fit=crop'
    ]
  },
  'Henley Shirt': {
    main: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'
    ]
  },
  'Chino Pants': {
    main: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=300&h=300&fit=crop'
    ]
  },
  'Flannel Shirt': {
    main: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=300&fit=crop'
    ]
  },
  'V-Neck Sweater': {
    main: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop'
    ]
  },
  'Dress Shirt': {
    main: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop'
    ]
  },
  'Cardigan Sweater': {
    main: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop'
    ]
  },
  'Track Pants': {
    main: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'
    ]
  },
  'Tank Top': {
    main: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&h=300&fit=crop'
    ]
  },
  'Blazer Jacket': {
    main: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=300&h=300&fit=crop'
    ]
  },
  'Polo Dress': {
    main: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop'
    ]
  },
  'Leggings': {
    main: 'https://images.unsplash.com/photo-1506629082633-601100f4bcc7?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1506629082633-601100f4bcc7?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop'
    ]
  },
  'Crew Neck Sweatshirt': {
    main: 'https://images.unsplash.com/photo-1556821552-5c63f2b196ce?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1556821552-5c63f2b196ce?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1516762689617-e1cffff0d5f9?w=300&h=300&fit=crop'
    ]
  },
  'Button-Up Shirt': {
    main: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'
    ]
  },
  'Puffer Vest': {
    main: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop'
    ]
  },
  'Yoga Pants': {
    main: 'https://images.unsplash.com/photo-1506629082633-601100f4bcc7?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1506629082633-601100f4bcc7?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop'
    ]
  },
  'Casual Shorts': {
    main: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'
    ]
  },
  'Turtleneck Sweater': {
    main: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop'
    ]
  },
  'Windbreaker Jacket': {
    main: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=300&fit=crop'
    ]
  },
  'Dress Pants': {
    main: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=300&h=300&fit=crop'
    ]
  },
  'Graphic T-Shirt': {
    main: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'
    ]
  },
  'Knit Hat': {
    main: 'https://images.unsplash.com/photo-1576833384022-69ae6acda30c?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1576833384022-69ae6acda30c?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=300&fit=crop'
    ]
  },
  'Leather Belt': {
    main: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop'
    ]
  },
  'Socks Pack': {
    main: 'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'
    ]
  },
  'Scarf': {
    main: 'https://images.unsplash.com/photo-1520894117856-7364a0e9e74c?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1520894117856-7364a0e9e74c?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=300&fit=crop'
    ]
  },
  'Baseball Cap': {
    main: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1576833384022-69ae6acda30c?w=300&h=300&fit=crop'
    ]
  },
  'Leather Wallet': {
    main: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop'
    ]
  },

  // Additional Books
  'Coffee Table Book Collection': {
    main: 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1507842217343-583f20270319?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop'
    ]
  },
  'Mystery Novel Set': {
    main: 'https://images.unsplash.com/photo-1495446815901-a7297e3eda8e?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1495446815901-a7297e3eda8e?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507842217343-583f20270319?w=300&h=300&fit=crop'
    ]
  },
  'Cookbook Collection': {
    main: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507842217343-583f20270319?w=300&h=300&fit=crop'
    ]
  },

  // Additional Home
  'Smart LED Bulbs (4-pack)': {
    main: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1573968273910-67f1a59d4fa8?w=300&h=300&fit=crop'
    ]
  },
  'Robot Vacuum Cleaner': {
    main: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1573968273910-67f1a59d4fa8?w=300&h=300&fit=crop'
    ]
  },
  'Smart Thermostat': {
    main: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1573968273910-67f1a59d4fa8?w=300&h=300&fit=crop'
    ]
  },
  'Security Camera System': {
    main: 'https://images.unsplash.com/photo-1558002038-109177a15909?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1558002038-109177a15909?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop'
    ]
  },
  'Air Purifier': {
    main: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1573968273910-67f1a59d4fa8?w=300&h=300&fit=crop'
    ]
  },
  'Espresso Machine': {
    main: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop'
    ]
  },
  'Standing Desk Converter': {
    main: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop'
    ]
  },
  'Smart Doorbell': {
    main: 'https://images.unsplash.com/photo-1558002038-109177a15909?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1558002038-109177a15909?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop'
    ]
  },
  'Smart Lock': {
    main: 'https://images.unsplash.com/photo-1558002038-109177a15909?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1558002038-109177a15909?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop'
    ]
  },
  'Electric Toothbrush': {
    main: 'https://images.unsplash.com/photo-1559383776-f79085432ce1?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1559383776-f79085432ce1?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop'
    ]
  },

  // Additional Beauty
  'Vitamin C Serum': {
    main: 'https://images.unsplash.com/photo-1556228578-8c89e6aef883?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1556228578-8c89e6aef883?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1570194280271-61fdf05ce3ef?w=300&h=300&fit=crop'
    ]
  },
  'Hydrating Face Mask': {
    main: 'https://images.unsplash.com/photo-1596755389378-c31a21b9282f?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1596755389378-c31a21b9282f?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1570194280271-61fdf05ce3ef?w=300&h=300&fit=crop'
    ]
  },
  'Retinol Cream': {
    main: 'https://images.unsplash.com/photo-1556228578-8c89e6aef883?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1556228578-8c89e6aef883?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1570194280271-61fdf05ce3ef?w=300&h=300&fit=crop'
    ]
  },
  'Sunscreen SPF 50': {
    main: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1570194280271-61fdf05ce3ef?w=300&h=300&fit=crop'
    ]
  },
  'Eye Cream': {
    main: 'https://images.unsplash.com/photo-1556228578-8c89e6aef883?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1556228578-8c89e6aef883?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1570194280271-61fdf05ce3ef?w=300&h=300&fit=crop'
    ]
  },
  'Lip Balm Set': {
    main: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1570194280271-61fdf05ce3ef?w=300&h=300&fit=crop'
    ]
  },

  // Additional Toys
  'LEGO Architecture Set': {
    main: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1516387938669-c0ace3b33d0f?w=300&h=300&fit=crop'
    ]
  },
  'Board Game Collection': {
    main: 'https://images.unsplash.com/photo-1610890716171-6b1c9f21bd78?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1610890716171-6b1c9f21bd78?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1516387938669-c0ace3b33d0f?w=300&h=300&fit=crop'
    ]
  },
  'Art Supplies Set': {
    main: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1516387938669-c0ace3b33d0f?w=300&h=300&fit=crop'
    ]
  },
  'Puzzle Collection': {
    main: 'https://images.unsplash.com/photo-1606933248051-5ce98fda68b6?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1606933248051-5ce98fda68b6?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1516387938669-c0ace3b33d0f?w=300&h=300&fit=crop'
    ]
  },
  'Remote Control Car': {
    main: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1573968273910-67f1a59d4fa8?w=300&h=300&fit=crop'
    ]
  },
  'Musical Instrument Set': {
    main: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1516387938669-c0ace3b33d0f?w=300&h=300&fit=crop'
    ]
  },
  'Science Kit': {
    main: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1516387938669-c0ace3b33d0f?w=300&h=300&fit=crop'
    ]
  },
  'Action Figure Collection': {
    main: 'https://images.unsplash.com/photo-1606933248051-5ce98fda68b6?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1606933248051-5ce98fda68b6?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1516387938669-c0ace3b33d0f?w=300&h=300&fit=crop'
    ]
  },
  'Building Blocks Set': {
    main: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1516387938669-c0ace3b33d0f?w=300&h=300&fit=crop'
    ]
  },
  'Outdoor Playhouse': {
    main: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1573968273910-67f1a59d4fa8?w=300&h=300&fit=crop'
    ]
  },

  // Additional Sports - Racket Sports
  'Wilson Pro Staff Tennis Racket': {
    main: 'https://images.unsplash.com/photo-1554068865-24cecd4e34a5?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34a5?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },
  'Yonex Astrox 88D Badminton Racket': {
    main: 'https://images.unsplash.com/photo-1598296793651-ccb39b8d6c63?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1598296793651-ccb39b8d6c63?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  },

  // Additional Tennis Products
  'Nike Football': {
    main: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595435934249-5de7a052b41a?w=300&h=300&fit=crop'
    ]
  }
};

// Default case-insensitive image selector
const getProductImages = (productName) => {
  // Try exact match first
  if (productImageMap[productName]) {
    return productImageMap[productName];
  }
  
  // Try case-insensitive match
  for (const [key, value] of Object.entries(productImageMap)) {
    if (key.toLowerCase() === productName.toLowerCase()) {
      return value;
    }
  }
  
  // Fallback image
  return {
    main: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'
    ]
  };
};

// Get single image array format for seed data
const getImageArray = (productName) => {
  const images = getProductImages(productName);
  return [images.main, ...images.thumbnails];
};

module.exports = {
  productImageMap,
  getProductImages,
  getImageArray
};
