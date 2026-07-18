# Week 3 — Kubernetes Fundamentals: Pods, Probes, Config

**Lectures:** L03 (networking infra + K8s intro), L04 (objects, pods, config, secrets). **Assignment:** A02 (static site on Kubernetes). Prior partial solution: `static-site` + `kubernetes/` manifests — but A02 additionally requires a Helm chart, probes, ConfigMap/Secret, and a Jenkins DSL job.

## Learn

### Architecture first (read before touching kubectl)
`FALL_2023_L04_01_Container Orchestration.pdf` is the best conceptual overview in the material (follows *Kubernetes in Action*). Internalize:
- Control plane (API server, Scheduler, Controller Manager, etcd) holds state but never runs your apps; workers run them (runtime + kubelet + kube-proxy).
- Pods are the atomic unit — co-located containers sharing namespaces; you almost never create bare pods, controllers do.
- Labels + selectors are the universal grouping mechanism.
- **Probe semantics**: liveness failure → container restarted; readiness failure → pod pulled from Service endpoints (not killed). Mechanisms: HTTP GET (2xx/3xx pass), TCP, Exec.

### From L03/L04
- kubeconfig contexts: `kubectl config get-contexts` / `use-context` for hopping between minikube/kind/EKS.
- Init containers run to completion before app containers (Week 5 uses one for DB migrations).
- ConfigMaps for config, Secrets for sensitive data, injected as env vars or volumes; `imagePullSecrets` for private registries.
- Infra concepts you'll need later: bastion hosts, public vs private hosted zones, subdomain delegation, VPC peering.
- Install a couple of power tools now — they pay off all course: [k9s](https://k9scli.io/), [kubectx/kubens](https://github.com/ahmetb/kubectx), [Stern](https://collabnix.com/tail-kubernetes-with-stern/), Lens.
- Bookmark [Kubernetes The Hard Way](https://github.com/kelseyhightower/kubernetes-the-hard-way) for when cluster internals feel fuzzy.

## Build — A02 checklist

`static-site` repo (private, org + fork): Dockerfile, Caddyfile, HTML.
- [ ] Caddy serving on **8080/HTTP**, Caddyfile + HTML baked into the image (prior repo has this working)
- [ ] Helm chart defining the Pod with **startup, readiness, and liveness probes** (HTTP-based; liveness must fail on crash/OOM, readiness when not serving)
- [ ] All config via **ConfigMap + Secret** — no hardcoded values in the chart
- [ ] Image pulled from a **private** Docker Hub repo (imagePullSecret in the chart)
- [ ] Jenkins job written in **Job DSL, baked into the Jenkins AMI**, building a **multi-platform** (amd64+arm64 buildx) image, triggered by a GitHub webhook
- [ ] Deploy to minikube or kind and prove the probes work (kill Caddy → liveness restart; block the port → readiness removes endpoint)

## Definition of done

`helm install` on a fresh minikube brings the site up with all three probes green; a push to the repo triggers Jenkins → new multi-arch image in the private Docker Hub repo; nothing in the chart is hardcoded (values overridable at install time).
