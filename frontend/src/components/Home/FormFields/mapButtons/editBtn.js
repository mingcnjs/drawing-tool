import React from 'react'
import { PropTypes } from 'prop-types'
import ReactDOM from 'react-dom'
import L from 'leaflet'
import { MapControl } from 'react-leaflet'
import _ from 'lodash'

export default class EditBtn extends MapControl {
  static contextTypes = {
    map: PropTypes.instanceOf(Map),
    layerContainer: PropTypes.shape({
      addLayer: PropTypes.func.isRequired,
      removeLayer: PropTypes.func.isRequired,
    }),
  }
  constructor() {
    super()
    this.onClick = this.onClick.bind(this)
  }

  getFirstLastElementClass() {
    const { last, first } = this.props
    return last ? 'last' : first ? 'first' : ''
  }

  componentWillMount() {
    const centerControl = L.control({ position: 'topright' })
    const jsx = (
      <div
        {...this.props}
        onClick={this.onClick}
        style={{
          width: 30,
          height: 30,
          backgroundColor: '#FFF',
          cursor: 'pointer',
        }}
      >
        <img src="style/images/edit.png" />
      </div>
    )

    centerControl.onAdd = map => {
      let div = L.DomUtil.create(
        'div',
        `leaflet-bar leaflet-control leaflet-draw-btn ${this.getFirstLastElementClass()}`,
      )
      ReactDOM.render(jsx, div)
      return div
    }
    this.leafletElement = centerControl
  }
  onClick() {
    const { map, layerContainer } = this.context
    const { drawControl, onEdit } = this.props
    const guid = _.first(_.values(layerContainer._layers))
    _.each(layerContainer._layers, layer => {
      debugger
      layer.options.editing || (layer.options.editing = {})
      layer.editing.enable()
    })
    onEdit()
  }
}
