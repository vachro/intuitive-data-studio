// /studio3/structure/postsGroupedStructure.ts
import { StructureBuilder } from 'sanity/structure'

export const postsGroupedStructure = (S: StructureBuilder) => {
  return S.listItem()
    .title('Posts (Grouped)')
    .child(
      S.documentList()
        .title('Grouped Posts')
        // Show English/base posts
        .filter('_type == "post" && language == "en"')
        .defaultOrdering([{ field: 'title', direction: 'asc' }])
        // For each English post, show its translations
        .child((docId) =>
          S.documentList()
            .title('Translations')
            .filter(
              `
              _type == "post" &&
              (
                // The base post itself
                _id == $docId ||

                // Any post that references the same translation.metadata document
                references(*[
                  _type == "translation.metadata" &&
                  references($docId)
                ]._id)
              )
              `
            )
            .params({ docId })
            .defaultOrdering([{ field: 'language', direction: 'asc' }])
        )
    )
}
