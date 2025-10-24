// /studio3/structure/postsGroupedStructure.ts
import { StructureBuilder } from 'sanity/structure'

export const postsGroupedStructure = (S: StructureBuilder) => {
  return S.listItem()
    .title('Posts (Grouped)')
    .child(
      S.documentList()
        .title('Grouped Posts')
        // Base (English) posts only
        .filter('_type == "post" && language == "en"')
        .defaultOrdering([{ field: 'title', direction: 'asc' }])
        // For each base post, show all translations connected through translation.metadata
        .child((docId) =>
          S.documentList()
            .title('Translations')
            .filter(
              `
              _type == "post" &&
              _id in *[
                _type == "translation.metadata" &&
                references($docId)
              ][0].translations[].value->_id
              `
            )
            .params({ docId })
            .defaultOrdering([{ field: 'language', direction: 'asc' }])
        )
    )
}
