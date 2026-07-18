# Week 10 — Extending Kubernetes: The CVE Operator

**Lecture:** L10. **Assignment:** A07 — the most engineering-heavy assignment: two CRDs with controllers that watch the CVE Project's GitHub releases and launch processing Jobs.

## Learn

- **The controller pattern**: a reconciliation loop driving actual state toward the desired state declared in resources. Operators = CRDs + controllers encoding operational knowledge.
- **Kubebuilder**: work through the [Kubebuilder Book](https://book.kubebuilder.io/) CronJob tutorial *before* starting — the course demo (`cronjob_types.go` / `cronjob_controller.go`) mirrors it, and A07 is structurally the same problem (a CR that spawns Jobs and tracks their status).
- Key mechanics you'll need: **finalizers** (block deletion until cleanup runs), **status subresources**, **owner references**, requeue-after for periodic polling (hourly release checks), and idempotent reconcile (reconcile may run many times for one event).
- Watch: Dave Cheney, [Lessons Learned Building Kubernetes Controllers](https://www.youtube.com/watch?v=aQI9_PkEq08).

## Build — A07 checklist

`cve-operator` repo (org + fork, full rails: Jenkins checks, Conventional Commits, Helm chart with lint/template CI + semantic-release, private Docker repo for the operator image):

CRD 1 — `GitHubReleasesMonitor`:
- [ ] Spec: `url` (e.g. `https://github.com/CVEProject/cvelistV5/releases`), `monitorFrom` (`now` | a date — process releases from that day onward)
- [ ] Controller checks releases (hourly), creates a `GitHubRelease` CR per new release; already-processed releases ignored
- [ ] Sets **finalizers** on the `GitHubRelease` CRs it creates
- [ ] If a `GitHubRelease` CR is deleted, the monitor **re-creates it** (and its Job runs again)
- [ ] Status: list of releases found, retrieval time (UTC), `monitorFrom` as UTC timestamp

CRD 2 — `GitHubRelease`:
- [ ] Downloads only the release zip asset with **`delta`** in its name; ignores everything else
- [ ] Controller creates a Kubernetes **Job** to process the asset, passing the delta zip URL as a parameter
- [ ] Failed Jobs retried; once a Job succeeds it is **never relaunched** for that CR

Deployment hygiene (all Week 9 standards apply):
- [ ] Operator namespace created by Terraform at bootstrap; resource requests/limits; affinity/anti-affinity; NetworkPolicies

## Definition of done

Apply a `GitHubReleasesMonitor` with `monitorFrom: now` → within the hour, new delta releases appear as `GitHubRelease` CRs with Jobs that feed the Kafka pipeline. Delete a `GitHubRelease` → it comes back and reprocesses. Kill a Job mid-run → it retries; after success it never runs again. `kubectl get githubreleasesmonitor -o yaml` shows a truthful status block.
