# Week 1 — Linux Containers & Go

**Lectures:** L01 (Linux Containers), L02 (Intro to Go). **Assignment:** read the A01 spec and set up the AWS Organization + GitHub org (the Week 2 build goes faster with accounts ready).

## Learn

### Containers from first principles (L01)
- A container is **not a VM** — it's a set of Linux processes isolated by kernel **namespaces** (pid, net, mnt, ipc, UTS, user) and constrained by **cgroups** (CPU/memory). Read: [What's a Linux container?](https://www.redhat.com/en/topics/containers/whats-a-linux-container), [namespaces man page](https://man7.org/linux/man-pages/man7/namespaces.7.html)
- The **OCI** standardizes the [image format](https://github.com/opencontainers/image-spec) and [runtime](https://github.com/opencontainers/runtime-spec) — why Docker, podman, buildah, CRI-O interoperate.
- **PID 1 in containers**: signal handling and zombie reaping — why `CMD ["binary"]` vs shell-form matters.
- Image hygiene: minimize layers; [distroless](https://github.com/GoogleContainerTools/distroless) base images (no shell/package manager); [Google's container best practices](https://cloud.google.com/architecture/best-practices-for-building-containers).
- Registries: Docker Hub (course standard, private repos), ECR, Artifact Registry.

Exercise: rebuild an image you use on a distroless base and compare size + attack surface. Explore `podman` and `buildah` as Docker alternatives.

### Go (L02)
Go is the course language — the CVE processor/consumer (Weeks 5–8) and the Operator (Week 10) are all Go.
- [Take your first steps with Go](https://learn.microsoft.com/en-us/training/paths/go-first-steps/) (Microsoft Learn) or [The Little Go Book](https://www.openmymind.net/The-Little-Go-Book/)
- [Error Handling and Go](https://go.dev/blog/error-handling-and-go) — errors as values; the idiom everything else builds on
- Reference books: *The Go Programming Language* (Kernighan/Donovan), *Go in Action*

Exercise: write a small Go program that downloads a zip over HTTP, walks its JSON files, and prints a summary — this is a dry run for the Week 5 CVE loader.

## Build — pre-work for A01

- [ ] Enable **AWS Organizations** in your AWS account (it becomes `root`); create `dev` and `prod` member accounts (Gmail aliases work: `manavhirey+dev@gmail.com`, `+prod`)
- [ ] AWS CLI profiles `dev` and `prod`, region `us-east-1` — deliberately **no `default` profile** (prevents accidental targeting)
- [ ] Create the GitHub org (prior: `alphacloudcomputing`; spec naming: `cyse7125-su24-teamNN`) on the Teams plan
- [ ] Create IAM user `ghactions` (programmatic access only) in the root account — CI will use it to build AMIs

## Definition of done

You can explain namespaces vs cgroups without notes; a Go toolchain project compiles and runs; `aws sts get-caller-identity --profile dev` and `--profile prod` both work; the org exists with you as owner.
