# Week 0 — Onboarding: Accounts, Tooling, DNS

**Assignment:** A00 (spec: `material/assignments/Assignment 00 ….pdf`). Ungraded in the original course but a hard prerequisite for everything else — treat it as "first week at a new job."

## Learn

Nothing conceptual this week; it's all setup. Skim Lecture 01's reading list if you want a head start on containers.

## Build — environment checklist

Accounts (use personal email; MFA + strong passwords everywhere — you bear all costs):
- [ ] GitHub + GitHub Student Developer Pack; GitHub **Teams** plan (needed for a private org later)
- [ ] AWS account (this becomes the `root` org account in Week 2)
- [ ] GCP account (light use; free tier fine)
- [ ] Docker Hub **Pro** (private repos needed from Week 3 on)
- [ ] JetBrains student license (GoLand or IntelliJ Ultimate + Go plugin)
- [ ] Optional: Namecheap

Local tooling:
- [ ] Git (username, commit email, SSH to GitHub)
- [ ] VS Code (or editor of choice) + GoLand
- [ ] Docker (with buildx), AWS CLI, gcloud, Ansible
- [ ] kubectl, kops, minikube (+ hypervisor), kind
- [ ] Go — verify with a hello-world build
- [ ] PostgreSQL locally (used in Weeks 4–5)
- [ ] Terraform + Packer (needed Week 2; not in the A00 list but required immediately after)

DNS:
- [ ] A domain you control (avoid `.dev` — HSTS-preloaded, complicates Let's Encrypt HTTP work). Prior course used `manavhirey.me`.
- [ ] Route 53 public hosted zone for the domain; point the registrar's nameservers at the Route 53 ones. Verify with `dig NS yourdomain.tld`.

## Definition of done

`docker run hello-world`, `terraform version`, `packer version`, `kubectl version --client`, `go version`, `aws sts get-caller-identity`, and `dig NS yourdomain.tld` (returning Route 53 nameservers) all succeed.
