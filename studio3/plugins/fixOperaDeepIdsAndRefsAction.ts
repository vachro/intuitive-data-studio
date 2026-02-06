import type { DocumentActionComponent } from "sanity";
import type { SanityClient } from "@sanity/client";

const API_VERSION = "2026-02-04";

// Only rewrite these ID namespaces
const PREFIXES = ["opera", "musicalNumber", "operaCharacter"] as const;

function isDottedId(s: string) {
  return PREFIXES.some((p) => s.startsWith(`${p}.`));
}

function toCleanId(oldId: string) {
  // "musicalNumber.die-zauberfloete-mn-01-zu-hilfe" -> "musicalNumber-die-zauberfloete-mn-01-zu-hilfe"
  return oldId.replace(/\./g, "-");
}

function stripSystemFields(doc: Record<string, unknown>) {
  const { _createdAt, _updatedAt, _rev, ...rest } = doc as any;
  return rest as Record<string, unknown>;
}

async function copyDocIfMissingWithCleanId(client: SanityClient, oldId: string): Promise<string> {
  if (!isDottedId(oldId)) return oldId;

  const newId = toCleanId(oldId);

  const existing = await client.getDocument(newId);
  if (existing) return newId;

  const src = await client.getDocument(oldId);
  if (!src) return oldId;

  const base = stripSystemFields(src as any);

  await client.createIfNotExists({
    ...base,
    _id: newId,
    _type: (src as any)._type,
  } as any);

  return newId;
}

function collectCandidateIdsDeep(value: unknown, out: Set<string>) {
  if (value == null) return;

  if (Array.isArray(value)) {
    for (const v of value) collectCandidateIdsDeep(v, out);
    return;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, any>;

    // Reference objects
    if (typeof obj._ref === "string" && isDottedId(obj._ref)) {
      out.add(obj._ref);
    }

    for (const v of Object.values(obj)) collectCandidateIdsDeep(v, out);
    return;
  }

  // Also rewrite plain strings that look like dotted IDs
  if (typeof value === "string" && isDottedId(value)) {
    out.add(value);
  }
}

function rewriteDeep(value: unknown, idMap: Map<string, string>): { value: unknown; changed: boolean } {
  if (value == null) return { value, changed: false };

  // Rewrite plain strings that exactly match an old ID
  if (typeof value === "string") {
    const mapped = idMap.get(value);
    if (mapped) return { value: mapped, changed: true };
    return { value, changed: false };
  }

  if (Array.isArray(value)) {
    let changed = false;
    const out = value.map((v) => {
      const r = rewriteDeep(v, idMap);
      if (r.changed) changed = true;
      return r.value;
    });
    return { value: out, changed };
  }

  if (typeof value === "object") {
    const obj = value as Record<string, any>;

    // Rewrite reference objects
    if (typeof obj._ref === "string") {
      const mapped = idMap.get(obj._ref);
      if (mapped) {
        return { value: { ...obj, _ref: mapped }, changed: true };
      }
    }

    let changed = false;
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      const r = rewriteDeep(v, idMap);
      if (r.changed) changed = true;
      out[k] = r.value;
    }
    return { value: out, changed };
  }

  return { value, changed: false };
}

export function makeFixOperaDeepIdsAndRefsAction(
  getClient: (opts: { apiVersion: string }) => SanityClient
): DocumentActionComponent {
  const FixAction: DocumentActionComponent = (props) => {
    const { type, draft, published } = props;

    if (type !== "opera") return null;

    return {
      label: "Fix deep IDs/refs (opera/musicalNumber/operaCharacter)",
      onHandle: async () => {
        try {
          const client = getClient({ apiVersion: API_VERSION });

          const source = (draft || published) as any;
          if (!source) {
            props.onComplete();
            return;
          }

          const targetId: string = source._id; // Patch the same doc (drafts.* if draft is open)

          // 1) Collect dotted IDs anywhere in the document
          const candidates = new Set<string>();
          collectCandidateIdsDeep(source, candidates);

          if (candidates.size === 0) {
            props.onComplete();
            return;
          }

          // 2) Ensure clean-ID docs exist + build mapping old -> new
          const idMap = new Map<string, string>();
          for (const oldId of candidates) {
            const newId = await copyDocIfMissingWithCleanId(client, oldId);
            if (newId !== oldId) idMap.set(oldId, newId);
          }

          if (idMap.size === 0) {
            props.onComplete();
            return;
          }

          // 3) Rewrite the entire doc (excluding system fields) and patch it back
          const base = stripSystemFields(source);
          const rewired = rewriteDeep(base, idMap);

          if (!rewired.changed) {
            props.onComplete();
            return;
          }

          // Never set _id/_type via patch payload
          const { _id, _type, ...payload } = rewired.value as any;

          await client
            .patch(targetId)
            .set(payload)
            .commit({ autoGenerateArrayKeys: true });

          props.onComplete();
        } catch (e) {
          console.error("Fix opera deep IDs/refs failed:", e);
          props.onComplete();
        }
      },
    };
  };

  return FixAction;
}
