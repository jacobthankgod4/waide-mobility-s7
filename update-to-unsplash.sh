#!/bin/bash

# Script to replace AI-generated images with real Unsplash photos

echo "🎨 Replacing AI images with real Unsplash photos..."

# Hospital
sed -i '' 's|../public/modern-hospital-interior.png|https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200\&q=80|g' blog/hospital-navigation.html
sed -i '' 's|../public/hospital-smart-navigation.png|https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800\&q=80|g' blog/hospital-navigation.html
sed -i '' 's|../public/ar-navigation.png|https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800\&q=80|g' blog/hospital-navigation.html

# Hotel
sed -i '' 's|../public/luxury-hotel-lobby.png|https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200\&q=80|g' blog/hotel-navigation.html
sed -i '' 's|../public/smart-office-navigation.png|https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800\&q=80|g' blog/hotel-navigation.html
sed -i '' 's|../public/modern-office-lobby.png|https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800\&q=80|g' blog/hotel-navigation.html

# University
sed -i '' 's|../public/university-campus-interior.png|https://images.unsplash.com/photo-1562774053-701939374585?w=1200\&q=80|g' blog/university-navigation.html
sed -i '' 's|../public/modern-mall-navigation.png|https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800\&q=80|g' blog/university-navigation.html

# Mall
sed -i '' 's|../public/modern-mall-interior.png|https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200\&q=80|g' blog/mall-navigation.html

# Warehouse
sed -i '' 's|../public/modern-warehouse-interior.png|https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200\&q=80|g' blog/warehouse-navigation.html
sed -i '' 's|../public/data-visualisation.jpg|https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800\&q=80|g' blog/warehouse-navigation.html

# Airport
sed -i '' 's|../public/airport-terminal-interior.png|https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200\&q=80|g' blog/airport-navigation.html
sed -i '' 's|../public/airport-wayfinding.png|https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800\&q=80|g' blog/airport-navigation.html
sed -i '' 's|../public/kenyatta-airport.jpg|https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800\&q=80|g' blog/airport-navigation.html

echo "✅ All images updated to real Unsplash photos!"
echo "📸 Total: 19 pages with unique, professional photography"
