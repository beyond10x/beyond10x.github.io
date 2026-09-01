# beyond10x.github.io

Deployment-only repository for the unified [beyond10x website](https://beyond10x.github.io/).

The authored source is [`beyond10x/website`](https://github.com/beyond10x/website). Private Atlas
publishes a tested, immutable artifact to the `published` branch with provenance; this repository's
workflow deploys that exact artifact through GitHub Pages.

Do not edit generated website files here. Documentation changes belong in `website` or in the
repository that owns the technical documentation.

## Deployment contract

Atlas dispatches the Pages workflow from `main` with the full commit SHA of the current
`published` branch head. The workflow accepts only a publication attributed to `b10x-bot[bot]`,
requires its declared Website commit to be in `beyond10x/website` `main` and attributed to the same
bot, and independently verifies every payload file, public route, digest, and deployment count
against the artifact's canonical provenance. It reads `sources.lock.json` and `legacy-routes.json`
from that exact Website commit, hashes their bytes, validates the 19-repository source roster, and
requires every locked source commit to match provenance. Only the verified `_site` checkout is
uploaded to Pages.

The three generated metadata files have distinct serving purposes but one contract:

- `PROVENANCE.json` is the complete artifact record.
- `.well-known/b10x-docs.json` must be byte-for-byte identical to it and is the public discovery
  endpoint.
- `._b10x/deployment.json` is the compact deployment record and must exactly mirror the verified
  Website commit, four digests, and inventory counts.

Run the deployment-control gate locally with:

```bash
bash scripts/gate.sh
```

The gate has no package dependencies. It checks the verifier scripts, their failure boundaries,
the manual bot-only workflow trigger, and the exact immutable action pins. Publication and workflow
dispatch remain Atlas bot operations; running the local gate does not publish anything.
