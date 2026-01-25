// schemaTypes/index.ts

import author from './author'
import post from './post'
import category from './category'
import youtube from './youtube'
import blockContent from './blockContent'

import {operaSchemaTypes} from './opera'

export const schemaTypes = [
  // Existing content
  post,
  author,
  category,
  youtube,
  blockContent,

  // Opera domain
  ...operaSchemaTypes,
]