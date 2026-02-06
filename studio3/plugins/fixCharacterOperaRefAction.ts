import type { DocumentActionComponent } from "sanity";
import type { SanityClient } from "@sanity/client";

function toCleanId(oldId: string) {
  // "opera.le-nozze-di-figaro" -> "opera-le-nozze-di-figaro"
  return oldId.replace(/\./g, "-");
}

function stripSystemFields(doc: Record<string, unknown>) {
  const { _createdAt, _updatedAt, _rev, ...rest } = doc as any;
  return rest as Record<string, unknown>;
}

async function copyDocIfMissingWithCleanId(
  client: SanityClient,
  oldId: string
): Promise<string> {
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

export function makeFixCharacterOperaRefAction(
  getClient: (opts: { apiVersion: string }) => SanityClient
): DocumentActionComponent {
  const FixAction: DocumentActionComponent = (props) => {
    const { id, type, draft, published } = props;

    if (type !== "operaCharacter") return null;

    return {
      label: "Fix opera ref (remove dots)",
      onHandle: async () => {
        try {
          const client = getClient({ apiVersion: "2026-02-04" });

          const source = (draft || published) as any;
          if (!source) {
            props.onComplete();
            return;
          }

          const operaRef: string | undefined = source?.opera?._ref;
          if (!operaRef || typeof operaRef !== "string") {
            props.onComplete();
            return;
          }

          if (!operaRef.includes(".")) {
            props.onComplete();
            return;
          }

          const newOperaRef = await copyDocIfMissingWithCleanId(client, operaRef);

          if (newOperaRef === operaRef) {
            props.onComplete();
            return;
          }

          await client
            .patch(id)
            .set({
              opera: {
                _type: "reference",
                _ref: newOperaRef,
              },
            })
            .commit();

          props.onComplete();
        } catch (e) {
          console.error("Fix operaCharacter opera ref failed:", e);
          props.onComplete();
        }
      },
    };
  };

  return FixAction;
}
