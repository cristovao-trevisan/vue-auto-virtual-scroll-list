import Vue from 'vue'

const styles = {
  container: {
    overflowY: 'scroll',
  },
}

export default {
  name: 'auto-virtual-scroll-list',
  props: {
    totalHeight: { type: Number, required: true },
    defaultHeight: { type: Number, required: true },
    extraItems: { type: Number, default: 1 },
  },
  data() {
    return {
      offset: 0, // items offset
      heights: [],
      scrollTop: 0,
      numberOfItems: false,
    }
  },
  methods: {
    /** Reset component (variables and scroll) */
    reset() {
      this.offset = 0
      this.heights = []
      this.scrollTop = 0
      this.numberOfItems = false
      this.$refs.container.scrollTop = 0 // reset scroll
    },
  },
  /** Sets callback to update the scrollTop variable */
  mounted() {
    const { $refs: { container, scrollTop } } = this
    container.onscroll = () => {
      // listen for change only to avoid loop
      const newScroll = (container && container.scrollTop) || 0
      if (newScroll !== scrollTop) this.scrollTop = newScroll
    }
  },
  /** Listen to change in slot items as well as to rendered children height */
  updated() {
    const { $slots: { default: defaultItems = [] }, numberOfItems } = this
    // if number of items is unknown set it
    if (!numberOfItems) this.numberOfItems = defaultItems.length
    // else if number of items changed reset the component
    else if (numberOfItems !== defaultItems.length) this.reset()

    // nextTick -> need to wait for the offset to be reloaded if scroll
    // changed (which happens at render)
    Vue.nextTick(() => {
      const { $el: { children: htmlChildren }, offset } = this
      const htmlAsArray = Array.from(htmlChildren)
      const children = htmlAsArray.slice(1, htmlAsArray.length - 1) // remove empty divs
      // updated heights based on rendered items
      children.forEach((child, i) => {
        const index = i + offset
        if (!this.heights[index]) this.heights[index] = child.offsetHeight
      })
    })
    this.$emit('updated')
  },
  render(h) { // eslint-disable-line no-unused-vars
    const {
      $slots: { default: defaultItems = [] },
      scrollTop,
      heights,
      defaultHeight,
      totalHeight,
      extraItems,
    } = this
    let index = 0 // current item being analysed
    let heightAcc = 0 // cumulative height for the item
    // calculate space occupied by hidden elements
    for (;;) {
      const itemHeight = heights[index] || defaultHeight
      if (heightAcc + itemHeight > scrollTop) break
      index += 1
      heightAcc += itemHeight
    }
    const paddingTop = heightAcc // result occupied space
    // calculate number of elements shown
    const items = []
    this.offset = index
    for (;
      heightAcc - paddingTop < totalHeight && index < defaultItems.length;
      index += 1) {
      const item = defaultItems[index]
      items.push(item)
      heightAcc += heights[index] || defaultHeight
    }
    // add extra items (from prop)
    for (let i = 0; i < extraItems; i += 1) {
      const item = defaultItems[index]
      if (item === undefined) break
      items.push(item)
      index += 1
      heightAcc += heights[index] || defaultHeight
    }
    // calculate space after
    let paddingBottom = 0
    for (;
      index < defaultItems.length;
      index += 1) {
      paddingBottom += heights[index] || defaultHeight
    }
    return (
      <div ref="container" style={[styles.container, { height: `${totalHeight}px` }]}>
        <div style={{ width: '100%', height: `${paddingTop}px` }} /> {/* Empty div with space of ignored items */}
        { items }
        <div style={{ width: '100%', height: `${paddingBottom}px` }} /> {/* Same */}
      </div>
    )
  },
}
