# Week 12 — Kubernetes Security & Pod Autoscaling (Capstone)

**Lecture:** L12. **Assignment:** A09 — least-privilege RBAC everywhere, metrics server at bootstrap, HPA + PDB on every Deployment. This is the finishing pass that makes the platform production-shaped.

## Learn

- **RBAC model**: Role/ClusterRole (what), RoleBinding/ClusterRoleBinding (who), ServiceAccounts (workload identity). Most workloads don't need the API server at all — for those, disable token mounting (`automountServiceAccountToken: false`).
- **Metrics Server** feeds `kubectl top`, HPA, and VPA — it is not installed by default on EKS. [Docs](https://docs.aws.amazon.com/eks/latest/userguide/metrics-server.html)
- **HPA vs VPA vs in-place resize**: HPA changes replica count; [VPA](https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler) adjusts requests; `InPlacePodVerticalScaling` resizes without restart. [cluster-proportional-autoscaler](https://github.com/kubernetes-sigs/cluster-proportional-autoscaler) scales system components with cluster size.
- **PodDisruptionBudget**: caps voluntary disruptions (drains, upgrades) — the piece that makes Week 9's Cluster Autoscaler safe to scale down.
- Debugging aid: `kubectl events` (the modern `get events`).

## Build — A09 checklist

RBAC (every workload on the cluster):
- [ ] A **unique ServiceAccount per workload**
- [ ] Role or ClusterRole + matching binding, scoped to exactly what each workload needs (the operator needs real API access; the consumer needs none)
- [ ] `automountServiceAccountToken: false` for workloads that don't talk to the API server

Autoscaling:
- [ ] **Metrics server installed by the bootstrap Terraform**
- [ ] **Every Deployment gets an HPA and a PDB** (consumer, autoscaler, operator, Grafana, etc.) — pick sane targets (e.g. CPU 70%) and budgets that respect replica counts

## Definition of done

`kubectl auth can-i --list --as=system:serviceaccount:<ns>:<sa>` shows minimal permissions per workload; `kubectl top nodes/pods` works; load on the consumer (a big Processor run) scales replicas via HPA and node count via the Cluster Autoscaler together; `kubectl drain` on a node respects PDBs.

## Course wrap-up

You now have: an immutable CI/CD platform (Packer/Jenkins/Terraform), a fully Terraform-bootstrapped EKS cluster with Kafka, an event-driven CVE pipeline, a custom Operator feeding it, full observability behind Istio, and least-privilege RBAC with autoscaling at both pod and node level.

Worth doing next:
- Run the full teardown/stand-up one last time and time it — that number is the proof the platform is code.
- Write up the architecture (diagram + decisions) in `workspace-writing/` — this is a strong portfolio/interview artifact, directly relevant to DevOps work at PanAgora.
- Optional extensions from the lectures: VPA, cert-manager + ExternalDNS + external-secrets, an eBPF-based CNI (Cilium), OpenTelemetry tracing through the pipeline.
