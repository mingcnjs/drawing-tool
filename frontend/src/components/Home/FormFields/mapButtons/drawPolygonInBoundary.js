import React from 'react'
import { PropTypes } from 'prop-types'
import ReactDOM from 'react-dom'
import L from 'leaflet'
import inside from '@turf/boolean-point-in-polygon'
import { MapControl } from 'react-leaflet'
import _ from 'lodash'

export default class DrawPolygonInBoundary extends MapControl {
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
      drawingBoundary: false,
      drawingPoly: false,
      boundary: null,
      poly: null,
    }
    this.onClick = this.onClick.bind(this)
    this.endDraw = this.endDraw.bind(this)
    this.drawvertex = this.drawvertex.bind(this)
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
        <img src="style/images/polywithboundary.png" />
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
    this.context.map.on('draw:drawstop', this.endDraw)
    this.context.map.on('draw:drawvertex', this.drawvertex)
  }
  drawvertex(e) {
    if (this.state.drawingPoly) {
      const { layers } = e
      const layersGeoJson = layers.toGeoJSON()
      const lastPoint = _.last(layersGeoJson.features)
      const isIn = inside(lastPoint, this.state.boundary.toGeoJSON())
      debugger
      if (!isIn) {
        this.state.poly.deleteLastVertex()
      }
    }
  }
  endDraw() {
    if (this.state.drawingBoundary) {
      const { layerContainer, map } = this.context
      const { drawControl } = this.props
      const boundary = _.last(_.values(layerContainer._layers))
      const poly = new L.Draw.Polygon(map, drawControl.options.polygone)
      this.setState({
        drawingBoundary: false,
        boundary: boundary,
        drawingPoly: true,
        poly: poly,
      })
      debugger
      poly.enable()
      this.setState({})
    }
  }
  onClick() {
    const { map } = this.context
    const { drawControl } = this.props
    new L.Draw.Polygon(map, drawControl.options.polygone).enable()
    this.setState({ drawingBoundary: true })
  }
}
