# 🚀 simple-conventional-release

[![CI Pipeline](https://github.com/animation-digital-network/simple-conventional-release/actions/workflows/ci.yml/badge.svg)](https://github.com/animation-digital-network/simple-conventional-release/actions)
[![NPM Version](https://img.shields.io/npm/v/simple-conventional-release)](https://www.npmjs.com/package/simple-conventional-release)
[![License](https://img.shields.io/github/license/animation-digital-network/simple-conventional-release)](https://github.com/animation-digital-network/simple-conventional-release/blob/main/LICENSE)

A **simple automated release notes generator** for Git repositories using **Conventional Commits**.

Supports **GitHub & GitLab** and integrates seamlessly with **CI/CD pipelines**.

## ✨ Features

✅ **Automated Release Notes** – Generates a release note markdown file based on commit messages.<br>
✅ **Supports Conventional Commits** – Categorizes commits into features, fixes, chores, etc.<br>
✅ **GitHub & GitLab Compatible** – Generates correct compare links based on the repository host.<br>
✅ **Use via JavaScript API or CLI**.<br>
✅ **Ideal for CI/CD pipelines**.<br>

## 📦 Installation & Usage

### 📀 Using the CLI

You can use the **CLI** via `npx` without installing the package globally.

#### 🔄 Run via `npx`
```sh
npx simple-conventional-release --repository . --output RELEASE_NOTES.md --from v1.0.0 --to v1.1.0
```

#### 🏦 Install Globally
```sh
npm install -g simple-conventional-release
```

#### 🚀 Usage
```sh
simple-conventional-release --repository . --output RELEASE_NOTES.md --from v1.0.0 --to v1.1.0
```

#### 🔧 Available Options
| Option                | Description                                      | Default |
|-----------------------|--------------------------------------------------|---------|
| `-r, --repository`    | Path to the Git repository                      | `.`     |
| `-o, --output`        | Output file for release notes                   | `RELEASE_NOTES.md` |
| `--from`              | Starting tag for release notes generation       | *Auto-detected* |
| `--to`                | Ending tag for release notes generation         | *Latest tag* |
| `--with-title`        | Include title in the output (`true` or `false`) | `true`  |

### 📜 Using the JavaScript API

You can integrate this tool directly into your JavaScript/TypeScript projects.

#### 📥 Install the package:
```sh
npm install simple-conventional-release
```

#### 🚀 Generate release notes programmatically:
```ts
import { generateReleaseNotes } from 'simple-conventional-release';

generateReleaseNotes({
  repositoryPath: '.',
  tags: { from: 'v1.0.0', to: 'v1.1.0' },
  outputPath: 'RELEASE_NOTES.md'
})
  .then((notes) => console.log('Release Notes:\n', notes))
  .catch((error) => console.error('Error:', error));
```

## 📜 Conventional Commits Support

This tool supports the **Conventional Commits** specification to categorize commits automatically:

| Type       | Description                                          |
|------------|------------------------------------------------------|
| `build`    | Changes that affect the build system or dependencies |
| `chore`    | Routine tasks like refactoring, maintenance, or tooling updates |
| `ci`       | Changes to CI/CD configuration or automation scripts |
| `docs`     | Documentation updates only (e.g., README changes)   |
| `feat`     | Introduction of a new feature                        |
| `fix`      | Bug fixes and patches                                |
| `perf`     | Performance improvements that do not affect functionality |
| `refactor` | Code changes that do not add features or fix bugs   |
| `revert`   | Reverts a previous commit                           |
| `style`    | Code style changes (formatting, whitespace, etc.)   |
| `test`     | Adding or updating tests                            |

## 📋 Roadmap

- [ ] **Case Sensitivity** – Support for case-insensitive commit types and messages.
- [ ] **Customizable Templates** – Allow users to define custom release note templates.
- [ ] **Angular Commit Style** – Support for Angular commit message style.
- [ ] **Customizable Categories** – Allow users to define custom commit categories.
- [ ] **Full Generation** – Generate full release notes with all tags.

## 📝 License

This project is licensed under the **AGPL-3.0** License. See the [LICENSE](https://github.com/animation-digital-network/simple-conventional-release/blob/main/LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please follow the [contribution guidelines](https://github.com/animation-digital-network/simple-conventional-release/blob/main/CONTRIBUTING.md).

## 📬 Issues & Feedback

If you encounter any issues, feel free to report them on our [GitHub Issues](https://github.com/animation-digital-network/simple-conventional-release/issues).
