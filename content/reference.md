# Prior Worked Solutions — What Exists and What to Reuse

Analysis of `/Users/MAC/Documents/AdvanceCloud/Assignments/` — Manav's Summer-cohort work. These implement roughly Assignments 01–03 plus a local Kubernetes deploy. Nothing exists yet for A04–A09 (EKS, Kafka, Operator, observability, RBAC).

## Architecture chain

```
ami-jenkins (Packer bakes JCasC-configured Jenkins AMI)
    → infra-jenkins (Terraform launches it: VPC, EC2, EIP, nginx+certbot at jenkins.manavhirey.me)
        → Jenkins jobs (seeded via Job DSL in the AMI)
            → build static-site and webapp-cve-processor images → Docker Hub (hireym/*)
                → kubernetes/ manifests deploy static-site to minikube
```

## Conventions used (keep these stable if reusing)

- GitHub: org `alphacloudcomputing` (canonical repos), personal fork `hirey-m`, `feature/*` branches, PRs to `main`
- Docker Hub namespace `hireym` — images `alpha_app` (static site), `cveloader`, `initdb`
- AWS: profile `ghactions`, region `us-east-1`
- **Jenkins credential contract** — these IDs are referenced by every Jenkinsfile and the JCasC template; keep them if reusing any pipeline code: `docker_credentials`, `github_pat_id`, `github_pat`, `docker_image`

## Repo-by-repo

### ami-jenkins (maps to A01) — the linchpin
Packer `amazon-ebs` build from Ubuntu 24.04 (`ami-04b70fa74e45c3917`), producing `jenkins-ami_<timestamp>`. `scripts/jenkins.sh` installs Java 17, Docker + buildx, Jenkins, and ~40 plugins via jenkins-cli (configuration-as-code, job-dsl, docker-workflow, github-branch-source, workflow-multibranch, credentials-binding, semantic-versioning…). Secrets flow: GitHub Actions secrets → `PKR_VAR_*` → shell env → `envsubst` into the JCasC yaml (`scripts/jenkins-template.yaml`) baked into the AMI. `groovy/static.groovy` and `groovy/webapp.groovy` are Job DSL seeds for the two multibranch pipeline jobs. This is the "immutable Jenkins" pattern: the AMI bakes all config; Terraform only launches it.
**Gap vs. spec:** the AMI-build workflow runs on `pull_request`; the assignment wants build-on-merge. Fix in the redo.

### infra-jenkins (maps to A01)
Terraform (~> 5.0): VPC `10.0.0.0/24`, public/private subnets, IGW, SG (22/80/443), `data.aws_ami` filter `jenkins-ami_*` owners=self most_recent, t2.small + 30 GB root, pre-allocated EIP attached by allocation ID. `userdata.sh` configures nginx reverse proxy (80 → 8080) and `certbot --nginx -d jenkins.manavhirey.me`. GitHub Actions PR check runs `terraform init` + `validate`. Local tfstate, manual apply.
**The stable-endpoint pattern to keep:** static EIP + Route 53 A record means Jenkins keeps its HTTPS URL across instance re-creation.

### static-site (maps to A01/A02)
Caddy `:8080` serving one `index.html`, Dockerfile from `caddy:latest`, declarative Jenkinsfile (`githubPush()` trigger): checkout → build → push to Docker Hub, image name from Jenkins credential `docker_image`, `cleanWs()` in post.
**Gap vs. A02 spec:** no Helm chart, no probes, no ConfigMap/Secret usage, and the A02 spec wants a Jenkins **DSL**-defined job building a **multi-platform** image.

### webapp-cve-processor (maps to A03)
Go 1.22 (sqlx, lib/pq, viper) batch app: downloads `CVEProject/cvelistV5` main.zip, parses CVE JSON, loads into Postgres — `cves` table with JSONB `data` column, GIN index, unique on (cve_id, version). Flyway image with `V1__Create_CVE_Schema.sql`. The Jenkinsfile is the best release-engineering reference in the repo set: Conventional Commits regex validation → semver computed from commit messages (BREAKING→major, feat→minor, fix→patch) → buildx multi-arch (amd64+arm64) → push `hireym/cveloader:<ver>` and `hireym/initdb:<ver>` → git tag pushed via `github_pat_id`.
**Gaps vs. A03 spec:** DB name/schema must be `cve`/`cve` (repo uses `cve_db`); DB host hardcoded to `localhost` (parameterize via env for K8s); no Helm chart repo (`helm-webapp-cve-processor`) or semantic-release chart pipeline was built; migration should run as an init container.

### kubernetes/ (local deploy exercise)
Bare manifests, not a git repo: Deployment `static-site-deployment` (1 replica, `hireym/alpha_app:latest`, port 8080) + NodePort Service (80 → 8080, nodePort 30007). Manual `kubectl apply` to minikube.

### sample.yaml
Standalone JCasC reference with literal values — the readable schema example for what `jenkins-template.yaml` templates. **Contains live plaintext Docker Hub and GitHub PATs — revoke them.**

## Security fixes required before any reuse

1. Revoke/rotate: AWS keys in `infra-jenkins/variables.tfvars`, Docker Hub PAT + GitHub PAT in `sample.yaml`.
2. Never pass cloud creds as Terraform variables — use AWS profiles locally and OIDC in CI; gitignore `*.tfvars`.
3. Replace the `admin/admin` Jenkins bootstrap in `userdata.sh`.
4. Stop writing credentials into `.env` inside `app/Dockerfile` — inject at runtime via K8s Secrets.
5. Adopt SOPS (Week 9 / Lecture 09) for anything secret that must live in git.
