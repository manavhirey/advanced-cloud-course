# Week 11 — Observability & Service Mesh

**Lecture:** L11. **Assignment:** A08 — centralized JSON logging to CloudWatch, Prometheus/Grafana metrics, and Istio installed with a custom profile at bootstrap.

## Learn

- **Three pillars**: traces ([OpenTelemetry demo](https://github.com/open-telemetry/opentelemetry-demo)), metrics (Prometheus scrape model + Grafana), logs (Fluent Bit shipping to a sink).
- **Service mesh**: mTLS, traffic management, retries, and telemetry moved out of app code into sidecar proxies (data plane) managed by a control plane. Do the [Istio getting-started + Bookinfo](https://istio.io/latest/docs/setup/getting-started/) walkthrough on kind first.
- **Istio install profiles**: the IstioOperator API — A08 explicitly forbids the `demo`/`default` profiles; you must author a custom profile, including switching access logs to **JSON**.
- Ecosystem operators worth knowing (from L11, used in real platforms): [cert-manager](https://cert-manager.io/), [external-secrets](https://external-secrets.io/latest/), [ExternalDNS](https://github.com/kubernetes-sigs/external-dns).

## Build — A08 checklist

Logging:
- [ ] EKS **control plane logs + container logs → CloudWatch**, configured at bootstrap
- [ ] **Fluent Bit** collects/forwards container logs; customize its config as needed
- [ ] **Every log stream in JSON** — your apps, Kafka, Postgres, and Istio (default Istio does *not* log JSON; set it in your custom profile)
- [ ] IAM for log shipping follows **least privilege** (IRSA role scoped to the log groups)

Metrics:
- [ ] Prometheus on the cluster collecting: Kubernetes cluster/state metrics, **Kafka metrics**, **Postgres metrics via `postgres_exporter`** (prometheus-community)
- [ ] Grafana with dashboards for all three (community dashboards allowed — e.g. [#6417](https://grafana.com/grafana/dashboards/6417) for cluster overview)

Mesh:
- [ ] Latest Istio installed **by the bootstrap Terraform** with your **custom profile**, committed to the bootstrap repo
- [ ] All microservices communicate over the mesh (sidecar injection on your namespaces); Postgres may be excluded

## Definition of done

One `terraform apply` yields a cluster where: `kubectl logs` on any pod shows JSON; the same logs are queryable in CloudWatch Logs Insights; Grafana graphs Kafka consumer lag and Postgres connections while the pipeline runs; `istioctl proxy-status` shows your workloads meshed; mTLS verified between processor→Kafka→consumer hops.
