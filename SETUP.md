# Event Management System Setup Guide

## Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   npx prisma migrate dev
   ```

3. **Create an admin user:**
   
   Option A - Using Prisma Studio (Recommended):
   ```bash
   npx prisma studio
   ```
   Then navigate to the Admin table and create a new admin user. The passwordHash should be generated using bcrypt. You can use this Node.js snippet:
   ```javascript
   const bcrypt = require('bcryptjs');
   bcrypt.hash('yourpassword', 10).then(console.log);
   ```
   
   Option B - Using a temporary script:
   Create a file `create-admin.js`:
   ```javascript
   const { PrismaClient } = require('@prisma/client');
   const bcrypt = require('bcryptjs');
   const prisma = new PrismaClient();
   
   async function main() {
     const hash = await bcrypt.hash('admin123', 10);
     const admin = await prisma.admin.create({
       data: { username: 'admin', passwordHash: hash }
     });
     console.log('Admin created:', admin);
   }
   main();
   ```
   Then run: `node create-admin.js`

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Admin Access

- **Login URL:** `/admin/login`
- **Admin Dashboard:** `/admin/events`

## Features

### Admin Features
- Create, edit, and delete events
- View and manage event attendees
- Export attendee lists as CSV
- Set event capacity limits

### Public Features
- Browse upcoming events
- View event details
- Register for events with custom fields:
  - Name (required)
  - Email (required)
  - Phone (optional)
  - Dietary restrictions/allergies (optional)
  - Accessibility needs (optional)
  - Emergency contact (optional)
  - Age range (optional)
  - How you heard about us (optional)
  - Questions/comments (optional)

## Database

The system uses SQLite with Prisma ORM. The database file is located at `prisma/dev.db`.

To view the database:
```bash
npx prisma studio
```

## Security Notes

- Change the default admin password after first login
- In production, replace the in-memory session store with Redis or database sessions
- Use environment variables for sensitive configuration
- Enable HTTPS in production

## API Endpoints

### Public Endpoints
- `GET /api/events` - List all events
- `GET /api/events/[id]` - Get event details
- `POST /api/events/[id]/attendees` - Register for an event

### Admin Endpoints (Requires Authentication)
- `POST /api/events` - Create event
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event
- `GET /api/events/[id]/attendees` - Get event attendees
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/check` - Check authentication status

