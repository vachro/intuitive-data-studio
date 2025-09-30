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
    prepare({url}) {
      return {
        title: 'YouTube video',
        subtitle: url,
      }
    },
  },
})
