# Week 4 — Helm Deep-Dive, Services, Storage

**Lecture:** L05. **Assignment:** start A03 (CVE Processor) — this week: the release-engineering rails (status checks, Conventional Commits, Helm chart CI/CD) and the database schema; next week: the Go app.

## Learn

- **Helm as package manager**: templating, `Chart.yaml` versioning, chart repositories (a private GitHub repo can serve as one). Commands you'll wire into CI: `helm lint`, `helm template`.
- **Kubernetes [recommended labels](https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/)** (`app.kubernetes.io/*`) — adopt them in every chart from now on.
- **Services**: NodePort (opens a port on every node) vs LoadBalancer (provisions a cloud LB). You used NodePort 30007 in the old `kubernetes/` manifests; charts should make this configurable.
- **Storage model**: PersistentVolume (supply) / PersistentVolumeClaim (demand) decoupling; StorageClasses + dynamic provisioning create EBS/EFS volumes on PVC creation; StatefulSets for stable identity + per-replica storage (Cassandra tutorial); zone labels tie volumes to AZs.
- **Conventional Commits & semver**: [conventionalcommits.org](https://www.conventionalcommits.org) — `feat:` → minor, `fix:` → patch, `BREAKING CHANGE` → major. The old `webapp-cve-processor` Jenkinsfile implements exactly this; read it.

## Build — A03 part 1

Platform-wide (this is the week GitHub Actions gets retired for status checks):
- [ ] Move **all PR status checks to Jenkins jobs** across every repo
- [ ] **Conventional Commits enforcement** as a required status check on all repos (Conventional Commits Jenkins plugin) — non-conforming messages block merge

Repos:
- [ ] `webapp-cve-processor` (org + fork, README, .gitignore) — app work next week
- [ ] `helm-webapp-cve-processor` — the chart repo

Helm chart CI/CD in Jenkins:
- [ ] On PR: required check running `helm lint` + `helm template`; either failing blocks merge
- [ ] On merge: job clones, runs **semantic-release** to compute the next version, updates `Chart.yaml`, zips as `<chart>-<version>.zip`, publishes a **GitHub release**

Database migrations:
- [ ] Database `cve`, schema `cve` — **no objects in `public`** (the old repo used `cve_db`; the spec is strict here)
- [ ] Flyway (or Liquibase) migration files for all DDL; idempotent (re-run = no-op); output to stdout
- [ ] Migration container image + its own Jenkins DSL job: private Docker Hub repo, webhook-triggered, **semver tags**, all config/credentials via env vars
- [ ] Wire the migration to run as an **init container** in the chart

## Definition of done

A deliberately bad commit message is blocked by Jenkins on every repo; merging a chart change auto-publishes a versioned GitHub release; the migration image stands up the `cve` schema on an empty local Postgres with zero manual steps, twice in a row.
