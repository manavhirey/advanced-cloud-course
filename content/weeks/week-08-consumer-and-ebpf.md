# Week 8 — The CVE Consumer (+ eBPF Detour)

**Lecture:** L08 (eBPF — enrichment, not assignment-critical). **Assignment:** finish A05 — build `webapp-cve-consumer` end-to-end with the same rails as every other service.

## Learn

### Consumer design (the graded part)
- **Deployment vs Job**: the consumer runs forever (≥1 replica), even when the topic is empty.
- **Probe design is the interesting problem here**:
  - Readiness fails only if: can't connect to Kafka, topic `cve` doesn't exist, or can't connect to Postgres.
  - Liveness fails **only when a restart would actually help** — not on transient downstream failures. Restarting a consumer because Kafka is briefly unreachable is a thundering-herd anti-pattern.
- **Idempotent consumption**: detect duplicates (the unique (cve_id, version) constraint is your friend), ignore them, **log every ignored duplicate**.

### eBPF (L08 — read for depth, no deliverable)
Sandboxed programs running inside the kernel, safety-checked by the verifier, JIT-compiled; XDP attaches at the earliest NIC receive path; BPF maps bridge kernel ↔ userspace (Go via [cilium/ebpf](https://ebpf-go.dev/)). This is the technology under Cilium and much of modern K8s networking/observability. Read: [XDP intro](https://www.datadoghq.com/blog/xdp-intro/), [program types](https://ebpf-docs.dylanreimerink.nl/linux/program-type/).

## Build — A05 part 2

Repos (same pattern as Weeks 4–5):
- [ ] `webapp-cve-consumer` (org + fork, README, .gitignore) and `helm-webapp-cve-consumer`
- [ ] Chart CI/CD: `helm lint`/`helm template` PR checks; semantic-release → versioned zip → GitHub release on merge
- [ ] Consumer + migration images: Jenkins DSL jobs, private Docker Hub, webhooks, multi-platform, semver tags

The app (Go):
- [ ] Consumes topic `cve`; stores to Postgres JSONB with indexes; versioning per `cveMetadata` (same model as Week 5)
- [ ] Duplicate detection + logging; keeps running on empty topic; no API/UI
- [ ] DB `cve` / schema `cve`; Flyway migrations via **init container**, idempotent, env-var-configured

Kubernetes:
- [ ] **Deployment**, ≥1 replica, in its own namespace
- [ ] Readiness + liveness probes per the design above
- [ ] All config via ConfigMap/Secret — nothing hardcoded in app or chart
- [ ] Docs (original deliverables, worth writing as design notes): Deployment HA/resiliency rationale; what the liveness probe checks and why

## Definition of done

End-to-end on EKS: Processor Job publishes → consumer drains the topic into Postgres → re-running the Job produces only "duplicate ignored" logs. Delete the consumer pod mid-stream: it resumes without data loss or double-writes. Readiness goes red when you delete the topic; liveness stays green.
