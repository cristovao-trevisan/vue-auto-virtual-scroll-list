import VueAutoVirtualScrollList from '../../src/index'

const styles = {
  container: {
    display: 'flex',
  },
  items: {
    width: '60%',
    overflowX: 'hidden',
    borderWidth: '20px',
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,.3)',
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid black',
  },
  info: {
    width: '40%',
    fontSize: '25px',
  },
  infoItems: {
    textAlign: 'center',
  },
}

const TOTAL_HEIGHT = 500
const BASE_HEIGHT = 30
const items = new Array(30).fill(0).map((x, i) => ({ name: `Item #${i}`, height: BASE_HEIGHT + (Math.random() * 4 * BASE_HEIGHT) }))

export default {
  name: 'example-app',
  data() {
    return {
      measuredTotal: 0,
      measuredHeights: [],
      renderedLength: Math.ceil(TOTAL_HEIGHT / BASE_HEIGHT),
      renderedOffset: 0,
    }
  },
  methods: {
    setCalculatedHeights(measuredHeights) {
      if (this.measuredTotal !== measuredHeights.length) {
        this.measuredHeights = measuredHeights
        this.measuredTotal = measuredHeights.length
      }
    },
    setRenderedLength(renderedLength) {
      if (this.renderedLength !== renderedLength) this.renderedLength = renderedLength
    },
    setRenderedOffset(renderedOffset) {
      if (this.renderedOffset !== renderedOffset) this.renderedOffset = renderedOffset
    },
  },
  render(h) { // eslint-disable-line no-unused-vars
    const {
      measuredHeights,
      measuredTotal,
      renderedLength,
      renderedOffset,
    } = this
    const renderedHeights = measuredHeights.slice(renderedOffset, renderedOffset + renderedLength)
    const dotsBefore = renderedOffset > 0 ? '...' : ''
    const dotsAfter = renderedOffset + renderedLength < measuredTotal ? '...' : ''

    return (
      <div style={styles.container}>
        <VueAutoVirtualScrollList
          ref='virtualList'
          style={styles.items}
          totalHeight={TOTAL_HEIGHT}
          defaultHeight={BASE_HEIGHT}
          onUpdated={() => {
            this.setCalculatedHeights(this.$refs.virtualList.heights)
            this.setRenderedLength(this.$refs.virtualList.$el.children.length - 2)
            this.setRenderedOffset(this.$refs.virtualList.offset)
          }}
        >
          {items.map((item, index) => (
              <div key={index} style={[{ height: `${item.height}px`, fontSize: `${item.height * 0.8}px` }, styles.item]}>
                { item.name }
              </div>
          ))}
        </VueAutoVirtualScrollList>
        <div style={styles.info}>
          <div style={styles.infoItems}>
            Measured heights: <br />
            [{ dotsBefore } { renderedHeights.join(', ') } { dotsAfter }]
          </div>
          <div style={styles.infoItems}>
            Items Measured: { measuredTotal }
          </div>
          <div style={styles.infoItems}>
            Items Rendered: { renderedLength }
          </div>
        </div>
      </div>
    )
  },
}
