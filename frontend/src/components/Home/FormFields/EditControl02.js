import { PropTypes } from 'prop-types'
import React from 'react'
import { MapControl } from 'react-leaflet'
import { Map } from 'leaflet'
import L from 'leaflet'
import Draw from 'leaflet-draw' // eslint-disable-line
import _ from 'lodash'

const styles = {
  editControl: {
    width: '100%',
    height: '100%',
  },
  controllContainer: visible => ({
    width: '100%',
    background: 'rgba(255,255,255,0.7)',
    display: 'flex',
    justifyContent: 'center',
    position: 'absolute',
    bottom: visible ? 0 : -50,
    zIndex: 800,
    transition: 'bottom 0.4s ease-in-out',
  }),
  controlBtn: {
    margin: 10,
    padding: '5px 10px',
    backgroundColor: '#0097D6',
    color: 'white',
    minWidth: 60,
    textAlign: 'center',
    cursor: 'pointer',
  },
}
const eventHandlers = {
  onEdited: 'draw:edited',
  onDrawStart: 'draw:drawstart',
  onDrawStop: 'draw:drawstop',
  onDrawVertex: 'draw:drawvertex',
  onEditStart: 'draw:editstart',
  onEditMove: 'draw:editmove',
  onEditResize: 'draw:editresize',
  onEditVertex: 'draw:editvertex',
  onEditStop: 'draw:editstop',
  onDeleted: 'draw:deleted',
  onDeleteStart: 'draw:deletestart',
  onDeleteStop: 'draw:deletestop',
}

export default class EditControl extends MapControl {
  static contextTypes = {
    map: PropTypes.instanceOf(Map),
    layerContainer: PropTypes.shape({
      addLayer: PropTypes.func.isRequired,
      removeLayer: PropTypes.func.isRequired,
    }),
  }
  guideLayers = []
  constructor() {
    super()
    this.state = {
      drawControl: null,
      features: [],
      visible: false,
    }
    this.onEdit = this.onEdit.bind(this)
    this.saveEditing = this.saveEditing.bind(this)
  }

  saveEditing() {
    const { layerContainer } = this.context
    _.each(layerContainer._layers, layer => {
      layer.options.editing || (layer.options.editing = {})
      layer.editing.disable()
    })
    this.setState({ visible: false })
  }
  onDrawCreate = e => {
    const { onCreated } = this.props
    const { layerContainer, map } = this.context
    const guides = _.values(layerContainer._layers)
    debugger
    layerContainer.addLayer(e.layer)
    onCreated && onCreated(e)
  }

  onEdit() {
    console.log('here here')
    this.setState({ visible: true })
  }
  componentWillMount() {
    const { map } = this.context
    this.updateDrawControls()
    map.on('draw:created', this.onDrawCreate)
    for (const key in eventHandlers) {
      if (this.props[key]) {
        map.on(eventHandlers[key], this.props[key])
      }
    }
  }

  componentDidUpdate(prevProps) {
    // super updates positions if thats all that changed so call this first
    // super.componentDidUpdate(prevProps)
    // this.updateDrawControls()

    return null
  }

  updateDrawControls = () => {
    const { map, layerContainer } = this.context
    map.addLayer(layerContainer)
    var drawControl = new L.Control.Draw({
      edit: {
        featureGroup: layerContainer,
      },
      draw: {},
    })
    // map.addControl(new drawLineBtn({drawControl}))
    // map.addControl(<DrawPolygonBtn drawControl={drawControl} />)
    // map.addControl(drawControl)
    this.setState({ drawControl })
  }
  renderChildern() {
    const { children } = this.props
    const n_childern = _.size(children)
    return React.Children.map(children, (child, index) => {
      return React.cloneElement(child, {
        drawControl: this.state.drawControl,
        guideLayers: this.state.guideLayers,
        first: index === 0,
        last: index === n_childern - 1,
        onEdit: this.onEdit,
      })
    })
  }
  renderEditControl() {
    const { visible } = this.state
    console.log('viisi', visible)
    return (
      <div style={styles.controllContainer(visible)}>
        <div style={styles.controlBtn} onClick={this.saveEditing}>
          Save
        </div>
        <div style={styles.controlBtn}>Cancel</div>
      </div>
    )
  }
  render() {
    return (
      <div style={styles.editContol}>
        {this.renderChildern()}
        {this.renderEditControl()}
      </div>
    )
  }
}
