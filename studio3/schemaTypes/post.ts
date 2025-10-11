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
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: {type: 'author'},
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
    }),


    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: {type: 'category'}}],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'seoImage', // prioritér SEO-bildet i forhåndsvisning
      fallbackMedia: 'mainImage',
      language: 'language',
    },
    prepare(selection) {
      const {author, language, media, fallbackMedia, title} = selection
      const langFlag = language ? `[${language.toUpperCase()}]` : ''
      const authorText = author ? `by ${author}` : ''
      const subtitle = [langFlag, authorText].filter(Boolean).join(' ')
      return {
        title,
        subtitle: subtitle || undefined,
        media: media || fallbackMedia, // bruk SEO-bildet om det finnes, ellers mainImage
      }
    },
  },
})
