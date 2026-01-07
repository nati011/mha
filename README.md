# Mental Health Addis

A modern Next.js website for Mental Health Addis - an organization dedicated to raising awareness, dismantling stigma, and creating safe spaces for meaningful discussions about mental health in Addis Ababa and beyond.

## Features

- 🏠 **Homepage** - Hero section, mission statement, upcoming events, testimonials
- 📖 **About Us** - Organization mission, values, approach, and journey
- 📅 **Events** - Calendar of upcoming events, event types, and guidelines
- 📚 **Resources** - Educational materials, guides, and support services directory
- 🤝 **Get Involved** - Volunteer opportunities, partnership options, and ways to contribute
- 💬 **Stories** - Community testimonials and blog articles
- 📧 **Contact** - Contact form and information

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
mha/
├── app/                    # Next.js App Router pages
│   ├── about/             # About Us page
│   ├── advocacy/          # Get Involved page
│   ├── contact/           # Contact page
│   ├── events/            # Events page
│   ├── resources/         # Resources page
│   ├── stories/           # Stories/Blog page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable React components
│   ├── EventCard.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── NewsletterSignup.tsx
│   └── TestimonialCard.tsx
├── public/                # Static assets (if any)
└── ...config files
```

## Customization

### Colors

Edit `tailwind.config.ts` to customize the color scheme. The primary colors are defined in the `colors` section.

### Content

All content is currently in the page components. You can:
- Update text content directly in the page files
- Add images to the `public` folder and reference them
- Connect forms to your backend/email service
- Add real event data from a CMS or database

### Forms

The contact form and newsletter signup are currently set up to log to console. To make them functional:
1. Set up a backend API route in `app/api/`
2. Connect to an email service (e.g., SendGrid, Resend) or database
3. Update the form submission handlers

## Building for Production

```bash
npm run build
npm start
```

## License

This project is created for Mental Health Addis. All rights reserved.
