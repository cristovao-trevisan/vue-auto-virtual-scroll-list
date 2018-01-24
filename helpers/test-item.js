let counter = 0
export default {
  name: 'test-item',
  props: {
    name: { type: String, default: () => `Item ${counter++}` }, // eslint-disable-line no-plusplus
    height: { type: Number, default: () => 20 + (Math.random() * 100) },
  },
  render(h) { // eslint-disable-line no-unused-vars
    const { name, height } = this
    return (
      <div style={{ height: `${height}px` }}>
        { name }
      </div>
    )
  },
}
