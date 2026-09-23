# Frontend clean-room rule

USEBOND is a fresh implementation. Do not copy, adapt, import, restyle or structurally reproduce frontend code, route hierarchies, component hierarchies, layouts, page composition, navigation systems, UI copy, CSS, branding treatments or interaction patterns from repositories under `github.com/ometere123` or from previously supplied project frontends.

The restriction is about information architecture and interaction patterns as well as source-code copying.

## Frozen USEBOND identity

The product should keep these concepts:

- rights registry rather than dashboard;
- frozen licence folio rather than generic detail card;
- sentence-like Use Composer rather than ABI/form exposure;
- Permission Lens with intent-to-clause tracing;
- interpretation stack rather than generic transaction timeline;
- public Permission Passport rather than proof/archive page;
- contextual navigation rather than a persistent multi-module sidebar;
- document rules and whitespace rather than card grids.

## Route guard

Allowed application page routes are exactly:

```text
/
/registry
/terms/[licenceKey]
/intent/[intentKey]
/permit/[permitKey]
```

Do not add `/dashboard`, `/account`, `/settings`, `/protocol`, `/evidence`, `/consensus`, `/new`, `/open`, `/reviews` or similar pages just to mirror familiar app structures.
