import type { DocumentActionComponent } from "sanity";
import { useDocumentOperation } from "sanity";

export function makeDeleteDottedIdAction(): DocumentActionComponent {
  const DeleteDottedIdAction: DocumentActionComponent = (props) => {
    const { id, type, onComplete } = props;

    // Always call the hook in the same render order
    const { delete: del } = useDocumentOperation(id, type);

    const isTargetType =
      type === "opera" || type === "musicalNumber" || type === "operaCharacter";

    const shouldShow = isTargetType && id.includes(".");

    if (!shouldShow) return null;

    return {
      label: "Delete dotted ID (cleanup)",
      tone: "critical",
      onHandle: async () => {
        try {
          del.execute();
        } catch (e) {
          console.error("Delete dotted doc failed:", e);
        } finally {
          onComplete();
        }
      },
    };
  };

  return DeleteDottedIdAction;
}
