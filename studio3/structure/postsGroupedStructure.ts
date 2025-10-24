// /studio3/structure/postsGroupedStructure.ts
import { StructureBuilder } from 'sanity/structure'

export const postsGroupedStructure = (S: StructureBuilder) => {
  return S.listItem()
    .title('Posts (Grouped)')
    .child(
      S.documentList()
        .title('Grouped Posts')
        .filter('_type == "post" && language == "en"')
        .defaultOrdering([{ field: 'title', direction: 'asc' }])
        .child((docId) =>
          // For each English post, show all translations that reference it
          S.documentList()
            .title('Translations')
            .filter(
              `_type == "post" && (
                _id == $docId ||
                references($docId) ||
                _system.base.id == $docId ||
                _system.base.id == ^._system.base.id
              )`
            )
            .params({ docId })
            .defaultOrdering([{ field: 'language', direction: 'asc' }])
        )
    )
}
