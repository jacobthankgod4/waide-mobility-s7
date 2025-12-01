#!/bin/bash

# Batch script to add hero images to all venue navigation pages

# Define image mappings: page_name:image_file:alt_text
declare -A pages=(
    ["airport-navigation"]="airport-terminal-interior.png:AI-powered airport navigation with terminal wayfinding"
    ["hospital-navigation"]="modern-hospital-interior.png:Smart hospital navigation for patients and visitors"
    ["hotel-navigation"]="luxury-hotel-lobby.png:Hotel navigation system with guest services"
    ["university-navigation"]="university-campus-interior.png:Campus navigation for students and visitors"
    ["library-navigation"]="modern-library-interior.png:Library navigation with resource location"
    ["museum-navigation"]="museum-gallery.png:Museum navigation with interactive exhibits"
    ["office-building-navigation"]="modern-office-lobby.png:Office building navigation and workspace optimization"
    ["casino-navigation"]="casino-interior.png:Casino navigation with gaming floor wayfinding"
    ["train-station-navigation"]="train-station-interior.png:Train station navigation with platform guidance"
    ["subway-navigation"]="subway-station-interior.png:Subway navigation with underground wayfinding"
    ["sports-venue-navigation"]="sports-stadium-interior.png:Sports venue navigation with seat finding"
    ["theme-park-navigation"]="theme-park-interior.png:Theme park navigation with attraction wayfinding"
    ["convention-center-navigation"]="convention-center-interior.png:Convention center navigation for events"
    ["cruise-ship-navigation"]="cruise-ship-interior.png:Cruise ship navigation with deck wayfinding"
    ["manufacturing-navigation"]="manufacturing-facility-interior.png:Manufacturing navigation with factory floor routing"
    ["data-center-navigation"]="data-center-interior.png:Data center navigation with server location"
    ["parking-garage-navigation"]="parking-garage-interior.png:Parking garage navigation with vehicle location"
)

echo "Adding hero images to venue navigation pages..."

for page in "${!pages[@]}"; do
    IFS=':' read -r image alt <<< "${pages[$page]}"
    file="blog/${page}.html"
    
    if [ -f "$file" ]; then
        # Check if hero image already exists
        if ! grep -q "margin-bottom: 2rem" "$file"; then
            echo "Processing $file..."
            
            # Add hero image after opening container div in hero section
            sed -i '' '/<div class="container" style="max-width: 800px; margin: 0 auto;">/a\
                <div style="margin-bottom: 2rem;">\
                    <img src="../public/'"$image"'" alt="'"$alt"'" style="width: 100%; max-width: 800px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,255,255,0.2);">\
                </div>
' "$file"
            
            echo "✅ Added hero image to $page"
        else
            echo "⏭️  Skipping $page (already has hero image)"
        fi
    else
        echo "❌ File not found: $file"
    fi
done

echo ""
echo "✅ Batch image addition complete!"
echo "Run 'git add blog/*.html && git commit -m \"Add hero images to all venue pages\" && git push' to deploy"
