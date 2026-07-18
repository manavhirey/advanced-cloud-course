# Advanced Cloud Computing — Self-Paced Course

A 13-week self-paced rebuild of **CSYE 7125 — Advanced Cloud Computing** (Northeastern, Summer 2024), reconstructed from the lecture PDFs, assignment specs, and Manav's prior worked repos in `/Users/MAC/Documents/AdvanceCloud`.

**The arc:** build your own CI/CD platform from scratch (Packer-baked Jenkins AMI + Terraform), containerize apps, deploy to Kubernetes locally then on EKS, wire up an event-driven Kafka pipeline, extend Kubernetes with a custom Operator, then harden everything with observability, a service mesh, autoscaling, and RBAC.

## How to use this course

1. Follow `weeks/week-NN-*.md` in order. Each week has **Learn** (concepts + curated links from the lectures), **Build** (the assignment as a checklist), and **Definition of done**.
2. Source material lives in `/Users/MAC/Documents/AdvanceCloud/`:
   - `material/lectures/` — lecture outline PDFs (full decks are on Canvas, links inside the PDFs)
   - `material/assignments/` — the authoritative assignment specs; the week files summarize them, read the PDF before starting
   - `Assignments/` — your prior worked solutions (see `reference/worked-repos.md` for what each one does and what to reuse vs. fix)
3. Assignments are cumulative — each builds on the infra from the previous one. Don't skip weeks.
4. Budget: expect real AWS spend from Week 6 onward (EKS control plane + 3× c3.large nodes). **Tear the cluster down between work sessions** — the Terraform stand-up/tear-down being repeatable is itself a course requirement.

## ⚠️ Security debt in the old repos — fix before reuse

The prior worked solutions contain committed secrets. Treat all of these as compromised and revoke/rotate before reusing anything:

- `Assignments/infra-jenkins/variables.tfvars` — **live AWS access key + secret committed**
- `Assignments/sample.yaml` — **live Docker Hub PAT and GitHub fine-grained PAT committed in plaintext**
- `Assignments/infra-jenkins/userdata.sh` — bootstraps Jenkins with `admin/admin`
- `Assignments/webapp-cve-processor/app/Dockerfile` — echoes DB credentials into a `.env` at build time

This redo of the course should use AWS profiles/OIDC, gitignored tfvars, and SOPS (taught in Week 9) instead.

## Course map

| Week | Theme | Lectures | Assignment |
|---|---|---|---|
| 0 | Onboarding: accounts, tooling, DNS | — | A00 — Environment setup |
| 1 | Linux containers & Go | L01, L02 | Start A01 |
| 2 | Build your CI/CD platform: Packer, Jenkins, Terraform | — | A01 — Jenkins AMI + infra |
| 3 | Kubernetes fundamentals: pods, probes, config | L03, L04 | A02 — Static site on K8s |
| 4 | Helm, Services, Storage | L05 | Start A03 |
| 5 | Release engineering: semver, migrations, Go app | L06 (part) | A03 — CVE Processor |
| 6 | Amazon EKS with Terraform | L06 | A04 — EKS cluster |
| 7 | Streaming: Kafka on EKS | L07 | A05 (part 1) — Kafka + producer |
| 8 | Event-driven pipeline (+ eBPF detour) | L08 | A05 (part 2) — CVE Consumer |
| 9 | Resource hardening & cluster autoscaling | L09 | A06 — Autoscaler, limits, NetworkPolicy |
| 10 | Extending Kubernetes: Operators | L10 | A07 — CVE Operator |
| 11 | Observability & service mesh | L11 | A08 — Logging, metrics, Istio |
| 12 | Kubernetes security & pod autoscaling | L12 | A09 — RBAC, HPA, PDB |

Two standalone decks are woven in as supplementary reading: **Infra as Code with Ansible** (Week 2) and **Container Orchestration** (Week 3 — the best single conceptual overview of Kubernetes in the material).

## Standing conventions (apply every week)

These were graded on every assignment; adopt them as habits from Week 2 on:

- **PR-only workflow.** Org repo + personal fork; feature branches; every change merges via PR with required status checks. Prior naming: org `alphacloudcomputing`, fork `hirey-m`.
- **Status checks in Jenkins** (from Week 5 / A03 onward GitHub Actions is not allowed): `packer validate`, `terraform fmt`/`validate`, `helm lint` + `helm template`, Conventional Commits enforcement.
- **Conventional Commits + semantic-release** drive all versioning: container image tags, Helm chart versions, git tags.
- **No hardcoded values** — everything via variables, ConfigMaps, Secrets, Jenkins credentials. No secrets in git, ever.
- **Multi-platform images** (amd64 + arm64 via buildx) pushed to private Docker Hub repos.
- **Everything reproducible**: AMIs baked by CI, clusters stood up and torn down by Terraform alone, migrations idempotent.

## Files

- `weeks/week-00-setup.md` … `weeks/week-12-security-autoscaling.md` — the course itself
- `reference/worked-repos.md` — analysis of the prior solutions: architecture chain, credential contract, what to reuse, what to fix
