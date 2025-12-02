#!/bin/bash

# Manufacturing: manufacturing-worker appears twice, replace LAST with manufacturing-floor
sed -i '' '$ {x; s/manufacturing-worker\.jpg/manufacturing-floor.jpg/; x}; x' blog/manufacturing-navigation.html

# Airport: airport-wayfinding appears twice, replace LAST with airport-passenger  
awk '{if(/airport-wayfinding\.jpg/ && !seen++){first=$0; next} if(/airport-wayfinding\.jpg/){sub(/airport-wayfinding\.jpg/, "airport-passenger.jpg")}} 1' blog/airport-navigation.html > tmp && mv tmp blog/airport-navigation.html

# Convention: convention-floor appears twice, replace LAST with convention-attendee
awk '{if(/convention-floor\.jpg/ && !seen++){first=$0; next} if(/convention-floor\.jpg/){sub(/convention-floor\.jpg/, "convention-attendee.jpg")}} 1' blog/convention-center-navigation.html > tmp && mv tmp blog/convention-center-navigation.html

# Cruise: cruise-deck appears twice, replace LAST with cruise-passenger
awk '{if(/cruise-deck\.jpg/ && !seen++){first=$0; next} if(/cruise-deck\.jpg/){sub(/cruise-deck\.jpg/, "cruise-passenger.jpg")}} 1' blog/cruise-ship-navigation.html > tmp && mv tmp blog/cruise-ship-navigation.html

# Data center: data-center-technician appears twice, replace LAST with data-center-servers
awk '{if(/data-center-technician\.jpg/ && !seen++){first=$0; next} if(/data-center-technician\.jpg/){sub(/data-center-technician\.jpg/, "data-center-servers.jpg")}} 1' blog/data-center-navigation.html > tmp && mv tmp blog/data-center-navigation.html

# Hotel: hotel-corridor appears twice, replace LAST with hotel-guest
awk '{if(/hotel-corridor\.jpg/ && !seen++){first=$0; next} if(/hotel-corridor\.jpg/){sub(/hotel-corridor\.jpg/, "hotel-guest.jpg")}} 1' blog/hotel-navigation.html > tmp && mv tmp blog/hotel-navigation.html

# Library: library-student appears twice, replace LAST with library-digital
awk '{if(/library-student\.jpg/ && !seen++){first=$0; next} if(/library-student\.jpg/){sub(/library-student\.jpg/, "library-digital.jpg")}} 1' blog/library-navigation.html > tmp && mv tmp blog/library-navigation.html

# Museum: museum-visitor appears twice, replace LAST with museum-gallery
awk '{if(/museum-visitor\.jpg/ && !seen++){first=$0; next} if(/museum-visitor\.jpg/){sub(/museum-visitor\.jpg/, "museum-gallery.jpg")}} 1' blog/museum-navigation.html > tmp && mv tmp blog/museum-navigation.html

# Parking: parking-spaces appears twice, replace LAST with parking-driver
awk '{if(/parking-spaces\.jpg/ && !seen++){first=$0; next} if(/parking-spaces\.jpg/){sub(/parking-spaces\.jpg/, "parking-driver.jpg")}} 1' blog/parking-garage-navigation.html > tmp && mv tmp blog/parking-garage-navigation.html

# Sports: sports-concourse appears twice, replace LAST with sports-fan
awk '{if(/sports-concourse\.jpg/ && !seen++){first=$0; next} if(/sports-concourse\.jpg/){sub(/sports-concourse\.jpg/, "sports-fan.jpg")}} 1' blog/sports-venue-navigation.html > tmp && mv tmp blog/sports-venue-navigation.html

echo "✅ Fixed all duplicates properly!"
