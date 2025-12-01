#!/bin/bash

# Replace Unsplash URLs with local images for all pages

# Airport
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=1200[^"]*|../public/unsplash/airport-hero.jpg|' blog/airport-navigation.html
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=800[^"]*|../public/unsplash/airport-wayfinding.jpg|' blog/airport-navigation.html

# Hospital  
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=1200[^"]*|../public/unsplash/hospital-hero.jpg|' blog/hospital-navigation.html
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=800[^"]*|../public/unsplash/hospital-corridor.jpg|' blog/hospital-navigation.html

# Hotel
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=1200[^"]*|../public/unsplash/hotel-hero.jpg|' blog/hotel-navigation.html
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=800[^"]*|../public/unsplash/hotel-corridor.jpg|' blog/hotel-navigation.html

# University
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=1200[^"]*|../public/unsplash/university-hero.jpg|' blog/university-navigation.html
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=800[^"]*|../public/unsplash/university-students.jpg|' blog/university-navigation.html

# Mall
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=1200[^"]*|../public/unsplash/mall-hero.jpg|' blog/mall-navigation.html
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=800[^"]*|../public/unsplash/mall-directory.jpg|' blog/mall-navigation.html

# Warehouse
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=1200[^"]*|../public/unsplash/warehouse-hero.jpg|' blog/warehouse-navigation.html
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=800[^"]*|../public/unsplash/warehouse-worker.jpg|' blog/warehouse-navigation.html

# Museum
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=1200[^"]*|../public/unsplash/museum-hero.jpg|' blog/museum-navigation.html
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=800[^"]*|../public/unsplash/museum-visitor.jpg|' blog/museum-navigation.html

# Library
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=1200[^"]*|../public/unsplash/library-hero.jpg|' blog/library-navigation.html
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=800[^"]*|../public/unsplash/library-student.jpg|' blog/library-navigation.html

# Casino
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=1200[^"]*|../public/unsplash/casino-hero.jpg|' blog/casino-navigation.html
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=800[^"]*|../public/unsplash/casino-floor.jpg|' blog/casino-navigation.html

# Office
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=1200[^"]*|../public/unsplash/office-hero.jpg|' blog/office-building-navigation.html
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=800[^"]*|../public/unsplash/office-workspace.jpg|' blog/office-building-navigation.html

# Train
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=1200[^"]*|../public/unsplash/train-hero.jpg|' blog/train-station-navigation.html
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=800[^"]*|../public/unsplash/train-platform.jpg|' blog/train-station-navigation.html

# Subway
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=1200[^"]*|../public/unsplash/subway-hero.jpg|' blog/subway-navigation.html
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=800[^"]*|../public/unsplash/subway-platform.jpg|' blog/subway-navigation.html

# Sports
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=1200[^"]*|../public/unsplash/sports-hero.jpg|' blog/sports-venue-navigation.html
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=800[^"]*|../public/unsplash/sports-concourse.jpg|' blog/sports-venue-navigation.html

# Theme Park
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=1200[^"]*|../public/unsplash/theme-park-hero.jpg|' blog/theme-park-navigation.html
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=800[^"]*|../public/unsplash/theme-park-map.jpg|' blog/theme-park-navigation.html

# Convention
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=1200[^"]*|../public/unsplash/convention-hero.jpg|' blog/convention-center-navigation.html
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=800[^"]*|../public/unsplash/convention-floor.jpg|' blog/convention-center-navigation.html

# Cruise
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=1200[^"]*|../public/unsplash/cruise-hero.jpg|' blog/cruise-ship-navigation.html
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=800[^"]*|../public/unsplash/cruise-deck.jpg|' blog/cruise-ship-navigation.html

# Manufacturing
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=1200[^"]*|../public/unsplash/manufacturing-hero.jpg|' blog/manufacturing-navigation.html
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=800[^"]*|../public/unsplash/manufacturing-worker.jpg|' blog/manufacturing-navigation.html

# Data Center
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=1200[^"]*|../public/unsplash/data-center-hero.jpg|' blog/data-center-navigation.html
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=800[^"]*|../public/unsplash/data-center-technician.jpg|' blog/data-center-navigation.html

# Parking
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=1200[^"]*|../public/unsplash/parking-hero.jpg|' blog/parking-garage-navigation.html
sed -i '' 's|https://images.unsplash.com/photo-[^?]*?w=800[^"]*|../public/unsplash/parking-spaces.jpg|' blog/parking-garage-navigation.html

echo "✅ Updated all HTML files to use local images!"
