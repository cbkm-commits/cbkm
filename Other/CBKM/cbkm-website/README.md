# Calgary Bharathi Kalai Mandram (CBKM) Website

A modern, responsive website for the Calgary Bharathi Kalai Mandram - Tamil Association of Calgary. This website serves as a community platform for promoting Tamil culture, heritage, and traditions in Calgary.

## Features

### Public Website
- **Home Page**: Hero section with organization information and upcoming events
- **Events Page**: Event listings with dual registration (attendee/participant) and ticket purchasing
- **Sponsorship Page**: Business card display for sponsors with different sponsorship levels
- **Gallery Page**: Photo gallery with upload functionality for community events
- **Contact Us Page**: Contact form with submission history and XLSX export
- **About Us Page**: Organization information, mission, and Tamil cultural heritage

### Admin Portal (/admin)
- **Authentication**: Secure login with credentials (cbkmadmin / YYC@Cbkm#2k)
- **Event Management**: Create, edit, and delete events with customizable forms
- **Gallery Management**: Upload and manage photo galleries
- **Sponsorship Management**: Add and manage sponsor information
- **Contact Management**: View contact submissions and export to XLSX
- **Data Export**: Export registrations and contacts as XLSX files

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: TailwindCSS with custom theme
- **Routing**: React Router v6
- **Icons**: Lucide React
- **File Export**: XLSX library for data export
- **UI Components**: Custom components with modern design

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd cbkm-website
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view the website in your browser.

### Admin Access

Visit `/admin` to access the admin portal:
- Username: `cbkmadmin`
- Password: `YYC@Cbkm#2k`

## Available Scripts

### `npm start`
Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.

### `npm run eject`
**Note: this is a one-way operation.** Ejects from Create React App configuration.

## Project Structure

```
src/
├── components/
│   └── Layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Layout.tsx
├── pages/
│   ├── Home.tsx
│   ├── Events.tsx
│   ├── Sponsorship.tsx
│   ├── Gallery.tsx
│   ├── Contact.tsx
│   ├── About.tsx
│   └── Admin/
│       ├── AdminLogin.tsx
│       ├── AdminDashboard.tsx
│       └── AdminPortal.tsx
├── types/
│   └── index.ts
├── data/
│   └── mockData.ts
└── App.tsx
```

## Features Implementation

### Event Registration System
- Dual registration forms for attendees and participants
- Customizable form fields for different event types
- Integration with ticket purchasing systems
- Export registration data to XLSX format

### Sponsorship Management
- Multiple sponsorship levels (Bronze, Silver, Gold, Platinum)
- Business card-style display with logos and descriptions
- Contact information and website links
- Admin management for sponsor information

### Gallery System
- Image upload functionality for administrators
- Responsive grid layout for photo display
- Image metadata (title, description, upload date)
- Modal view for enlarged images

### Contact Management
- Contact form with validation
- Submission history table
- Export functionality for contact data
- Quick reply and call options

## Customization

### Branding
- Update colors in `tailwind.config.js`
- Replace logo in `public/logo.svg`
- Modify organization details in page components

### Admin Credentials
To change admin credentials, update the authentication logic in:
`src/pages/Admin/AdminLogin.tsx`

## Deployment

### Build for Production
```bash
npm run build
```

The build folder contains the optimized production-ready application.

### Environment Variables
Create environment variables for:
- API endpoints
- Database connections
- External service integrations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For support and questions:
- Email: info@cbkm.ca
- Phone: +1 (403) 123-4567

## License

This project is licensed under the MIT License.

