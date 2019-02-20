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
    calculateSpaceBefore() {
      const {
        scrollTop,
        heights,
        defaultHeight,
      } = this
      let firstItemIndex = 0
      let spaceBefore = 0
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const itemHeight = heights[firstItemIndex] || defaultHeight
        if (spaceBefore + itemHeight > scrollTop) break
        firstItemIndex += 1
        spaceBefore += itemHeight
      }

      this.offset = firstItemIndex // save to use in tests
      return { spaceBefore, firstItemIndex }
    },
    calculateItems(firstItemIndex, paddingTop) {
      const {
        $slots: { default: defaultItems = [] },
        heights,
        defaultHeight,
        totalHeight,
        extraItems,
      } = this
      const items = []
      let heightAcc = paddingTop
      let lastItemIndex = firstItemIndex
      for (;
        heightAcc - paddingTop < totalHeight && lastItemIndex < defaultItems.length;
        lastItemIndex += 1) {
        items.push(defaultItems[lastItemIndex])
        heightAcc += heights[lastItemIndex] || defaultHeight
      }
      // add extra items (from prop)
      for (let i = 0; i < extraItems; i += 1) {
        const item = defaultItems[lastItemIndex]
        if (item === undefined) break
        items.push(item)
        lastItemIndex += totalHeight
        heightAcc += heights[lastItemIndex] || defaultHeight
      }

      return { lastItemIndex, items }
    },
    calculateSpaceAfter(lastItemIndex) {
      const {
        $slots: { default: defaultItems = [] },
        heights,
        defaultHeight,
      } = this

      return defaultItems
        .slice(lastItemIndex)
        .map((x, i) => heights[i] || defaultHeight)
        .reduce((a, b) => a + b, 0)
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
    const { spaceBefore, firstItemIndex } = this.calculateSpaceBefore()
    const { items, lastItemIndex } = this.calculateItems(firstItemIndex, spaceBefore)
    const spaceAfter = this.calculateSpaceAfter(lastItemIndex)

    const { totalHeight } = this
    return (
      <div ref="container" style={[styles.container, { height: `${totalHeight}px` }]}>
        <div style={{ width: '100%', height: `${spaceBefore}px` }} />
        { items }
        <div style={{ width: '100%', height: `${spaceAfter}px` }} />
      </div>
    )
  },
}
