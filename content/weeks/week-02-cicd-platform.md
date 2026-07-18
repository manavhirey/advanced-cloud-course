# Week 2 — Build Your CI/CD Platform: Packer, Jenkins, Terraform

**Assignment:** A01 (spec: `Assignment 01 ….pdf`). The heaviest infrastructure week — everything later runs through this Jenkins. Prior solutions: `ami-jenkins` and `infra-jenkins` (see `reference/worked-repos.md` — reuse the patterns, fix the security issues).

## Learn

- **Immutable infrastructure**: bake config into an AMI with Packer; Terraform only launches it. Jenkins plugins, Docker, nginx/Caddy, certbot all live in the image — only credentials are configured at runtime.
- **Jenkins Configuration as Code (JCasC)** + **Job DSL**: the AMI carries a `jenkins.yaml` defining users, credentials, and seed jobs. Study `ami-jenkins/scripts/jenkins-template.yaml` and the `envsubst` secrets flow.
- **Let's Encrypt**: use the **staging** endpoint while iterating — production rate limits will lock you out mid-week.
- Supplementary deck: `Infra_as_Code_with_Ansible.pdf` — Ansible is an alternative config-management lens (agentless SSH push, idempotent modules, handlers, roles). Worth reading to understand *why* the course chose baked AMIs instead of runtime config management. Key YAML gotchas from the deck apply everywhere: quote `{{ var }}`, space after `:`, `|` vs `>` block scalars, spaces not tabs.

## Build — A01 checklist

`ami-jenkins` repo (org repo + personal fork, README, .gitignore):
- [ ] Packer template: source `Ubuntu 24.04 LTS`, builds a **private** AMI in the root account's default VPC, named so Terraform can filter it (prior: `jenkins-ami_<timestamp>`)
- [ ] AMI bakes: Jenkins + all plugins, Docker + buildx, nginx or Caddy, certbot
- [ ] GitHub Actions: `packer validate` as a required PR status check; AMI build on **merge to main** (the old repo built on PR — fix this); branch protection on `main`
- [ ] JCasC template + Job DSL seed job structure in place (jobs themselves come in Weeks 3–5)

DNS + EIP (root account, console OK for one-time steps):
- [ ] Allocate an Elastic IP, tagged
- [ ] Route 53 A record `jenkins.yourdomain.tld` → EIP, TTL 60

`infra-jenkins` repo:
- [ ] Terraform builds its own VPC/subnets/IGW/route table/SG (not the default VPC), launches the EC2 instance from the latest `jenkins-ami_*` (data source: `owners=["self"]`, `most_recent=true`), associates the EIP
- [ ] Reverse proxy + Let's Encrypt cert obtained on boot; Jenkins reachable at `https://jenkins.yourdomain.tld`
- [ ] `terraform destroy` terminates the instance and **disassociates but does not release** the EIP
- [ ] `pr-check` workflow validates Terraform on every PR
- [ ] Credentials via AWS profile only — no keys as Terraform variables, `*.tfvars` gitignored (the old repo committed live keys; don't repeat this)

## Definition of done

From clean checkouts: a push to `ami-jenkins` main produces a new private AMI; `terraform apply` in `infra-jenkins` gives you a working HTTPS Jenkins at your subdomain in ~5 minutes; `terraform destroy` tears it down cleanly; apply again and the same URL works (EIP survived). All merges went through PRs with passing checks.
