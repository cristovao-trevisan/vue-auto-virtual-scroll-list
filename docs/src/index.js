import Vue from 'vue'
import App from './App'

const styles = {
  title: {
    background: 'rgb(156, 156, 220)',
    textAlign: 'center',
    width: '100%',
    margin: '0',
    height: '80px',
    paddingTop: '40px',
    marginBottom: '20px',
  },
}

new Vue({ // eslint-disable-line no-new
  el: '#app',
  render: h => ( // eslint-disable-line no-unused-vars
    <div>
      <h1 style={styles.title}>Vue Auto Virtual Scroll List</h1>
       <App />
    </div>
  ),
})
