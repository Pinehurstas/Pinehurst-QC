# Pinehurst Quality Control PWA

A comprehensive Progressive Web Application for quality control inspections at Pinehurst Apartment Services properties.

## Features

### 🏢 **Property Management**
- Support for 40+ properties
- Easy property selection
- Property-specific inspection tracking

### ✅ **Comprehensive Inspections**
- **Entry/Exteriors**: Main entrance, doors, trash bins, walls, floors
- **Common Areas**: Carpets, floors, baseboards, walls, furniture, amenities
- **Restrooms**: Mirrors, countertops, toilets, floors, dispensers, trash
- **Elevators**: Floors, stainless steel, tracks, walls, lights
- **Laundry Rooms**: Machines, floors, walls, trash, ventilation
- **Lounge/Party Rooms**: Furniture, surfaces, appliances, decorations
- **Gym**: Equipment, floors, mirrors, walls, vending machines
- **Trash Chute Rooms**: Doors, walls, floors
- **Miscellaneous Areas**: Windows, vents, signage, high dusting

### 📱 **Mobile-First Design**
- Works on all devices (phones, tablets, computers)
- Responsive design
- Touch-friendly interface
- Professional Pinehurst branding

### 🔄 **Offline Functionality**
- Complete offline operation
- Local data storage
- Sync when online
- No internet required during inspections

### 📊 **Smart Triggers & Alerts**
- **5+ Misses**: Communication trigger alert
- **10+ Misses**: Retraining trigger alert
- **Repeated Misses**: Pattern detection for same items
- Real-time miss counting

### 📸 **Photo Documentation**
- Camera integration for issue documentation
- Photo captions and timestamps
- Secure local storage

### 📝 **Notes & Reporting**
- Add detailed notes to inspections
- Overall cleanliness ratings
- Inspector tracking
- Date/time stamping

### 📈 **Analytics & Reports**
- Dashboard with statistics
- Pass rate calculations
- Recent inspection tracking
- Export to Excel/CSV
- PDF report generation (extensible)

### 🔄 **Data Management**
- Local storage with IndexedDB
- Export/backup capabilities
- Data synchronization ready
- Secure data handling

## Installation & Setup

### 1. **Deploy Files**
Upload all files to a web server with HTTPS support:
```
PinehurstQC-PWA/
├── index.html
├── styles.css
├── app.js
├── sw.js
├── manifest.json
├── icons/
└── README.md
```

### 2. **HTTPS Requirement**
PWAs require HTTPS to function properly. Deploy to:
- Web hosting service with SSL
- GitHub Pages (free HTTPS)
- Netlify (free HTTPS)
- Vercel (free HTTPS)

### 3. **Add Icons**
Create app icons in the `/icons/` directory:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

### 4. **Access the App**
1. Open the URL in any web browser
2. On mobile devices: "Add to Home Screen"
3. On desktop: Install via browser's PWA prompt

## Usage Guide

### **Starting an Inspection**
1. Open the app
2. Go to "New Inspection"
3. Select property and enter inspector name
4. Click "Start Inspection"

### **Conducting Inspection**
1. Tap section headers to expand categories
2. Use toggle switches: Pending → Done → Missed
3. Add photos for issues using camera button
4. Add notes as needed
5. Select overall cleanliness rating
6. Complete inspection

### **Managing Data**
- View all inspections in "Inspections" tab
- Search and filter inspections
- Export data to Excel/CSV
- View analytics in "Reports"

### **Triggers & Alerts**
- App automatically detects trigger conditions
- **5+ misses**: Shows communication alert
- **10+ misses**: Shows retraining alert
- **Repeated misses**: Alerts for pattern detection

## Technical Details

### **Browser Support**
- Chrome 88+
- Firefox 84+
- Safari 14+
- Edge 88+
- Mobile browsers (iOS Safari, Android Chrome)

### **Storage**
- Uses localStorage for data persistence
- Service Worker for offline caching
- IndexedDB for complex data (future enhancement)

### **Performance**
- Fast loading with service worker caching
- Optimized for mobile devices
- Minimal data usage
- Battery-efficient operation

## Integration Options

### **Front/Twilio Integration**
The app is structured to easily integrate with Front for messaging:

```javascript
// Example integration point in app.js
async function sendToFront(message, recipient) {
    // Integration with Front API
    // Send alerts to cleaning team members
}
```

### **Server Sync**
Data synchronization endpoints ready:

```javascript
// Example sync function
async function syncWithServer() {
    // Upload inspection data to server
    // Download updates from server
    // Mark records as synced
}
```

### **Excel Integration**
Current CSV export can be enhanced:
- Direct Excel file generation
- Template matching existing reports
- Automated dashboard updates

## Customization

### **Branding**
Update CSS variables in `styles.css`:
```css
:root {
    --primary-color: #2c5530;    /* Pinehurst green */
    --primary-light: #4a7c4f;
    --accent-color: #d4b86a;     /* Gold accent */
}
```

### **Properties**
Add/modify properties in `app.js`:
```javascript
this.properties = [
    'Anderson Holmes',
    'Aquila Court',
    // Add new properties here
];
```

### **Inspection Categories**
Modify checklist items in `app.js`:
```javascript
this.inspectionCategories = {
    'entry-exteriors': {
        title: 'Entry/Exteriors',
        items: [
            // Modify or add items here
        ]
    }
};
```

## Security & Privacy

- All data stored locally on device
- No data transmitted without explicit sync
- HTTPS required for security
- Camera access only when needed
- No tracking or analytics by default

## Support & Maintenance

### **Updates**
- Service worker automatically updates cache
- Version control through manifest.json
- Seamless updates without user intervention

### **Troubleshooting**
- Clear data in Settings if issues occur
- Refresh page to update service worker
- Check browser console for errors
- Ensure HTTPS is properly configured

### **Backup**
- Export data regularly using backup feature
- Data persists across app updates
- Manual export to Excel for external backup

## Development

### **Local Development**
```bash
# Serve files locally (Python example)
python -m http.server 8000

# Access at http://localhost:8000
```

### **Testing**
- Test offline functionality by disconnecting internet
- Test on various devices and screen sizes
- Verify PWA installation prompts
- Check service worker registration

### **Building Icons**
Use tools like:
- PWA Builder (Microsoft)
- RealFaviconGenerator
- PWA Manifest Generator

## License

Copyright © 2025 Pinehurst Apartment Services
All rights reserved.

---

**Need Help?**
Contact your system administrator or development team for technical support.

**Version**: 1.0.0
**Last Updated**: September 2025
