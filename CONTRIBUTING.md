# Contributing to Convayto

Thank you for your interest in contributing to Convayto! This guide will help you get started.

## Code of Conduct

We are committed to providing a welcoming and inclusive community. All contributors are expected to:

- Be respectful and professional
- Welcome diverse perspectives and experiences
- Focus on constructive feedback
- Report unacceptable behavior to the maintainers

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Git
- Supabase account (free tier works great)

### Local Setup

1. **Fork the repository**

   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/Convayto.git
   cd Convayto
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/CodeWithAlamin/Convayto.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your Supabase credentials:

   ```plaintext
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_KEY=your-anon-public-key
   ```

   Find these in your Supabase project settings → API

6. **Start development server**

   ```bash
   npm run dev
   ```

   Open http://localhost:5173

## Making Changes

### Branch Naming

Use descriptive branch names:

- `feat/add-message-reactions` - New feature
- `fix/auth-logout-bug` - Bug fix
- `docs/improve-readme` - Documentation
- `refactor/simplify-message-hook` - Code refactoring

### Commit Messages

Write clear, descriptive commit messages:

```bash
git commit -m "feat: add emoji reactions to messages"
git commit -m "fix: prevent duplicate messages in chat"
git commit -m "docs: improve database setup guide"
```

### Code Style

- Use 2-space indentation
- Use functional components with hooks
- Extract business logic into custom hooks
- Use meaningful variable names
- Add comments for complex logic
- Follow ESLint rules: `npm run lint`

**Example:**

```jsx
// ❌ Don't
const handleClick = () => {
  const x = data.filter((i) => i.id > 5).map((i) => ({ ...i, active: true }));
  setData(x);
};

// ✅ Do
const handleActivateUsers = () => {
  const activeUsers = data
    .filter((user) => user.id > 5)
    .map((user) => ({ ...user, active: true }));
  setData(activeUsers);
};
```

### Styling

Use Tailwind CSS utility classes (no inline `style` prop):

```jsx
// ❌ Don't
<div style={{ padding: '16px', borderRadius: '8px' }}>

// ✅ Do
<div className="p-4 rounded-lg">
```

## Testing Your Changes

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Preview build locally
npm run preview
```

Test in multiple browsers and screen sizes:

- Desktop Chrome
- Desktop Firefox
- Mobile Safari (if possible)
- Mobile Chrome

## Submitting a Pull Request

1. **Keep it focused** - One feature or fix per PR
2. **Update from upstream**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

3. **Push to your fork**

   ```bash
   git push origin your-branch-name
   ```

4. **Open a Pull Request** on GitHub with:

   - Clear title: `Fix: prevent duplicate messages`
   - Description of what changed and why
   - Screenshot/video if UI changes
   - Any related issues: `Fixes #123`

5. **Respond to feedback** - Maintainers may request changes

## Adding New Features

### Before You Start

1. Check if there's an open issue for this feature
2. Open an issue first to discuss the approach
3. Wait for approval before starting major work

### For Larger Features

1. Create an issue describing the feature
2. Discuss implementation approach with maintainers
3. Get approval before investing significant time
4. Follow the same PR process

## Documentation

All code should have:

- Clear function/component names
- Comments explaining "why" (not just "what")
- JSDoc comments for complex functions

Example:

```jsx
/**
 * Formats a timestamp to human-readable date
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string like "Jan 15, 2025"
 */
const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
```

## Common Tasks

### Running Tests

Currently, Convayto doesn't have automated tests. **This is a great area to contribute!** If you'd like to add tests, see the Future Improvements section in the main README.

### Database Changes

If your change affects the database:

1. Document the change in `DATABASE_DESIGN.md`
2. Provide SQL migration steps
3. Update `.env.example` if needed
4. Test thoroughly before submitting

### Adding a New Hook

Place custom hooks in:

- Feature-specific hooks: `src/features/[feature]/use*.js`
- Utility hooks: `src/utils/use*.js`

Follow the naming pattern: `use[ActionOrData]`

Example:

```jsx
// src/features/messageArea/useMessages.js
export const useMessages = (conversationId) => {
  // Hook implementation
};
```

## Questions?

- 💬 Ask in a GitHub issue
- 📧 Contact the maintainer
- 📚 Check `ARCHITECTURE.md` for codebase structure
- 📖 Check `DATABASE_DESIGN.md` for database info

## Recognition

Contributors will be recognized in:

- GitHub contributors list
- Release notes
- Contributor section in README (if you'd like)

Thank you for making Convayto better! 🙌
