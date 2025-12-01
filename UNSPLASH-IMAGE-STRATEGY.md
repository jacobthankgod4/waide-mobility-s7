# Unsplash Image Strategy - Real, Unique Photos

## Why Unsplash?
- ✅ High-quality professional photography
- ✅ Free to use (even commercially)
- ✅ Real venues, real people, real context
- ✅ Diverse, authentic imagery
- ✅ No AI-generated content

## Image Selection Criteria
1. **Real venues** - Actual hospitals, hotels, airports, etc.
2. **Diverse representation** - African context when possible
3. **High resolution** - Minimum 1920px width
4. **Contextually relevant** - Matches page narrative
5. **Unique per page** - No image reuse across pages

---

## Curated Unsplash Images by Page

### 🏥 Hospital Navigation

**Hero Image:**
- Search: "modern hospital interior lobby"
- URL: https://unsplash.com/photos/[hospital-lobby-id]
- Photographer credit required
- Alt: "Modern hospital lobby with clear wayfinding signage"

**Mid-Content:**
- Search: "hospital corridor patient"
- URL: https://unsplash.com/photos/[hospital-corridor-id]
- Shows: Patient navigating hospital hallway
- Alt: "Patient navigating hospital corridor with accessibility features"

**Integration:**
- Search: "hospital staff technology tablet"
- URL: https://unsplash.com/photos/[hospital-tech-id]
- Shows: Healthcare worker using digital system
- Alt: "Healthcare professional using digital navigation system"

---

### 🏨 Hotel Navigation

**Hero Image:**
- Search: "luxury hotel lobby africa"
- URL: https://unsplash.com/photos/[hotel-lobby-id]
- Photographer credit required
- Alt: "Luxury hotel lobby with modern design and guest services"

**Mid-Content:**
- Search: "hotel guest reception check-in"
- URL: https://unsplash.com/photos/[hotel-guest-id]
- Shows: Guest at hotel reception
- Alt: "Hotel guest receiving personalized navigation assistance"

**Integration:**
- Search: "hotel concierge service technology"
- URL: https://unsplash.com/photos/[hotel-service-id]
- Shows: Concierge with digital tools
- Alt: "Hotel concierge using integrated guest services platform"

---

### 🎓 University Navigation

**Hero Image:**
- Search: "university campus building africa students"
- URL: https://unsplash.com/photos/[campus-building-id]
- Photographer credit required
- Alt: "University campus with students navigating between buildings"

**Mid-Content:**
- Search: "students walking campus hallway"
- URL: https://unsplash.com/photos/[students-walking-id]
- Shows: Students in campus corridor
- Alt: "Students navigating university campus with mobile devices"

**Integration:**
- Search: "university library students studying"
- URL: https://unsplash.com/photos/[library-students-id]
- Shows: Students in modern library
- Alt: "Students using campus navigation to find study spaces"

---

### 🛍️ Mall Navigation

**Hero Image:**
- Search: "shopping mall interior modern africa"
- URL: https://unsplash.com/photos/[mall-interior-id]
- Shows: Busy shopping center
- Alt: "Modern shopping mall with multiple levels and retail stores"

**Mid-Content:**
- Search: "people shopping mall walking"
- URL: https://unsplash.com/photos/[shoppers-id]
- Shows: Shoppers navigating mall
- Alt: "Shoppers navigating multi-level shopping center"

**Integration:**
- Search: "mall directory digital screen"
- URL: https://unsplash.com/photos/[mall-directory-id]
- Shows: Digital wayfinding kiosk
- Alt: "Interactive digital directory in shopping mall"

---

### 📦 Warehouse Navigation

**Hero Image:**
- Search: "warehouse logistics modern"
- URL: https://unsplash.com/photos/[warehouse-id]
- Shows: Large warehouse facility
- Alt: "Modern warehouse with organized inventory and logistics operations"

**Mid-Content:**
- Search: "warehouse worker scanning inventory"
- URL: https://unsplash.com/photos/[warehouse-worker-id]
- Shows: Worker with handheld device
- Alt: "Warehouse worker using digital navigation for inventory management"

