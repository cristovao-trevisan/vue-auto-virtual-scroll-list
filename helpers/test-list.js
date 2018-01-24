import VueAutoVirtualScrollList from '../src/index'
import TestItem from './test-item'

export default {
  name: 'test-list',
  props: {
    items: { type: Array, required: true },
    height: { type: Number, required: true },
    defaultHeight: { type: Number, required: true },
    extraItems: { type: Number, default: 1 },
  },
  render(h) { // eslint-disable-line no-unused-vars
    const {
      items, height, defaultHeight, extraItems,
    } = this
    return (
      <VueAutoVirtualScrollList
        totalHeight={height}
        defaultHeight={defaultHeight}
        extraItems={extraItems}
      >
        {items.map((item, index) => (
            <TestItem key={index} name={item.name} height={item.height} />
        ))}
      </VueAutoVirtualScrollList>
    )
  },
}
