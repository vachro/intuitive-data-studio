import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'imageWithCaption',
  title: 'Image with caption',
  type: 'object',
  fields: [
    defineField({name: 'image', title: 'Image', type: 'image', options: {hotspot: true}}),
    defineField({name: 'alt', title: 'Alt text', type: 'string', validation: r => r.required()}),
    defineField({name: 'caption', title: 'Caption', type: 'string'}),
  ],
  preview: {
    select: {media: 'image', title: 'caption', subtitle: 'alt'},
  },
})
