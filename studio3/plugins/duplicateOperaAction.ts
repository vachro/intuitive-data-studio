import type { DocumentActionComponent } from "sanity";
import type { SanityClient } from "@sanity/client";

function toCleanOperaId(oldId: string) {
  return oldId.replace(/\./g, "-");
}

function stripSystemFields(doc: Record<string, unknown>) {
  const { _createdAt, _updatedAt, _rev, ...rest } = doc as any;
  return rest as Record<string, unknown>;
}

export function makeDuplicateOperaAction(getClient: (opts: { apiVersion: string }) => SanityClient): DocumentActionComponent {
  const DuplicateOperaAction: DocumentActionComponent = (props) => {
    const { id, type, draft, published } = props;

    if (type !== "opera") return null;

    return {
      label: "Duplicate to clean ID",
      onHandle: async () => {
        try {
          const client = getClient({ apiVersion: "2026-02-04" });

          const source = draft || published;
          if (!source) {
            props.onComplete();
            return;
          }

          const newId = toCleanOperaId(id);

          const existing = await client.getDocument(newId);
          if (existing) {
            props.onComplete();
            return;
          }

          const newDoc = stripSystemFields(source);
          const payload = {
            ...newDoc,
            _id: newId,
            _type: "opera",
          };

          await client.createIfNotExists(payload as any);

          props.onComplete();
        } catch (e) {
          console.error("Duplicate opera failed:", e);
          props.onComplete();
        }
      },
    };
  };

  return DuplicateOperaAction;
}