**Integration:**
- Search: "warehouse management system dashboard"
- URL: https://unsplash.com/photos/[warehouse-tech-id]
- Shows: Logistics technology
- Alt: "Warehouse management system with real-time tracking"

---

### ✈️ Airport Navigation

**Hero Image:**
- Search: "airport terminal modern africa passengers"
- URL: https://unsplash.com/photos/[airport-terminal-id]
- Shows: Busy airport terminal
- Alt: "Modern airport terminal with passengers and flight information displays"

**Mid-Content:**
- Search: "airport passenger walking terminal"
- URL: https://unsplash.com/photos/[passenger-walking-id]
- Shows: Traveler navigating airport
- Alt: "Passenger navigating airport terminal with mobile device"

**Integration:**
- Search: "airport flight information board"
- URL: https://unsplash.com/photos/[flight-board-id]
- Shows: Digital flight displays
- Alt: "Airport flight information system with real-time updates"

---

## Implementation Process

### Step 1: Download Images
```bash
# Create download script
for each page:
  1. Search Unsplash with specific terms
  2. Select 3 unique, high-quality images
  3. Download at 1920px width
  4. Save to public/unsplash/ directory
  5. Name: [venue]-hero.jpg, [venue]-mid.jpg, [venue]-integration.jpg
```

### Step 2: Attribution
Create `public/unsplash/CREDITS.md`:
```markdown
# Unsplash Photo Credits

## Hospital Navigation
- Hero: Photo by [Photographer Name](unsplash.com/@username)
- Mid: Photo by [Photographer Name](unsplash.com/@username)
- Integration: Photo by [Photographer Name](unsplash.com/@username)

[Repeat for all pages]
```

### Step 3: Update Pages
Replace all AI-generated images with Unsplash photos:
```html
<img src="../public/unsplash/hospital-hero.jpg" 
     alt="Modern hospital lobby with clear wayfinding signage"
     style="width: 100%; max-width: 800px; border-radius: 12px;">
```

---

## Search Terms by Category

### Healthcare
- "modern hospital interior"
- "hospital corridor patient"
- "medical facility lobby"
- "healthcare technology"

### Hospitality
- "luxury hotel lobby"
- "hotel reception modern"
- "hotel guest services"
- "boutique hotel interior"

### Education
- "university campus students"
- "college building interior"
- "campus library modern"
- "students walking hallway"

### Retail
- "shopping mall interior"
- "retail store modern"
- "mall shoppers walking"
- "shopping center architecture"

### Transportation
- "airport terminal modern"
- "train station interior"
- "subway station platform"
- "transit hub passengers"

### Entertainment
- "sports stadium interior"
- "theme park visitors"
- "convention center hall"
- "cruise ship deck"

### Industrial
- "warehouse logistics"
- "manufacturing facility"
- "data center servers"
- "parking garage modern"

---

## Quality Checklist

Before using any image:
- [ ] High resolution (min 1920px)
- [ ] Clear, professional composition
- [ ] Relevant to page context
- [ ] Shows real people/venues
- [ ] Diverse representation
- [ ] Proper lighting and quality
- [ ] Free to use commercially
- [ ] Photographer credited

---

## Next Steps

1. **Manual curation required** - I cannot automatically download from Unsplash
2. **You need to**:
   - Visit unsplash.com
   - Search for each category
   - Download 3 unique images per page (57 total images for 19 pages)
   - Save to `public/unsplash/` directory
   - Provide image filenames

3. **I will then**:
   - Update all pages with new Unsplash images
   - Add proper attribution
   - Ensure unique images per page
   - Optimize for web performance

---

## Alternative: Provide Image URLs

If you want me to proceed faster, provide Unsplash photo IDs:

```
Hospital:
- Hero: https://unsplash.com/photos/[ID]
- Mid: https://unsplash.com/photos/[ID]
- Integration: https://unsplash.com/photos/[ID]

[Repeat for each page]
```

I'll then update the code to use those specific images with proper attribution.
