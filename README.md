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
✅ **Use via JavaScript API or Docker**.<br>
✅ **Ideal for CI/CD pipelines**.<br>

## 📦 Installation & Usage

### 🐳 Using Docker

You can use the **Docker image** to generate release notes in **CI/CD pipelines** or locally.

Environnement variables are optional, the tool will try to detect the repository path and latest tags automatically but you can override them if needed using the following variables:

| Variable                | Description                                  | Default                    |
|-------------------------|----------------------------------------------|----------------------------|
| `CUSTOM_REPOSITORY_PATH` | Path to the Git repository                  | `.`                        |
| `CUSTOM_OUTPUT_PATH`     | Path to save the release notes               | `RELEASE_NOTES.md`         |
| `CUSTOM_FROM_TAG`        | Starting tag for the release notes generation | *Auto-detected*            |
| `CUSTOM_TO_TAG`          | Ending tag for the release notes generation  | *Latest tag*               |


#### 🏗 Pull the image:
```sh
docker pull ghcr.io/animation-digital-network/simple-conventional-release:latest
```

#### 🔧 Run it locally:
```sh
docker run --rm \
  -e CUSTOM_REPOSITORY_PATH=/repo \
  -e CUSTOM_OUTPUT_PATH=RELEASE_NOTES.md \
  -e CUSTOM_FROM_TAG=v1.0.0 \
  -e CUSTOM_TO_TAG=v1.1.0 \
  -v $(pwd):/repo \
  ghcr.io/animation-digital-network/simple-conventional-release
```

#### 🚀 Example with GitHub Actions:

```yaml
jobs:
  release-notes:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Generate Release Notes
        run: |
          docker run --rm \
            -e CUSTOM_REPOSITORY_PATH=/repo \
            -e CUSTOM_OUTPUT_PATH=RELEASE_NOTES.md \
            -e CUSTOM_FROM_TAG=v1.0.0 \
            -e CUSTOM_TO_TAG=v1.1.0 \
            -v $(pwd):/repo \
            ghcr.io/animation-digital-network/simple-conventional-release

      - name: Upload Release Notes
        uses: actions/upload-artifact@v4
        with:
          name: release-notes
          path: RELEASE_NOTES.md
```

#### 🚀 Example with Gitlab CI/CD:

```yaml
release-notes:
  image: ghcr.io/animation-digital-network/simple-conventional-release:latest
  variables:
    CUSTOM_REPOSITORY_PATH: "/repo"
    CUSTOM_OUTPUT_PATH: "RELEASE_NOTES.md"
    CUSTOM_FROM_TAG: "v1.0.0"
    CUSTOM_TO_TAG: "v1.1.0"
  script:
    - docker run --rm \
        -e CUSTOM_REPOSITORY_PATH=$CUSTOM_REPOSITORY_PATH \
        -e CUSTOM_OUTPUT_PATH=$CUSTOM_OUTPUT_PATH \
        -e CUSTOM_FROM_TAG=$CUSTOM_FROM_TAG \
        -e CUSTOM_TO_TAG=$CUSTOM_TO_TAG \
        -v $CI_PROJECT_DIR:/repo \
        ghcr.io/animation-digital-network/simple-conventional-release
  artifacts:
    paths:
      - RELEASE_NOTES.md
    expire_in: 1 week
```

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

## 📝 License

This project is licensed under the **AGPL-3.0** License. See the [LICENSE](https://github.com/animation-digital-network/simple-conventional-release/blob/main/LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please follow the [contribution guidelines](https://github.com/animation-digital-network/simple-conventional-release/blob/main/CONTRIBUTING.md).

## 📬 Issues & Feedback

If you encounter any issues, feel free to report them on our [GitHub Issues](https://github.com/animation-digital-network/simple-conventional-release/issues).
