// GestiActivités CI pipeline (Jenkins) — replaces .github/workflows/ci.yml.
// Mirrors the same gates: install → lint → typecheck → test → build (x3).
//
// Requirements on the Jenkins controller/agent:
//   - Docker Pipeline plugin + a Docker-capable agent (the stages run inside
//     a node:22-alpine container, matching the project Dockerfiles).
//   - Recommended job triggers: GitHub hook trigger for GITScm polling (push),
//     or "Build on Pull Request" via the GitHub Branch Source plugin.

pipeline {
  agent {
    docker {
      image 'node:22-alpine'
      // root so corepack can activate pnpm into /usr/local/bin
      args '-u root:root'
    }
  }

  options {
    timestamps()
    timeout(time: 20, unit: 'MINUTES')
    disableConcurrentBuilds()
  }

  environment {
    CI = 'true'
  }

  stages {
    stage('Setup pnpm') {
      steps {
        // pnpm version is taken from the "packageManager" field in package.json.
        sh 'corepack enable && corepack prepare pnpm@11.5.0 --activate'
        sh 'pnpm --version && node --version'
      }
    }

    stage('Install') {
      steps {
        sh 'pnpm install --frozen-lockfile'
      }
    }

    stage('Lint') {
      steps {
        sh 'pnpm -r lint'
      }
    }

    stage('Typecheck') {
      steps {
        sh 'pnpm -r typecheck'
      }
    }

    stage('Test') {
      steps {
        sh 'pnpm -r test'
      }
    }

    stage('Build shared') {
      steps {
        sh 'pnpm --filter @gestiactivites/shared build'
      }
    }

    stage('Build server') {
      steps {
        sh 'pnpm --filter server build'
      }
    }

    stage('Build client') {
      steps {
        sh 'pnpm --filter client build'
      }
    }
  }

  post {
    success {
      echo 'CI passed: lint, typecheck, test and builds are green.'
    }
    failure {
      echo 'CI failed — check the failed stage log above.'
    }
  }
}
