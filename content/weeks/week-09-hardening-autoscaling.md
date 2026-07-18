# Week 9 — Resource Hardening & Cluster Autoscaling

**Lecture:** L09. **Assignment:** A06 — Cluster Autoscaler via your own Helm chart, plus resource limits, zone spreading, and network policies across every workload.

## Learn (L09 is dense — all of it lands in A06 or A09)

- **SOPS**: encrypt secret *values* (not keys) in YAML committed to git; Terraform reads them via the `carlpett/sops` provider. Adopt it now — it retires the last excuses for plaintext secrets. [getsops/sops](https://github.com/getsops/sops)
- **Multi-container pod patterns**: Sidecar (auxiliary capability alongside the app), Ambassador (proxy abstracting remote services), Adapter (normalize output). Istio (Week 11) is the sidecar pattern industrialized. [The Distributed System ToolKit](https://kubernetes.io/blog/2015/06/the-distributed-system-toolkit-patterns/)
- **Resource governance**: requests (scheduling) vs limits (enforcement); **LimitRange** for per-namespace defaults; ResourceQuota for aggregate caps.
- **NetworkPolicy**: default allow-all until a policy selects a pod; then default-deny within selection. Practice with [network-policy-recipes](https://github.com/ahmetb/kubernetes-network-policy-recipes).
- **Two autoscaling axes**: HPA scales replicas (Week 12); **Cluster Autoscaler** scales node groups when pods are unschedulable. Read the [EKS best practices guide](https://aws.github.io/aws-eks-best-practices/cluster-autoscaling/) — auto-discovery tags and node-group IAM are where people get stuck.
- Scheduling: node/pod affinity, `topology.kubernetes.io/zone` topology key.

## Build — A06 checklist

`helm-eks-autoscaler` repo (org + fork, full rails: Jenkins PR checks, Conventional Commits, `helm lint`/`template`, semantic-release):
- [ ] Your own Helm chart for the **EKS Cluster Autoscaler**
- [ ] Deployed by the **Terraform bootstrap** into a dedicated namespace, automatically at cluster creation
- [ ] **Mirror all autoscaler images to your Docker Hub org**, one repo per image (no direct pulls from upstream registries)

Cluster-wide hardening:
- [ ] CPU **and** memory requests + limits on every workload (yours, Kafka, Postgres, autoscaler)
- [ ] **LimitRange** in every namespace: default CPU + memory requests/limits
- [ ] Replicas spread across zones via pod affinity with topology key `topology.kubernetes.io/zone`
- [ ] **NetworkPolicies**: only the consumer (and migration job) can reach Postgres; verify other pods are blocked

## Definition of done

Scale a Deployment beyond current capacity → autoscaler adds a node (watch its logs) → scale down → node drains away within ~10 min. A pod with no resources block gets namespace defaults. `kubectl exec` from a non-consumer pod can't reach Postgres; the consumer can. Consumer replicas land in different zones.
