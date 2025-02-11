# 🛠 Contributing to simple-conventional-release

Thank you for considering contributing to **simple-conventional-release**! We appreciate your time and effort in improving this project.

## 📜 Guidelines

Before contributing, please review these guidelines to ensure a smooth collaboration.

### 🚀 Getting Started

1. **Fork the repository** to your own GitHub account.
2. **Clone your fork** to your local machine:
   ```sh
   git clone https://github.com/your-username/simple-conventional-release.git
   ```
3. **Navigate into the project directory**:
   ```sh
   cd simple-conventional-release
   ```
4. **Install dependencies**:
   ```sh
   npm install
   ```
5. **Create a new branch** for your feature or fix:
   ```sh
   git checkout -b feature/my-new-feature
   ```

## 📌 Commit Message Guidelines

This project follows **Conventional Commits**. Please use the following format for your commit messages:

```sh
<type>(<scope>): <description>
```

### Example:
```sh
feat(api): add support for custom release notes
fix(ci): resolve issue with Docker build
```

### **Allowed Types**:
- **feat**: New feature
- **fix**: Bug fix
- **chore**: Maintenance tasks
- **ci**: CI/CD related changes
- **docs**: Documentation updates
- **perf**: Performance improvements
- **refactor**: Code refactoring without behavior changes
- **revert**: Reverting previous changes
- **style**: Code style changes (whitespace, formatting)
- **test**: Adding or updating tests
- **build**: Changes affecting the build system or dependencies

Commit messages are automatically checked using `commitlint`.

## 🛠 Running Tests & Linting

Before pushing your changes, please ensure that all tests pass and the code follows linting rules.

### **Run Linting**:
```sh
npm run lint
```

### **Run Type Checking**:
```sh
npm run typecheck
```

### **Run Tests**:
```sh
npm run test
```

## 🔄 Creating a Pull Request

Once you're done making changes:

1. **Commit your changes** using a descriptive commit message following the guidelines above.
2. **Push your branch**:
   ```sh
   git push origin feature/my-new-feature
   ```
3. **Open a pull request** on GitHub:
   - Provide a clear title and description.
   - Link related issues if applicable.
4. **Wait for reviews** and address feedback if needed.

## 💡 Submitting Issues

If you found a bug or have a feature request, please [open an issue](https://github.com/animation-digital-network/simple-conventional-release/issues) with the following information:

- **Description**: A clear explanation of the issue or feature request.
- **Steps to Reproduce**: If applicable, provide step-by-step instructions.
- **Expected Behavior**: Describe what should happen.
- **Actual Behavior**: Describe what actually happens.
- **Screenshots/Logs**: If relevant, include logs or screenshots.

## ❤️ Thank You!

Your contributions make **simple-conventional-release** better! 🚀

