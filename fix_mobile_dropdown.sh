#!/bin/bash

# Mobile dropdown content to add
MOBILE_CONTENT='                    <div class="mobile-dropdown-content">
                        <div class="mobile-dropdown-section">
                            <h4>🏥 Healthcare & Public</h4>
                            <a href="blog/hospital-navigation.html" class="dropdown-link">🏥 Hospital Navigation</a>
                            <a href="blog/university-navigation.html" class="dropdown-link">🎓 University Navigation</a>
                            <a href="blog/library-navigation.html" class="dropdown-link">📚 Library Navigation</a>
                            <a href="blog/museum-navigation.html" class="dropdown-link">🏛️ Museum Navigation</a>
                        </div>
                        <div class="mobile-dropdown-section">
                            <h4>🛍️ Commercial & Retail</h4>
                            <a href="blog/mall-navigation.html" class="dropdown-link">🛍️ Mall Navigation</a>
                            <a href="blog/office-building-navigation.html" class="dropdown-link">🏢 Office Building Navigation</a>
                            <a href="blog/hotel-navigation.html" class="dropdown-link">🏨 Hotel Navigation</a>
                            <a href="blog/casino-navigation.html" class="dropdown-link">🎰 Casino Navigation</a>
                        </div>
                        <div class="mobile-dropdown-section">
                            <h4>🚊 Transportation & Logistics</h4>
                            <a href="blog/airport-navigation.html" class="dropdown-link">✈️ Airport Navigation</a>
                            <a href="blog/train-station-navigation.html" class="dropdown-link">🚊 Train Station Navigation</a>
                            <a href="blog/subway-navigation.html" class="dropdown-link">🚇 Subway Navigation</a>
                            <a href="blog/warehouse-navigation.html" class="dropdown-link">📦 Warehouse Navigation</a>
                        </div>
                        <div class="mobile-dropdown-section">
                            <h4>🎪 Entertainment & Events</h4>
                            <a href="blog/sports-venue-navigation.html" class="dropdown-link">⚽ Sports Venue Navigation</a>
                            <a href="blog/theme-park-navigation.html" class="dropdown-link">🎢 Theme Park Navigation</a>
                            <a href="blog/convention-center-navigation.html" class="dropdown-link">🏢 Convention Center Navigation</a>
                            <a href="blog/cruise-ship-navigation.html" class="dropdown-link">🚢 Cruise Ship Navigation</a>
                        </div>
                        <div class="mobile-dropdown-section">
                            <h4>🏭 Industrial & Tech</h4>
                            <a href="blog/manufacturing-navigation.html" class="dropdown-link">🏭 Manufacturing Navigation</a>
                            <a href="blog/data-center-navigation.html" class="dropdown-link">💾 Data Center Navigation</a>
                            <a href="blog/parking-garage-navigation.html" class="dropdown-link">🚗 Parking Garage Navigation</a>
                        </div>
                    </div>'

# Files to fix
FILES="phase-three.html partner.html partner-form.html"

for file in $FILES; do
    if [ -f "$file" ]; then
        echo "Fixing $file..."
        # Add mobile dropdown content before closing nav-item div
        sed -i '' "s|                    </div>|$MOBILE_CONTENT\
                </div>|g" "$file"
    fi
done

echo "Mobile dropdown content added to remaining files"