import React, { Component } from 'react'
import { Map, TileLayer, FeatureGroup, Circle } from 'react-leaflet'
import {turf} from "turf"
import { EditControl } from 'react-leaflet-draw'
import L from "leaflet";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
} from 'reactstrap'
import { MAP_URL_DEFAULT } from '../../../constants'

const styles = {
  map: {
    width: '100%',
    height: '650px',
  },
  mapContainer: {
    width: '100%',
    height: '650px',
    position: 'relative',
    boxSizing: 'border-box',
  },
  dropdown:{
    zIndex:100000000,
  },
}

export default class MyMap extends Component {
  constructor(props) {
    super(props)

    this.toggle = this.toggle.bind(this)
    this.isLeafletdrawmounted = false;
    this.layercount = 1;
    this.undo = [];
    this.state = {
      dropdownOpen: false,
      point: [38.51, -80.06],
      radius: 200,
      
    }
  }

  toggle() {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen,
    }))
  }
  renderMap() {
    return <TileLayer url={MAP_URL_DEFAULT} />
  }
  _onCreate(a, b, c, d) {
    console.log('onCreate')
    console.log('a: ', a)
    console.log('b: ', b)
    console.log('c: ', c)
    console.log('d: ', d)
  }

  _onEditPath(a, b, c, d) {
    console.log('_onEditPath')
    console.log('a: ', a)
    console.log('b: ', b)
    console.log('c: ', c)
    console.log('d: ', d)
  }
  action = () => {
//    this.setState({
//      point: [[38.51, -80.06], [32.51, -80.06]],
//      radius: 600000,
//    })
   let shapetoremove = null;
   for (let ilayers in this.map._layers)
       {
        if (this.map._layers[ilayers]._poly || this.map._layers[ilayers]._shape)
           {
            shapetoremove = this.map._layers[ilayers];   
            break;                 
           }  
       }     
//   this.map.removeLayer(shapetoremove)
//   console.log(this.drawobject);    
  }

  _onMounted = (drawControl) => {
    drawControl._container.style.display = "none";
    drawControl._container.querySelector(".leaflet-draw-draw-polygon").setAttribute("id","drawpolygon");
    drawControl._container.querySelector(".leaflet-draw-draw-rectangle").setAttribute("id","drawrectangle");
    drawControl._container.querySelector(".leaflet-draw-draw-circle").setAttribute("id","drawcircle");
    document.querySelector(".leaflet-draw-edit-edit").setAttribute("id","editpolygon");
     this.drawobject = drawControl 
    console.log('_onMounted', drawControl);
    this.isLeafletdrawmounted = true;
    this.mountedldraw = true;
  }

  _onshapecomplete = (drawControl) => {
    drawControl.layer._path.setAttribute("id","shape_"+this.layercount);
    drawControl.layer.id = "shape_"+this.layercount;




    this.props.geojsontostate("this is test");
    drawControl.layer.on({
//      mouseover: this.highlightFeature.bind(this),
//      mouseout: this.resetHighlight.bind(this),
      click: this._onLayerClick.bind(this)
    });
    this.layercount++; 
  }

 _onLayerClick(e){
   var layer = e.target;
   this.drawobject._container.querySelector("#editpolygon").click();
   console.log(layer);
 } 
 
  componentDidMount () {
  }

  addpolygon = () =>{
    if (this.isLeafletdrawmounted)   
       {
        this.drawobject._container.querySelector("#drawpolygon").click();
       }  
  }

  addrectangle = () =>{
    if (this.isLeafletdrawmounted)   
       {
        this.drawobject._container.querySelector("#drawrectangle").click();
       }  
  }


  addcircle = () =>{
    if (this.isLeafletdrawmounted)   
       {
        this.drawobject._container.querySelector("#drawcircle").click();
       }  
  }

  renderDraw() {
    return (
      <div>
        <FeatureGroup>
          <FeatureGroup>
            <EditControl
              position="bottomleft"
              onEdited={this._onEditPath}
              onCreated={this._onCreate}
              onDeleted={this._onDeleted}
              onMounted={this._onMounted}
              onCreated={this._onshapecomplete}   
//              onClick={this._onMapClick}
            />
            <Circle center={this.state.point} radius={this.state.radius} />
          </FeatureGroup>
        </FeatureGroup>
      </div>
    )
  }

  render() {
    const position = [30.51, 0.06]
    return (
      <div style={styles.mapContainer}>
        <div className="draw-toolbar" style={styles.dropdown}>
          <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
            <DropdownToggle caret>Draw</DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={this.addpolygon}>Polygon</DropdownItem>
              <DropdownItem onClick={this.addrectangle}>Rectangle</DropdownItem>
              <DropdownItem onClick={this.addcircle}>Circle</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Button onClick={this.action}>Undo</Button>
        </div>
        <Map
//          className="map-section"
          ref={(ref) => { this.map = ref; }}
          center={position}
          zoom={13}
          style={styles.map}
        >
          {this.renderMap()}
          {this.renderDraw()}
        </Map>
      </div>
    )
  }
}
