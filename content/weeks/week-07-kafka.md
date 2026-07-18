# Week 7 — Streaming: Kafka on EKS

**Lecture:** L07. **Assignment:** A05 part 1 — cluster bootstrapping, Kafka, and converting the CVE Processor into a producer. (A05 is the biggest assignment in the course; it's split across Weeks 7–8.)

## Learn

- **Batch vs stream**: bounded datasets processed periodically (MapReduce/Hadoop) vs unbounded continuous data processed with low latency. Read: [What is streaming data?](https://aws.amazon.com/streaming-data/)
- **Kafka fundamentals**: topics, partitions, brokers, producers/consumers, consumer groups. Do the [official quickstart](https://kafka.apache.org/documentation/#quickstart) locally before touching EKS.
- **Terraform Kubernetes + Helm providers**: the cluster-bootstrap pattern — one `terraform apply` creates the cluster *and* installs namespaces + platform charts into it.
- Reliability background: [Building Secure and Reliable Systems](https://sre.google/books/building-secure-reliable-systems/) (Google SRE).

Target architecture (3 namespaces):
```
[ns-1: CVE Processor Job] → publishes → [ns-2: Kafka topic "cve"] → consumed by → [ns-3: CVE Consumer Deployment] → Postgres
```

## Build — A05 part 1

Cluster bootstrapping (in the `infra-aws` Terraform):
- [ ] All Kubernetes **namespaces created via the Terraform Kubernetes provider**
- [ ] **Kafka installed during bootstrap via the Terraform Helm provider** — Bitnami chart recommended; customize values for HA (3 replicas, appropriate storage) rather than accepting defaults
- [ ] Write the **Kafka configuration decisions doc** (PDF deliverable in the original course): replication factor, partitions, storage, listeners — and *why*

CVE Processor changes:
- [ ] Publishes every CVE record to Kafka topic **`cve`** instead of writing to Postgres
- [ ] **Remove the DB init container** from the Processor's pod spec (the DB moves to the consumer side)
- [ ] Still batch semantics: process all JSON files, exit when done; runs as a Kubernetes **Job** on EKS

## Definition of done

Fresh `terraform apply` yields: cluster + namespaces + HA Kafka, no manual steps. Running the Processor Job publishes the full CVE list to topic `cve` — verify with a console consumer. Kill a Kafka broker pod; the cluster stays available.
