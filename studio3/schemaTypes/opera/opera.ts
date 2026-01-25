import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'opera',
  title: 'Opera',
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
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'kNumber',
      title: 'Köchel number (K.)',
      type: 'string',
      description: 'Example: K. 620',
    }),

    defineField({
      name: 'premiereYear',
      title: 'Premiere year',
      type: 'number',
    }),

    defineField({
      name: 'originalLanguage',
      title: 'Original language',
      type: 'string',
      options: {list: ['German', 'Italian', 'Latin', 'French', 'Other']},
    }),

    defineField({
      name: 'librettist',
      title: 'Librettist',
      type: 'string',
    }),

    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        {name: 'alt', type: 'string', title: 'Alternative text'},
        {name: 'caption', type: 'string', title: 'Caption'},
      ],
    }),

    defineField({
      name: 'lede',
      title: 'Lede',
      type: 'blockContent',
      description: 'Short, enticing intro. Used in cards/SEO and the top of the Story tab.',
    }),

    defineField({
      name: 'tabs',
      title: 'Tabs configuration',
      type: 'object',
      fields: [
        defineField({
          name: 'enableStoryTab',
          title: 'Enable Story tab',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'enableNumbersTab',
          title: 'Enable Music & Numbers tab',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'enableCharactersTab',
          title: 'Enable Characters tab',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'enableReferenceTab',
          title: 'Enable Reference tab',
          type: 'boolean',
          initialValue: true,
        }),
      ],
    }),

    defineField({
      name: 'storyBeats',
      title: 'Story (beats/scenes)',
      type: 'array',
      description: 'Ordered narrative beats with illustrations and optional inline musical markers.',
      of: [{type: 'operaBeat'}],
      validation: (Rule) => Rule.min(1),
    }),

    defineField({
      name: 'numbers',
      title: 'Musical numbers (index)',
      type: 'array',
      description: 'Optional explicit index for the Numbers tab (can be derived from beats if you want).',
      of: [{type: 'reference', to: [{type: 'musicalNumber'}]}],
    }),

    defineField({
      name: 'characters',
      title: 'Characters (index)',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'operaCharacter'}]}],
    }),

    defineField({
      name: 'sources',
      title: 'Sources',
      type: 'blockContent',
      description: 'References shown at the bottom of the opera page.',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'kNumber',
      media: 'mainImage',
    },
  },
})