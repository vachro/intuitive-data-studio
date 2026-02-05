import type { DocumentActionComponent } from "sanity";
import type { SanityClient } from "@sanity/client";

function toCleanId(oldId: string) {
  return oldId.replace(/\./g, "-");
}

function stripSystemFields(doc: Record<string, unknown>) {
  const { _createdAt, _updatedAt, _rev, ...rest } = doc as any;
  return rest as Record<string, unknown>;
}

async function copyDocIfDotted(client: SanityClient, oldId: string): Promise<string> {
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

export function makeDuplicateOperaAction(
  getClient: (opts: { apiVersion: string }) => SanityClient
): DocumentActionComponent {
  const DuplicateOperaAction: DocumentActionComponent = (props) => {
    const { id, type, draft, published } = props;

    if (type !== "opera") return null;

    return {
      label: "Duplicate to clean ID",
      onHandle: async () => {
        try {
          const client = getClient({ apiVersion: "2026-02-04" });

          const source = (draft || published) as any;
          if (!source) {
            props.onComplete();
            return;
          }

          const newOperaId = toCleanId(id);

          const exists = await client.getDocument(newOperaId);
          if (exists) {
            props.onComplete();
            return;
          }

          // Copy & rewire refs for numbers
          const numbers = Array.isArray(source.numbers) ? source.numbers : [];
          const newNumbers = [];
          for (const ref of numbers) {
            const oldRefId = ref?._ref;
            if (typeof oldRefId !== "string") continue;

            const newRefId = await copyDocIfDotted(client, oldRefId);
            newNumbers.push({ ...ref, _ref: newRefId });
          }

          // Copy & rewire refs for characters
          const characters = Array.isArray(source.characters) ? source.characters : [];
          const newCharacters = [];
          for (const ref of characters) {
            const oldRefId = ref?._ref;
            if (typeof oldRefId !== "string") continue;

            const newRefId = await copyDocIfDotted(client, oldRefId);
            newCharacters.push({ ...ref, _ref: newRefId });
          }

          const baseOpera = stripSystemFields(source);
          const payload = {
            ...baseOpera,
            _id: newOperaId,
            _type: "opera",
            numbers: newNumbers,
            characters: newCharacters,
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
