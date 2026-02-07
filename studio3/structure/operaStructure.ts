import {StructureBuilder} from 'sanity/structure'
import {DocumentsIcon, UsersIcon, BookIcon, MusicNoteIcon} from '@sanity/icons'

export const operaStructure = (S: StructureBuilder) =>
  S.listItem()
    .title('Opera Database')
    .icon(DocumentsIcon)
    .child(
      S.list()
        .title('Content')
        .items([
          // 1. All Operas List
          S.documentTypeListItem('opera').title('All Operas'),

          S.divider(),

          // 2. Musical Numbers (Grouped by Opera)
          S.listItem()
            .title('Musical Numbers')
            .icon(MusicNoteIcon)
            .child(
              S.documentTypeList('opera')
                .title('Select Opera')
                .child((operaId) =>
                  S.documentList()
                    .title('Musical Numbers')
                    .schemaType('musicalNumber')
                    .filter('_type == "musicalNumber" && opera._ref == $operaId')
                    .params({operaId})
                    .initialValueTemplates([
                      S.initialValueTemplateItem('musicalNumber-by-opera', {operaId})
                    ])
                )
            ),

          // 3. Characters (Grouped by Opera)
          S.listItem()
            .title('Characters')
            .icon(UsersIcon)
            .child(
              S.documentTypeList('opera')
                .title('Select Opera')
                .child((operaId) =>
                  S.documentList()
                    .title('Characters')
                    .schemaType('operaCharacter')
                    .filter('_type == "operaCharacter" && opera._ref == $operaId')
                    .params({operaId})
                    .initialValueTemplates([
                      S.initialValueTemplateItem('operaCharacter-by-opera', {operaId})
                    ])
                )
            ),

          // 4. Libretti (Grouped by Opera)
          S.listItem()
            .title('Libretti')
            .icon(BookIcon)
            .child(
              S.documentTypeList('opera')
                .title('Select Opera')
                .child((operaId) =>
                  S.documentList()
                    .title('Libretti')
                    .schemaType('librettoText')
                    .filter('_type == "librettoText" && opera._ref == $operaId')
                    .params({operaId})
                    .initialValueTemplates([
                      S.initialValueTemplateItem('librettoText-by-opera', {operaId})
                    ])
                )
            ),
        ])
    )