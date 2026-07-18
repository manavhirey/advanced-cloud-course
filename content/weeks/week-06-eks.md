# Week 6 — Amazon EKS with Terraform

**Lecture:** L06. **Assignment:** A04. No prior solution exists — from here on you're building fresh. 💰 **Cost warning:** EKS control plane + 3× c3.large on-demand nodes bill hourly; destroy between sessions.

## Learn

### From L06
- Controller hierarchy: Deployment → ReplicaSet → Pods; RollingUpdate knobs (`maxSurge`, `maxUnavailable`, `minReadySeconds`, `progressDeadlineSeconds`).
- EKS AZ constraint: control plane can't use us-east-1e — subnets must span at least two of a/b/c/d/f.
- `aws eks update-kubeconfig --region us-east-1 --name <cluster>` to connect.
- Persistent storage on EKS needs the **EBS CSI driver** add-on plus an **IAM OIDC provider** so service accounts can assume IAM roles (IRSA).
- Study the [terraform-aws-modules/eks](https://registry.terraform.io/modules/terraform-aws-modules/eks/aws/latest) module — whether you use it or hand-roll, understand what it creates.

## Build — A04 checklist

`infra-aws` repo (org + fork, README with stand-up/tear-down):
- [ ] Jenkins PR checks: `terraform fmt -check` **and** `terraform validate` — formatting failures block merge

Networking (us-east-1):
- [ ] VPC; **3 public + 3 private subnets across 3 AZs**; security group

KMS:
- [ ] Symmetric key for EKS secrets envelope encryption; symmetric key for EBS volumes

IAM:
- [ ] Cluster service role; node group role; EBS CSI driver role; **IAM OIDC provider** — all in Terraform

EKS cluster:
- [ ] Kubernetes **1.29** (or current at time of redo); auth mode `EKS API and ConfigMap`
- [ ] Secrets envelope-encrypted with your KMS key; IPv4; endpoint **public and private**
- [ ] Control plane logging: API server, Audit, Authenticator, Controller manager, Scheduler
- [ ] Add-ons at latest versions: **Pod Identity Agent**, **EBS CSI driver**

Managed node group:
- [ ] AL2_x86_64, On-Demand, c3.large; desired 3 / min 3 / max 6; max unavailable 1

## Definition of done

`terraform apply` from nothing → `kubectl get nodes` shows 3 Ready nodes across 3 AZs; a test PVC binds via the EBS CSI driver; control-plane logs appear in CloudWatch; `terraform destroy` leaves nothing orphaned (check EC2, EBS, ENIs, NAT gateways). Deploy the Week 3 static-site chart to it as a smoke test.
