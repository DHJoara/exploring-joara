// Vitest replaces these exports; no generated OpenNext build is required.
export default {
  fetch: () => {
    throw new Error('Mock the generated Worker in tests.')
  },
}
export class DOQueueHandler {}
