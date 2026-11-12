import type { Field } from 'payload'

export const sectionBlurbField = (defaultValue: string): Field => ({
  name: 'blurb',
  type: 'textarea',
  required: true,
  defaultValue,
  admin: { description: 'Introduction displayed above this section. Separate paragraphs with a blank line.' },
})
