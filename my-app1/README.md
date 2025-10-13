# My App - Medical Management System

A modern React-based medical management system for managing patients, medicines, and inventory. This is a frontend-only application that uses local storage for data persistence.

## Features




- **Patient Management**: Add, edit, delete, and search patients
- **Medicine Inventory**: Track medicine stock, expiry dates, and low stock alerts
- **Dashboard**: Overview of system statistics and recent activities
- **Notifications**: Alert system for low stock and expiring medicines
- **Reports**: Generate and view various reports
- **Settings**: Configure alerts and backup/restore data
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **React 19.2.0** - Frontend framework
- **SCSS** - Styling with CSS modules
- **Local Storage** - Data persistence
- **Create React App** - Build tooling

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

## Installation

1. Clone or download the project
2. Navigate to the project directory:
   ```bash
   cd my-app1
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the application

## Available Scripts

### `npm start`
Runs the app in development mode. The page will reload when you make changes.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder. The build is optimized for production.

### `npm run eject`
**Note: this is a one-way operation. Once you `eject`, you can't go back!**

Ejects from Create React App to get full control over the build configuration.

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── Login/                 # Login component
│   ├── common/
│   │   ├── Card/                  # Reusable card component
│   │   ├── Footer/                # Footer component
│   │   ├── Header/                # Header component
│   │   ├── Modal/                 # Modal component
│   │   └── Sidebar/               # Sidebar navigation
│   ├── modals/
│   │   ├── AddMedicineModal/       # Add medicine modal
│   │   ├── AddPatientModal/        # Add patient modal
│   │   └── PatientFilterModal/     # Patient filter modal
│   └── sections/
│       ├── Dashboard/              # Dashboard overview
│       ├── MedicineStocks/         # Medicine inventory
│       ├── Notifications/          # Notifications center
│       ├── PatientManagement/      # Patient management
│       ├── Reports/                # Reports section
│       └── Settings/               # Application settings
├── styles/
│   ├── _mixins.scss               # SCSS mixins
│   ├── _variables.scss            # SCSS variables
│   └── App.scss                   # Global styles
├── App.js                         # Main App component
├── App.css                        # App styles
├── index.js                       # Application entry point
└── index.css                      # Global styles
```

## Features Overview

### Dashboard
- System statistics overview
- Recent activities
- Quick access to main functions
- Visual charts and metrics

### Patient Management
- Add new patients with medical history
- Edit patient information
- Search and filter patients
- View patient details

### Medicine Inventory
- Add medicines with categories and dosages
- Track stock quantities and expiry dates
- Set low stock thresholds
- Monitor expiring medicines

### Notifications
- Low stock alerts
- Expiry date warnings
- System notifications
- Mark notifications as read

### Reports
- Patient reports
- Medicine inventory reports
- Stock level reports
- Custom date range reports

### Settings
- Configure alert preferences
- Backup and restore data
- System preferences
- Export/import functionality

## Data Storage

The application uses **localStorage** to persist data in the browser. This means:

- Data is stored locally on the user's device
- No server or database required
- Data persists between browser sessions
- Backup/restore functionality available

### Data Structure

**Patients:**
```javascript
{
  id: "unique-id",
  firstName: "string",
  lastName: "string",
  email: "string",
  phone: "string",
  dateOfBirth: "date",
  address: "string",
  medicalHistory: "string",
  createdAt: "timestamp"
}
```

**Medicines:**
```javascript
{
  id: "unique-id",
  name: "string",
  category: "string",
  dosage: "string",
  unit: "string",
  stockQuantity: "number",
  minStockLevel: "number",
  price: "number",
  expiryDate: "date",
  supplier: "string",
  createdAt: "timestamp"
}
```

## Styling

The application uses **SCSS** with CSS modules for styling:

- Component-specific styles
- SCSS variables and mixins
- Responsive design
- Modern UI components
- Consistent design system

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Adding New Components

1. Create a new component directory in the appropriate folder
2. Add the component file (`.js`) and styles file (`.module.scss`)
3. Import and use the component in the parent component

### Styling Guidelines

- Use CSS modules for component-specific styles
- Follow the existing SCSS structure
- Use variables from `_variables.scss`
- Use mixins from `_mixins.scss`
- Maintain responsive design principles

### Data Management

- All data operations use localStorage
- Implement proper error handling
- Validate user input
- Provide user feedback for all operations

## Deployment

### Build for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

### Deploy Options

- **Static Hosting**: Deploy the `build` folder to any static hosting service
- **GitHub Pages**: Use GitHub Actions for automatic deployment
- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect your repository for automatic deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.