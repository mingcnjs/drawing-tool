import React, { Component } from 'react'
import { Map, TileLayer, FeatureGroup, Circle } from 'react-leaflet'
import * as turf from '@turf/turf'
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
    this.shapeGeoJSON = {};
    this.shapeGeoJSON.type = "FeatureCollection";
    this.shapeGeoJSON.features = [];
    this.editstarted = false;
    this.drawobject = null;
    this.meterstoacres = 0.000247105;
    this.featuregroup = null;
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
//  _onCreate(a, b, c, d) {
//    console.log('onCreate')
//    console.log('a: ', a)
//    console.log('b: ', b)
//    console.log('c: ', c)
//    console.log('d: ', d)
//  }

  _onEditPath(a, b, c, d) {
    console.log('_onEditPath')
    console.log('a: ', a)
    console.log('b: ', b)
    console.log('c: ', c)
    console.log('d: ', d)
  }
  action = () => {
//   let shapetoremove = null;
//   for (let ilayers in this.map._layers)
//       {
//        if (this.map._layers[ilayers]._poly || this.map._layers[ilayers]._shape)
//           {
//            shapetoremove = this.map._layers[ilayers];   
//            break;                 
//           }  
//       }     
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

  _onCreate = (drawControl) => {
    let options = {
       steps: 200,
       units: 'kilometers',
       options: {}
    };
    drawControl.layer._path.setAttribute("id","shape_"+this.layercount);
    drawControl.layer.id = "shape_"+this.layercount+"#"+drawControl.layerType;
    let stringshapeGeoJSON = "";
    let polygon = null;
    let rewind = null;
    if (drawControl.layerType === "polygon" || drawControl.layerType === "rectangle")
       { 
        let feature = {};
        feature.id = "shape_"+this.layercount;
        feature.type = "Feature";
        feature.geometry = {};
        feature.properties = {};
        feature.others = {};
        feature.geometry.type = "Polygon";
        feature.geometry.coordinates = [];
        feature.geometry.coordinates.push([]);
        let points = [];
        for (let ipoints = 0; ipoints < drawControl.layer._latlngs[0].length; ipoints++)
            { 
             feature.geometry.coordinates[0].push([drawControl.layer._latlngs[0][ipoints]["lng"],parseFloat(drawControl.layer._latlngs[0][ipoints]["lat"])]);
             points.push(L.latLng(drawControl.layer._latlngs[0][ipoints]["lng"],parseFloat(drawControl.layer._latlngs[0][ipoints]["lat"])));
            } 
         feature.geometry.coordinates[0].push(feature.geometry.coordinates[0][0]);
         polygon = turf.polygon(feature.geometry.coordinates);
         rewind = turf.rewind(polygon);
         feature.geometry.coordinates[0] = rewind.geometry.coordinates[0];
         polygon = rewind;
         this.shapeGeoJSON.features.push(feature);
         stringshapeGeoJSON = this.shapeGeoJSON;
        }
    if (drawControl.layerType === "circle")
       { 
        let feature = {};
        feature.id = "shape_"+this.layercount;
        feature.type = "Feature";
        feature.geometry = {};
        feature.properties = {};
        feature.geometry.type = "Polygon";
        feature.geometry.coordinates = [];
        feature.geometry.coordinates.push([])
        let radius = drawControl.layer._mRadius;
        let center = [drawControl.layer._latlng.lng,drawControl.layer._latlng.lat];  
        if (drawControl.layer._mRadius > 0)
           {
            polygon = turf.circle(center, drawControl.layer._mRadius / 1000, options);
            feature.geometry.coordinates[0] = polygon.geometry.coordinates[0];
           }  
         feature.others = {basetype:"Circle",center:center};
         feature.properties.radius = radius;
         this.shapeGeoJSON.features.push(feature);
         stringshapeGeoJSON = this.shapeGeoJSON;
        }
   let totalarea = 0;
   let points = [];
   points.push([]);
   let poly = null;
   for (let ilayers in this.featuregroup.leafletElement._layers)
       {
        points = [];
        points.push([]);
        poly = null;  
        if (this.featuregroup.leafletElement._layers[ilayers].id)
           {        
            let shapetype = this.featuregroup.leafletElement._layers[ilayers].id.split("#")[1];
            if (shapetype === "polygon" || shapetype === "rectangle")
               {
                for (let ipoints = 0; ipoints < this.featuregroup.leafletElement._layers[ilayers]._latlngs[0].length; ipoints++)
                    { 
                     points[0].push([parseFloat(this.featuregroup.leafletElement._layers[ilayers]._latlngs[0][ipoints]["lng"]),parseFloat(this.featuregroup.leafletElement._layers[ilayers]._latlngs[0][ipoints]["lat"])]);
                    }    
                points[0].push([parseFloat(this.featuregroup.leafletElement._layers[ilayers]._latlngs[0][0]["lng"]),parseFloat(this.featuregroup.leafletElement._layers[ilayers]._latlngs[0][0]["lat"])])
                poly = turf.polygon(points);
                totalarea += turf.area(poly);   
               }    
            if (shapetype === "circle")
               {  
                let radius = this.featuregroup.leafletElement._layers[ilayers]._mRadius;
                let center = [this.featuregroup.leafletElement._layers[ilayers]._latlng.lng,this.featuregroup.leafletElement._layers[ilayers]._latlng.lat];  
                if (drawControl.layer._mRadius > 0)
                   {
                    poly = turf.circle(center, drawControl.layer._mRadius / 1000, options);
                   }  
                totalarea += turf.area(poly);   
               }   
           }   
       }  
   this.props.getarea(Math.floor(totalarea * this.meterstoacres * 100)/100);
   this.props.geojsontostate(stringshapeGeoJSON);
//   drawControl.layer.on({
//      mouseover: this.highlightFeature.bind(this),
//      mouseout: this.resetHighlight.bind(this),
//      click: this._onLayerClick.bind(this)
//    });
   this.layercount++; 
   this.editstarted = true;
   this.drawobject._container.querySelector("#editpolygon").click();
  }

 _onLayerClick(e){
   var layer = e.target;
   if (this.editstarted)
      {
       this.editstarted = false;
      }  
   this.editstarted = true;
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

  _onFeatureGroupReady = (reactFGref) => {
    console.log(reactFGref); 
    this.featuregroup = reactFGref;
  }

  renderDraw() {
    return (
      <div>
        <FeatureGroup>
          <FeatureGroup ref={ (reactFGref) => {this._onFeatureGroupReady(reactFGref);} }>
            <EditControl
              position="bottomleft"
              onEdited={this._onEditPath}
              onCreated={this._onCreate}
              onDeleted={this._onDeleted}
              onMounted={this._onMounted}
//              onCreated={this._onshapecomplete}   
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
