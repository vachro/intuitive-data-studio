// /studio3/structure/postsStructure.ts
import { StructureBuilder } from 'sanity/structure'

export const postsStructure = (S: StructureBuilder) => {
  return S.listItem()
    .title('Posts (Grouped by Base ID)')
    .child(
      S.list()
        .title('Posts by Group')
        .items([
          S.listItem()
            .title('All Posts')
            .child(
              S.documentList()
                .title('All Posts')
                .filter('_type == "post"')
                .defaultOrdering([{ field: '_system.base.id', direction: 'asc' }])
            ),
        ])
    )
}
