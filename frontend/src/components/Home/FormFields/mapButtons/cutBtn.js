import React from 'react'
import { PropTypes } from 'prop-types'
import ReactDOM from 'react-dom'
import L from 'leaflet'
import difference from '@turf/meta'
import { MapControl } from 'react-leaflet'
import _ from 'lodash'

export default class DeleteBtn extends MapControl {
  static contextTypes = {
    map: PropTypes.instanceOf(Map),
    layerContainer: PropTypes.shape({
      addLayer: PropTypes.func.isRequired,
      removeLayer: PropTypes.func.isRequired,
    }),
  }
  constructor() {
    super()
    this.state = {
      cutting: false,
    }
    this.onClick = this.onClick.bind(this)
    this.onClickMap = this.onClickMap.bind(this)
    this.endDraw = this.endDraw.bind(this)
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
        <img src="style/images/cut.png" />
      </div>
    )

    centerControl.onAdd = map => {
      let div = L.DomUtil.create(
        'div',
        `leaflet-bar leaflet-control leaflet-control-custom leaflet-draw-btn ${this.getFirstLastElementClass()}`,
      )
      ReactDOM.render(jsx, div)
      return div
    }
    this.leafletElement = centerControl
    if (this.context.map) {
      this.context.map.on('click', this.onClickMap)
      this.context.map.on('draw:drawstop', this.endDraw)
    }
  }
  endDraw() {
    if (this.state.cutting) {
      const { map, layerContainer } = this.context
      const new_layers = []
      const layerCutting = _.last(_.values(layerContainer._layers))
      if (_.size(layerContainer._layers) < 2) {
        return
      }
      _.each(layerContainer._layers, layer => {
        layerContainer.addLayer(
          L.geoJSON(difference(layer.toGeoJSON(), layerCutting.toGeoJSON())),
        )
        layerContainer.removeLayer(layer)
      })
      console.log(new_layers)
      this.setState({
        cutting: false,
      })
    }
  }
  onClickMap({ latlng } = {}) {
    if (!latlng || this.state.cutting === false) {
      return
    }
    const { lng, lat } = latlng
    console.log(lat, lng)
  }
  onClick() {
    this.setState({
      cutting: true,
    })
    const { map } = this.context
    const { drawControl } = this.props
    new L.Draw.Polygon(map, drawControl.options.polygon).enable()
  }
}
