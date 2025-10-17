# 🧭 Sanity Project Summary
**Root:** C:\Users\MortenEspelid\dev\idata\intuitive-data-studio\studio3

Total files (after ignore): 21
Text-based files included: 18

## 📂 Directory Structure
  .env
  .env.local.template
  .gitignore
  env.d.ts
  eslint.config.mjs
  package-lock.json
  package.json
  README.md
  sanity.cli.ts
  sanity.config.ts
  TRANSLATIONS.md
  tsconfig.json
  vite.config.ts
  plugins/translateAction.ts
  schemaTypes/author.ts
  schemaTypes/blockContent.ts
  schemaTypes/category.ts
  schemaTypes/index.ts
  schemaTypes/post.ts
  schemaTypes/youtube.ts
  scripts/generate-sanity-summary.cjs

## 📝 README excerpt
# Sanity Blogging Content Studio

Congratulations, you have now installed the Sanity Content Studio, an open-source real-time content editing environment connected to the Sanity backend.

Now you can do the following things:

- [Read “getting started” in the docs](https://www.sanity.io/docs/introduction/getting-started?utm_source=readme)
- Check out the example frontend: [React/Next.js](https://github.com/sanity-io/tutorial-sanity-blog-react-next)
- [Read the blog post about this template](https://www.sanity.io/blog/build-your-own-blog-with-sanity-and-next-js?utm_source=readme)
- [Join the Sanity community](https://www.sanity.io/community/join?utm_source=readme)
- [Extend and build plugins](https://www.sanity.io/docs/content-studio/extending?utm_source=readme)


## ⚙️ Important Files
- sanity.config.ts
- sanity.cli.ts
- vite.config.ts
- tsconfig.json
- .env
- .env.local.template
- README.md
- TRANSLATIONS.md

## 📦 Dependencies
**Dependencies:** @sanity/document-internationalization, @sanity/vision, openai, react, react-dom, sanity, styled-components
**DevDependencies:** @sanity/eslint-config-studio, @types/react, eslint, prettier, typescript

## 🧰 NPM Scripts
- dev: sanity dev
- start: sanity start
- build: sanity build
- deploy: sanity deploy
- deploy-graphql: sanity graphql deploy
- reposum: node scripts/generate-sanity-summary.cjs

## 🧩 Sanity Plugins

### 📄 plugins/translateAction.ts
```
import { DocumentActionProps, DocumentActionComponent } from 'sanity'

/**
 * Sanity Document Action for server-side AI translation
 * Calls external translation API which handles:
 * - fetching from Sanity
 * - translation via OpenAI
 * - creating the translated document back in Sanity
 */
export const translateAction = (getClient: any): DocumentActionComponent =>
  (props: DocumentActionProps) => {
    const { id, type } = props
    if (type !== 'post') return null

    return {
```
## 🧱 Schema Types

### 🧩 schemaTypes/author.ts
```
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
```

### 🧩 schemaTypes/blockContent.ts
```
import {defineType, defineArrayMember} from 'sanity'

export default defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      title: 'Block',
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H1', value: 'h1'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
```

### 🧩 schemaTypes/category.ts
```
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'title',
```

### 🧩 schemaTypes/index.ts
```
import blockContent from './blockContent'
import category from './category'
import post from './post'
import author from './author'
import youtube from './youtube'

export const schemaTypes = [post, author, category, blockContent, youtube]

```

### 🧩 schemaTypes/post.ts
```
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'title',
```

### 🧩 schemaTypes/youtube.ts
```
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'youtube',
  title: 'YouTube Embed',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'YouTube URL',
      type: 'url',
    }),
  ],
  preview: {
    select: {url: 'url'},
```