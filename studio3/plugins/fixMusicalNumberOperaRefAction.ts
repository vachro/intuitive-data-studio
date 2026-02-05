import type { DocumentActionComponent } from "sanity";
import type { SanityClient } from "@sanity/client";

function toCleanId(oldId: string) {
  // "opera.le-nozze-di-figaro" -> "opera-le-nozze-di-figaro"
  return oldId.replace(/\./g, "-");
}

function stripSystemFields(doc: Record<string, unknown>) {
  // Remove fields that cannot/should not be set manually when creating a new document
  const { _createdAt, _updatedAt, _rev, ...rest } = doc as any;
  return rest as Record<string, unknown>;
}

async function copyDocIfMissingWithCleanId(client: SanityClient, oldId: string): Promise<string> {
  // If already clean, nothing to do
  if (!oldId.includes(".")) return oldId;

  const newId = toCleanId(oldId);

  // If the clean doc already exists, just return it
  const existing = await client.getDocument(newId);
  if (existing) return newId;

  // Fetch the source doc (dotted)
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

export function makeFixMusicalNumberOperaRefAction(
  getClient: (opts: { apiVersion: string }) => SanityClient
): DocumentActionComponent {
  const FixAction: DocumentActionComponent = (props) => {
    const { id, type, draft, published } = props;

    if (type !== "musicalNumber") return null;

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
            // Already clean
            props.onComplete();
            return;
          }

          // Ensure clean opera doc exists
          const newOperaRef = await copyDocIfMissingWithCleanId(client, operaRef);

          if (newOperaRef === operaRef) {
            props.onComplete();
            return;
          }

          // Patch the musicalNumber to point to the clean opera id
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
          console.error("Fix musicalNumber opera ref failed:", e);
          props.onComplete();
        }
      },
    };
  };

  return FixAction;
}
