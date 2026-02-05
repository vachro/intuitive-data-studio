import type { DocumentActionComponent } from "sanity";
import type { SanityClient } from "@sanity/client";

function toCleanId(oldId: string) {
  return oldId.replace(/\./g, "-");
}

function stripSystemFields(doc: Record<string, unknown>) {
  const { _createdAt, _updatedAt, _rev, ...rest } = doc as any;
  return rest as Record<string, unknown>;
}

async function copyDocIfMissingWithCleanId(client: SanityClient, oldId: string): Promise<string> {
  if (!oldId.includes(".")) return oldId;

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

function rewireOperaCharacterRefsDeep(value: unknown, idMap: Map<string, string>): { value: unknown; changed: boolean } {
  if (value == null) return { value, changed: false };

  if (Array.isArray(value)) {
    let changed = false;
    const out = value.map((v) => {
      const r = rewireOperaCharacterRefsDeep(v, idMap);
      if (r.changed) changed = true;
      return r.value;
    });
    return { value: out, changed };
  }

  if (typeof value === "object") {
    const obj = value as Record<string, any>;

    // Rewrite references that point to operaCharacter.*
    if (typeof obj._ref === "string" && obj._ref.startsWith("operaCharacter.") && idMap.has(obj._ref)) {
      return { value: { ...obj, _ref: idMap.get(obj._ref) }, changed: true };
    }

    let changed = false;
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      const r = rewireOperaCharacterRefsDeep(v, idMap);
      if (r.changed) changed = true;
      out[k] = r.value;
    }
    return { value: out, changed };
  }

  return { value, changed: false };
}

export function makeFixNumberSingerCharacterRefsAction(
  getClient: (opts: { apiVersion: string }) => SanityClient
): DocumentActionComponent {
  const FixAction: DocumentActionComponent = (props) => {
    const { id, type, draft, published } = props;

    if (type !== "musicalNumber") return null;

    return {
      label: "Fix singers' character refs (remove dots)",
      onHandle: async () => {
        try {
          const client = getClient({ apiVersion: "2026-02-04" });

          const source = (draft || published) as any;
          if (!source) {
            props.onComplete();
            return;
          }

          const singers = Array.isArray(source.singers) ? source.singers : [];
          if (singers.length === 0) {
            props.onComplete();
            return;
          }

          // Build mapping for any dotted operaCharacter refs inside singers[]
          const idMap = new Map<string, string>();

          const collectRefs = (v: unknown) => {
            if (!v) return;
            if (Array.isArray(v)) {
              for (const x of v) collectRefs(x);
              return;
            }
            if (typeof v === "object") {
              const obj = v as any;
              if (typeof obj._ref === "string" && obj._ref.startsWith("operaCharacter.") && obj._ref.includes(".")) {
                idMap.set(obj._ref, toCleanId(obj._ref));
              }
              for (const vv of Object.values(obj)) collectRefs(vv);
            }
          };

          collectRefs(singers);

          if (idMap.size === 0) {
            props.onComplete();
            return;
          }

          // Ensure target operaCharacter docs exist with clean IDs
          for (const oldRef of idMap.keys()) {
            const newRef = await copyDocIfMissingWithCleanId(client, oldRef);
            idMap.set(oldRef, newRef);
          }

          // Rewrite singers[] content
          const rewired = rewireOperaCharacterRefsDeep(singers, idMap);

          if (!rewired.changed) {
            props.onComplete();
            return;
          }

          await client
            .patch(id)
            .set({ singers: rewired.value })
            .commit({ autoGenerateArrayKeys: true });

          props.onComplete();
        } catch (e) {
          console.error("Fix singers' character refs failed:", e);
          props.onComplete();
        }
      },
    };
  };

  return FixAction;
}
