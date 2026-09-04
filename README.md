<div align="center">

  <h1>CHAT APP</h1>

  <p>A real-time messaging application</p>

  <div align="center">
    <a href="CONTRIBUTING.md">Contributing Guide</a>
  </div>

  <hr>

</div>

<br/>

<!-- Badges -->
<div align="center">

![License](https://img.shields.io/badge/License-Apache%202.0-blue)

</div>

<p align="center">
  <strong>CHAT APP</strong> is a real-time messaging application with authentication, profiles, and private conversations.
  It is derived from an Apache License 2.0 open-source project originally created by Alamin. Original copyright notices are retained.
</p>

## ✨ Features

- **Secure Authentication** - Email verification, password reset, session management
- **Real-Time Messaging** - Instant message delivery with Supabase Realtime
- **Profile Management** - Customizable profiles with avatar support
- **Friend Search** - Discover and connect with other users
- **Responsive Design** - Perfect on desktop, tablet, and mobile
- **Dark Mode** - Light and dark theme support
- **Optimized Performance** - Infinite pagination and smart data prefetching

## 🚀 Quick Start

### Run Locally (For Development)

**Prerequisites:** Node.js 16+, npm, Git

**Steps:**

```bash
# 1. Clone and install
git clone <this-repository>
cd <this-repository>
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Start development server
npm run dev

# 4. Open http://localhost:5173
```

**Get your Supabase credentials:**

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy `URL` and `Anon` key into `.env.local`

For more detailed setup instructions, see [CONTRIBUTING.md](CONTRIBUTING.md).

## 📚 Documentation

| Document                                 | Purpose                                                |
| ---------------------------------------- | ------------------------------------------------------ |
| [CONTRIBUTING.md](CONTRIBUTING.md)       | How to contribute, development setup, code style       |
| [ARCHITECTURE.md](ARCHITECTURE.md)       | Codebase organization, design patterns, best practices |
| [DATABASE_DESIGN.md](DATABASE_DESIGN.md) | Database schema, security, data flow                   |

## 🛠 Tech Stack

| Category     | Technology                           |
| ------------ | ------------------------------------ |
| **Frontend** | React 18, Vite                       |
| **Styling**  | Tailwind CSS                         |
| **Routing**  | React Router v6                      |
| **Data**     | React Query, Supabase Realtime       |
| **Forms**    | React Hook Form                      |
| **Backend**  | Supabase (PostgreSQL, Auth, Storage) |
| **UI**       | react-hot-toast, react-icons         |

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── features/            # Feature modules (auth, messaging, etc.)
├── contexts/            # Global state (UI Context)
├── services/            # Supabase integration
├── utils/               # Utilities and custom hooks
├── styles/              # Tailwind and global CSS
├── config.js            # App configuration
└── App.jsx              # Main app with routing
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed structure and patterns.

## 🔒 Security

- **Row-Level Security**: Database enforces access control
- **Authentication**: Supabase Auth with email verification
- **Protected Routes**: Only authenticated users access `/chat`
- **Open Source**: Code transparency for security review

For detailed security info, see [DATABASE_DESIGN.md](DATABASE_DESIGN.md).

## 🎯 Learning Goals

This project demonstrates:

- Real-time data synchronization
- Modern React patterns (hooks, custom hooks, context)
- Form validation and error handling
- Responsive design
- Database design with Row-Level Security
- API integration and data fetching
- User authentication flows

Perfect for learning full-stack web development!

## 🤝 Contributing

We'd love your help! Whether it's:

- Reporting bugs
- Adding features
- Improving documentation
- UI/UX improvements
- Accessibility fixes

**Start here:** [CONTRIBUTING.md](CONTRIBUTING.md)

### Common Tasks

```bash
npm run dev        # Start development
npm run build      # Build for production
npm run lint       # Check code style
npm run preview    # Preview production build
```

## 📋 Future Roadmap

- [ ] Message editing and deletion
- [ ] Message reactions with emojis
- [ ] File and image sharing
- [ ] Push notifications
- [ ] Typing indicators
- [ ] User presence (online/offline status)
- [ ] Message threads
- [ ] User blocking
- [ ] TypeScript migration
- [ ] Automated tests

See [Contributing Guide](CONTRIBUTING.md) for details on how to help!

## License

Licensed under the [Apache License 2.0](LICENSE.md). Original copyright notices are retained.

## Original copyright

Original portions of this codebase were created by **Alamin** and are licensed under Apache License 2.0.

## Contributors

See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

## Support

- Read the [architecture docs](ARCHITECTURE.md) for questions about code

---

<div align="center">

Licensed under Apache 2.0

</div>
