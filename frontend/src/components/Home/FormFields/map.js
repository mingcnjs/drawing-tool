import React, { Component } from 'react'
import { Map, TileLayer, FeatureGroup} from 'react-leaflet'
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
    this.farmdata = null;
    this.layerinaction = null;
    this.state = {
      dropdownOpen: false,
      firsttime:true, 
      loadedgeoJSON:true,
      lat : 30.51,
      lng : 0.06,
      zoom:12
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
//    console.log('_onMounted', drawControl);
    this.isLeafletdrawmounted = true;
    this.mountedldraw = true;
  }

  _oneditvertex = (drawControl) => { 
     let options = {
        steps: 200,
        units: 'kilometers',
        options: {}
     };
     let stringshapeGeoJSON = "";
     if (drawControl.poly)
        {
         let id = drawControl.poly.id;
         for (let ift = 0; ift < this.shapeGeoJSON.features.length; ift++)
             {
              if (this.shapeGeoJSON.features[ift].id.toUpperCase() === id.toUpperCase())
                 {
                  this.shapeGeoJSON.features[ift].geometry.coordinates[0] = [];
                  for (let ipoints = 0; ipoints < drawControl.poly._latlngs[0].length; ipoints++)
                      {
                       this.shapeGeoJSON.features[ift].geometry.coordinates[0].push([drawControl.poly._latlngs[0][ipoints]["lng"],drawControl.poly._latlngs[0][ipoints]["lat"]]);
                      }     
                 }
             } 
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
                  if (this.featuregroup.leafletElement._layers[ilayers]._mRadius > 0)
                     {
                      poly = turf.circle(center, radius / 1000, options);
                     }  
                  totalarea += turf.area(poly);   
                }   
             }   
         }  
     stringshapeGeoJSON = this.shapeGeoJSON;
     this.props.getarea(Math.floor(totalarea * this.meterstoacres * 100)/100);
     this.props.geojsontostate(stringshapeGeoJSON);     
    }; 

  _oneditchange = (drawControl) => { 
     let options = {
        steps: 200,
        units: 'kilometers',
        options: {}
     };
     let stringshapeGeoJSON = "";
     this.layerinaction = drawControl;
     if (drawControl.layer)
        {
         let id = drawControl.layer.id; 
         let ptype = id.split("#")[1]  
         for (let ift = 0; ift < this.shapeGeoJSON.features.length; ift++)
             {
              if (this.shapeGeoJSON.features[ift].id.toUpperCase() === id.toUpperCase()  &&  ptype === "rectangle")
                 {
                  this.shapeGeoJSON.features[ift].geometry.coordinates[0] = [];
                  for (let ipoints = 0; ipoints < drawControl.layer._latlngs[0].length; ipoints++)
                      {
                       this.shapeGeoJSON.features[ift].geometry.coordinates[0].push([drawControl.layer._latlngs[0][ipoints]["lng"],drawControl.layer._latlngs[0][ipoints]["lat"]]);
                      }     
                 }
              if (this.shapeGeoJSON.features[ift].id.toUpperCase() === id.toUpperCase() &&  ptype === "circle")
                 {
                  this.shapeGeoJSON.features[ift].geometry.coordinates[0] = [];
                  let radius = drawControl.layer._mRadius;
                  let center = [drawControl.layer._latlng.lng,drawControl.layer._latlng.lat];  
                  let polygon  = "";
                  if (drawControl.layer._mRadius > 0)
                     {
                      polygon = turf.circle(center, drawControl.layer._mRadius / 1000, options);
                      this.shapeGeoJSON.features[ift].geometry.coordinates[0] = polygon.geometry.coordinates[0];
                     }  
                  this.shapeGeoJSON.features[ift].others = {basetype:"Circle",center:center};
                  this.shapeGeoJSON.features[ift].properties.radius = radius;
                 }
             } 
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
                  if (this.featuregroup.leafletElement._layers[ilayers]._mRadius > 0)
                     {
                      poly = turf.circle(center, radius / 1000, options);
                     }  
                  totalarea += turf.area(poly);   
                 }   
             }   
         }  
     stringshapeGeoJSON = this.shapeGeoJSON;
     this.props.getarea(Math.floor(totalarea * this.meterstoacres * 100)/100);
     this.props.geojsontostate(stringshapeGeoJSON);     
    }; 

  _oneditfinished = (drawControl) => { 
     this.layerinaction = drawControl;
     setTimeout(() =>{
       this.drawobject._container.querySelector("#editpolygon").click();
     },300)
  }; 


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
        feature.id = "shape_"+this.layercount+"#"+drawControl.layerType;
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
        feature.id = "shape_"+this.layercount+"#"+drawControl.layerType;
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
                    poly = turf.circle(center, radius / 1000, options);
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
//   setTimeout(() => {
//      this.drawobject._container.querySelector('[title="Save changes"]').setAttribute("id","savechanges");
//      this.drawobject._container.querySelector('[title="Cancel editing, discards all changes"]').setAttribute("id","cancelchanges");
//   },500);
  }

 _onLayerClick(e){
   if (this.editstarted)
      {
       this.editstarted = false;
      }  
   this.editstarted = true;
   this.drawobject._container.querySelector("#editpolygon").click();
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

  onFeatureGroupAdd = (e) => {
      setTimeout(()=>{
          let bnds = L.latLngBounds()
          for (let ilay in this.map.leafletElement._layers)
              {
               if (this.map.leafletElement._layers[ilay]._latlngs && this.map.leafletElement._layers[ilay]._latlngs[0])
                  {
                   for (var ipoints = 0; ipoints < this.map.leafletElement._layers[ilay]._latlngs[0].length; ipoints++)
                       {
                        bnds.extend(this.map.leafletElement._layers[ilay]._latlngs[0][ipoints]);
                      }    
                  } 
              }   
           if (bnds.isValid())
              {
               this.map.leafletElement.fitBounds(bnds);
              }
           this.drawobject._container.querySelector("#editpolygon").click();
           setTimeout(() => {
//              this.drawobject._container.querySelector('[title="Save changes"]').setAttribute("id","savechanges");
//              this.drawobject._container.querySelector('[title="Cancel editing, discards all changes"]').setAttribute("id","cancelchanges");
           },500);
      },1500);
  }

  _onFeatureGroupReady = (reactFGref) => { 
    if (this.props.status === "NEW")
       {
        this.featuregroup = reactFGref;
       }
    else
       {
        if (this.isLeafletdrawmounted && this.state.firsttime)   
           {
            this.drawobject._container.querySelector("#editpolygon").click();
            this.setState({firsttime : false});
            return;
           }       
        this.featuregroup = reactFGref; 
        setTimeout(() => {  
            if(this.props.farmdata && this.state.loadedgeoJSON) { 
               this.setState({loadedgeoJSON : false});
               this.shapeGeoJSON = this.props.farmdata;
               let leafletFG = this.featuregroup.leafletElement;
               let gpoints = null; 
               this.layercount = 1;
               for (let ifeat = 0; ifeat < this.shapeGeoJSON.features.length; ifeat++)
                   {
                    let idss = this.shapeGeoJSON.features[ifeat].id.split("#")[1]
                    if (idss === "polygon" && !this.shapeGeoJSON.features[ifeat].others.basetype)
                       {
                        gpoints = [];
                        for (let ipointsa = 0; ipointsa < this.shapeGeoJSON.features[ifeat].geometry.coordinates[0].length; ipointsa++)
                            {
                             gpoints.push([this.shapeGeoJSON.features[ifeat].geometry.coordinates[0][ipointsa][1],this.shapeGeoJSON.features[ifeat].geometry.coordinates[0][ipointsa][0]])                        
                            }
                        let poly = L.polygon(gpoints);
                        poly.id = this.shapeGeoJSON.features[ifeat].id;                         
                        leafletFG.addLayer(poly);
                        poly._path.setAttribute("id",this.shapeGeoJSON.features[ifeat].id);
                       } 
                    if (idss === "rectangle" && !this.shapeGeoJSON.features[ifeat].others.basetype)
                       {
                        gpoints = [];
                        for (let ipointsb = 0; ipointsb < this.shapeGeoJSON.features[ifeat].geometry.coordinates[0].length; ipointsb++)
                            {
                             gpoints.push([this.shapeGeoJSON.features[ifeat].geometry.coordinates[0][ipointsb][1],this.shapeGeoJSON.features[ifeat].geometry.coordinates[0][ipointsb][0]])                        
                            } 
                        let poly = L.rectangle(gpoints);
                        poly.id = this.shapeGeoJSON.features[ifeat].id;                         
                        leafletFG.addLayer(poly);
                        poly._path.setAttribute("id",this.shapeGeoJSON.features[ifeat].id);
                       } 
                    if (this.shapeGeoJSON.features[ifeat].others.basetype === "Circle")
                       {
                        gpoints = [this.shapeGeoJSON.features[ifeat].others.center[1],this.shapeGeoJSON.features[ifeat].others.center[0]];
                        let radius = parseFloat(this.shapeGeoJSON.features[ifeat].properties.radius);
                        let circle = L.circle(gpoints,{radius:radius});
                        circle.id = this.shapeGeoJSON.features[ifeat].id;                         
                        leafletFG.addLayer(circle);
                        circle._path.setAttribute("id",this.shapeGeoJSON.features[ifeat].id);
                       } 
                    let ids = this.shapeGeoJSON.features[ifeat].id.split("#")
                    this.layercount = parseFloat(ids[0].split("_")[1]);
                   } 
                 if (this.layercount > 1)
                    {
                     this.layercount++;
                    } 
//               this.setState({shapeGeoJSON:this.props.farmdata});
//               let leafletGeoJSON = new L.GeoJSON(this.state.shapeGeoJSON); 
//               let leafletFG = this.featuregroup.leafletElement;
//               leafletGeoJSON.eachLayer( layer =>leafletFG.addLayer(layer));
            }  
         },500);  
       }      
  }

  renderDraw() {
    return (
        <div>
          <FeatureGroup ref={ (reactFGref) => {this._onFeatureGroupReady(reactFGref);} } onAdd={this.onFeatureGroupAdd}>
            <EditControl
              position="bottomleft"
              onCreated={this._onCreate}
              onDeleted={this._onDeleted}
              onMounted={this._onMounted}
              onEditVertex={this._oneditvertex}
              onEditResize={this._oneditchange}
              onEditStop={this.__editfinished}
//              onCreated={this._onshapecomplete}   
//              onClick={this._onMapClick}
            />
        </FeatureGroup>
      </div>
    )
  }

  render() {
    const position = [this.state.lat, this.state.lng]; 
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
          zoom={this.state.zoom}
          style={styles.map}
        >
          {this.renderMap()}
          {this.renderDraw()}
        </Map>
      </div>
    )
  }
}
