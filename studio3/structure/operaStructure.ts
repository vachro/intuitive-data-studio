import {StructureBuilder} from 'sanity/structure'
// You can import icons from @sanity/icons if installed, or remove the .icon() calls below
import {DocumentsIcon, UsersIcon, BookIcon, AsteriskIcon} from '@sanity/icons'

export const operaStructure = (S: StructureBuilder) =>
  S.listItem()
    .title('Operas')
    .child(
      // 1. List all Operas
      S.documentTypeList('opera')
        .title('Select an Opera')
        .child((operaId) =>
          // 2. When an Opera is selected, show a specific list of content for IT
          S.list()
            .title('Opera Content')
            .items([
              // A. The Main Opera Document
              S.documentListItem()
                .schemaType('opera')
                .id(operaId)
                .title('Opera Details')
                .icon(DocumentsIcon),

              S.divider(),

              // B. Musical Numbers (Filtered)
              S.listItem()
                .title('Musical Numbers')
                .icon(AsteriskIcon)
                .child(
                  S.documentList()
                    .title('Musical Numbers')
                    .schemaType('musicalNumber')
                    // Filter: Only show items where the 'opera' reference matches the current ID
                    .filter('_type == "musicalNumber" && opera._ref == $operaId')
                    .params({operaId})
                    // Context: Pass the operaId so new items can auto-populate (requires templates config)
                    .initialValueTemplates([
                      S.initialValueTemplateItem('musicalNumber-by-opera', {operaId})
                    ])
                ),

              // C. Characters (Filtered)
              S.listItem()
                .title('Characters')
                .icon(UsersIcon)
                .child(
                  S.documentList()
                    .title('Characters')
                    .schemaType('operaCharacter')
                    .filter('_type == "operaCharacter" && opera._ref == $operaId')
                    .params({operaId})
                    .initialValueTemplates([
                      S.initialValueTemplateItem('operaCharacter-by-opera', {operaId})
                    ])
                ),

              // D. Libretti (Filtered)
              S.listItem()
                .title('Libretti')
                .icon(BookIcon)
                .child(
                  S.documentList()
                    .title('Libretti')
                    .schemaType('librettoText')
                    .filter('_type == "librettoText" && opera._ref == $operaId')
                    .params({operaId})
                    .initialValueTemplates([
                      S.initialValueTemplateItem('librettoText-by-opera', {operaId})
                    ])
                ),
            ])
        )
    )