# Web Photo Gallery - Product Requirements Document

## Project Overview
The Web Photo Gallery is a responsive React-based web application designed to provide users with a seamless experience for viewing, organizing, and managing photo collections. The application features a clean, modern interface with dark/light mode support, intuitive navigation, and efficient local storage management.

## Core Features
- Three main pages: Home, Gallery, and Management
- Responsive design with dark/light mode toggle
- Interactive photo grid with animation effects
- Photo slideshow with navigation controls
- Comprehensive photo management system
- Local data persistence using IndexedDB
- Local storage for image files

## Technical Stack
- **Frontend Framework**: React.js
- **State Management**: React Context API / Redux
- **Styling**: Tailwind CSS
- **Storage**: IndexedDB for metadata, Local storage for images
- **Routing**: React Router

## Detailed Requirements

### 1. Navigation & Layout
#### 1.1 Navigation Bar
- Three main navigation links: Home, Gallery, Management
- Dark/Light mode toggle button positioned on the right side
- Responsive design for all screen sizes
- Active page indicator

#### 1.2 Footer
- Text: "Smart Gallery - Built by Najongchoon | Contact: najongchoon@gmail.com"
- Consistent across all pages
- Proper spacing from main content

#### 1.3 Page Layout
- Consistent header spacing across pages
- Gallery and Management pages to include:
  - Page title
  - Descriptive subtitle/explanation
  - Dotted separator line below the title section

### 2. Home Page
#### 2.1 Content Structure
- Hero section with application title and brief introduction
- Four feature cards arranged in a responsive grid

#### 2.2 Feature Cards
- Each card to include:
  - Distinctive icon or small image
  - Feature title
  - Brief description (2-3 sentences)
- Interactive hover effects
- Topics to cover:
  1. Photo browsing features
  2. Organization capabilities
  3. Management tools
  4. User experience benefits

### 3. Gallery Page
#### 3.1 Page Header
- Title: "Photo Gallery"
- Descriptive subtitle explaining the gallery features
- Dotted separator line below

#### 3.2 Control Bar
- Positioned below the separator line
- Left side: Section subtitle/description
- Right side: Category dropdown selector
  - Options populated from the categories defined in the Management page
  - Default option "All Categories"

#### 3.3 Photo Grid
- Layout: 5 columns × 4 rows
- Responsive design (fewer columns on smaller screens)
- Each cell properties:
  - Border radius: 15px
  - Consistent padding/margins
  - Image fitted to maintain aspect ratio
  - Image metadata (date, location) displayed as overlay or caption

#### 3.4 Grid Interactions
- Mouse hover effect: Ripple/wave animation on images
- Click action: Opens the expanded view mode

#### 3.5 Expanded View Mode
- Full-screen overlay with semi-transparent background
- Centered display of the selected image at larger size
- Navigation controls:
  - Left/right arrows for moving between images
  - Close button ("X") in the top-right corner
- Keyboard support (optional enhancement):
  - Arrow keys for navigation
  - Escape key to close

#### 3.6 Pagination
- Positioned below the photo grid
- Page numbers with current page indicator
- Previous/Next buttons
- Items per page: 20 (5×4 grid)

### 4. Management Page
#### 4.1 Page Header
- Title: "Photo Management"
- Descriptive subtitle explaining the management features
- Dotted separator line below

#### 4.2 Layout
- Two-column layout (responsive to single column on mobile)
- Left column: Photo Upload Section
- Right column: Category Management Section

#### 4.3 Photo Upload Section
- Form with the following fields:
  - Date (date picker)
  - Location (text input)
  - Photographer (text input)
  - Category (dropdown, populated from Category Management)
  - File upload area with:
    - Drag-and-drop functionality
    - "Browse" button alternative
    - Maximum 10 photos per upload
    - Visual indication of selected files
    - File type restrictions (images only)
- Submit button with loading indicator
- Success/error messaging

#### 4.4 Category Management Section
- Default categories: "Family", "People", "Landscape", "Plants", "Birds", "Others"
- CRUD functionality:
  - Create: Add new category (text input + add button)
  - Read: List all categories
  - Update: Edit category name (inline editing or modal)
  - Delete: Remove category (with confirmation)
- Visual indication of categories in use
- Prevention of deleting categories that have associated photos

