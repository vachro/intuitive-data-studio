// /studio3/structure/postsGroupedStructure.ts
import { StructureBuilder } from 'sanity/structure'

export const postsGroupedStructure = (S: StructureBuilder) => {
  return S.listItem()
    .title('Posts (Grouped)')
    .child(
      S.documentList()
        .title('Grouped Posts')
        // Base posts (usually English)
        .filter('_type == "post" && language == "en"')
        .defaultOrdering([{ field: 'title', direction: 'asc' }])
        .child((docId) =>
          S.documentList()
            .title('Translations')
            .filter(
              `
              _type == "post" &&
              (
                _id == $docId ||                                  // itself
                references($docId) ||                             // if this post directly references base post
                references(*[_type == "translation.metadata" && references($docId)]._id) // linked via translation.metadata
              )
              `
            )
            .params({ docId })
            .defaultOrdering([{ field: 'language', direction: 'asc' }])
        )
    )
}
