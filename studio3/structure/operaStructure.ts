// /studio3/structure/operaStructure.ts
import {StructureBuilder} from 'sanity/structure'

export const operaStructure = (S: StructureBuilder) =>
  S.listItem()
    .title('Operas')
    .child(
      S.list()
        .title('Opera content')
        .items([
          S.documentTypeListItem('opera').title('Operas'),

          S.divider(),

          S.documentTypeListItem('musicalNumber').title('Musical numbers'),
          S.documentTypeListItem('operaCharacter').title('Characters'),
          S.documentTypeListItem('librettoText').title('Libretti'),
        ])
    )