### 5. Data Storage
#### 5.1 Image Storage
- Save original photos to the local device's download directory
- Implement file naming convention to prevent duplicates
- Generate and store thumbnails for efficient gallery loading

#### 5.2 IndexedDB Implementation
- Database name: "SmartGalleryDB"
- Object stores:
  1. **Photos**:
     - Key: Auto-generated ID
     - Fields: filename, originalPath, thumbnailPath, date, location, photographer, categoryId, uploadDate
  2. **Categories**:
     - Key: Auto-generated ID
     - Fields: name, description (optional), creationDate

#### 5.3 Data Operations
- Implement CRUD operations for both object stores
- Handle errors and edge cases (storage limits, invalid data)
- Implement data validation before storage

### 6. User Interface Components
#### 6.1 Theme Toggle
- Switch between dark and light modes
- Save preference to local storage
- Apply theme changes immediately without page reload

#### 6.2 Dropdown Menus
- Consistent styling with the overall theme
- Clear visual indication of selected item
- Smooth open/close animations

#### 6.3 Photo Grid Cell
- Border radius: 15px
- Consistent aspect ratio
- Loading state for images
- Error state for failed loads

#### 6.4 Pagination Controls
- Clear indication of current page
- Disabled state for unavailable actions
- Responsive design for different screen sizes

#### 6.5 Form Elements
- Consistent styling across all inputs
- Validation indicators
- Error messages for invalid inputs
- Loading states for async operations

### 7. Animation Effects
#### 7.1 Grid Cell Hover Effect
- Implement wave/ripple effect on image hover
- Smooth transition for the effect
- Consistent timing and appearance

#### 7.2 Modal Transitions
- Smooth open/close animations for the expanded view
- Image transition effects when navigating in expanded view

#### 7.3 Page Transitions
- Subtle transitions between pages
- Loading indicators for async data operations

### 8. Responsive Design
#### 8.1 Breakpoints
- Mobile: <768px
- Tablet: 768px-1024px
- Desktop: >1024px

#### 8.2 Layout Adjustments
- Adjust grid to fewer columns on smaller screens
- Stack two-column layouts to single column on mobile
- Adapt font sizes and spacing for different screen sizes

#### 8.3 Touch Support
- Implement touch gestures for mobile:
  - Swipe for navigation in expanded view
  - Tap to open/close expanded view

### 9. Performance Considerations
#### 9.1 Image Optimization
- Generate and use thumbnails in the grid view
- Implement lazy loading for images
- Progressive image loading when possible

#### 9.2 IndexedDB Efficiency
- Index frequently queried fields
- Batch operations when possible
- Implement cursor-based pagination for large datasets

#### 9.3 Rendering Optimization
- Implement virtualized lists for large collections
- Use React.memo and useMemo for expensive components
- Optimize re-renders with proper key usage

### 10. Error Handling & Edge Cases
#### 10.1 Network/Storage Issues
- Graceful handling of storage limits
- Offline functionality where possible
- Clear error messages for failed operations

#### 10.2 Data Validation
- Validate all form inputs
- Prevent common issues (duplicate categories, invalid file types)
- Defensive coding for unexpected data formats

#### 10.3 User Feedback
- Loading indicators for async operations
- Success/error messages for user actions
- Confirmation dialogs for destructive actions

## Implementation Phases
### Phase 1: Setup & Core Structure
- Project initialization with React
- Routing setup
- Basic layout components
- Theme toggle implementation

### Phase 2: Data Layer
- IndexedDB setup
- Storage utility functions
- Basic CRUD operations

### Phase 3: UI Components
- Grid implementation
- Form components
- Modal/expanded view

### Phase 4: Feature Implementation
- Category management
- Photo upload functionality
- Gallery filtering and pagination

### Phase 5: Polish & Optimization
- Animation effects
- Responsive design refinements
- Performance optimizations
- Thorough testing

## Success Metrics
- Smooth performance with 1000+ photos
- Responsive design working across all common screen sizes
- Complete functionality working without errors
- Intuitive user experience with minimal learning curve

---

This PRD serves as a comprehensive guide for the development of the Web Photo Gallery application. It covers all the requested features while ensuring a high-quality, user-friendly experience. Implementation should follow modern React best practices and maintain a focus on performance and usability.
