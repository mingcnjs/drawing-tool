import React, { Component } from "react";
import { Map, TileLayer, FeatureGroup } from "react-leaflet";
import * as turf from "@turf/turf";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button
} from "reactstrap";
import { MAP_URL_DEFAULT } from "../../../constants";

const styles = {
  map: {
    width: "100%",
    height: "650px"
  },
  mapContainer: {
    width: "100%",
    height: "650px",
    position: "relative",
    boxSizing: "border-box"
  },
  dropdown: {
    zIndex: 100000000
  }
};

export default class MyMap extends Component {
  mapRef = React.createRef();

  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
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
    this.order = 1;
    this.und = {};
    this.unddo = [];
    this.state = {
      dropdownOpen: false,
      firsttime: true,
      loadedgeoJSON: true,
      //      lat : 30.51,
      //      lng : 0.06,
      //      zoom:12,
      deletedropdownOpen: false,
      selectedid: ""
    };
    //   this.handleClick = this.handleClick.bind(this);
  }

  toggle = () => {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  };

  toggledelete = () => {
    this.setState(prevState => ({
      deletedropdownOpen: !prevState.deletedropdownOpen
    }));
  };

  reset = () => {
    this.featuregroup.leafletElement.eachLayer(layer => {
      this.featuregroup.leafletElement.removeLayer(layer);
    });
  };

  renderMap() {
    return <TileLayer url={MAP_URL_DEFAULT} />;
  }

  action = () => {
    //   let shapetoremove = null;
    //   for (let ilayers in this.mapRef._layers)
    //       {
    //        if (this.mapRef._layers[ilayers]._poly || this.mapRef._layers[ilayers]._shape)
    //           {
    //            shapetoremove = this.mapRef._layers[ilayers];
    //            break;
    //           }
    //       }
    //   this.mapRef.removeLayer(shapetoremove)
    //   console.log(this.drawobject);
  };

  _onMounted = drawControl => {
    drawControl._container.style.display = "none";
    drawControl._container
      .querySelector(".leaflet-draw-draw-polygon")
      .setAttribute("id", "drawpolygon");
    drawControl._container
      .querySelector(".leaflet-draw-draw-rectangle")
      .setAttribute("id", "drawrectangle");
    drawControl._container
      .querySelector(".leaflet-draw-draw-circle")
      .setAttribute("id", "drawcircle");
    document
      .querySelector(".leaflet-draw-edit-edit")
      .setAttribute("id", "editpolygon");
    this.drawobject = drawControl;
    //    console.log('_onMounted', drawControl);
    this.isLeafletdrawmounted = true;
    this.mountedldraw = true;
  };

  _oneditvertex = drawControl => {
    let options = {
      steps: 200,
      units: "kilometers",
      options: {}
    };
    let stringshapeGeoJSON = "";
    if (drawControl.poly) {
      let id = drawControl.poly.id;
      let polygon = null;
      let rewind = null;
      for (let ift = 0; ift < this.shapeGeoJSON.features.length; ift++) {
        if (
          this.shapeGeoJSON.features[ift].id.toUpperCase() === id.toUpperCase()
        ) {
          this.und = {};
          this.und.id = id;
          this.und.order = this.order;
          this.order++;
          this.und.type = "edit";
          this.und.stype = id.split("#")[1];
          this.und.spos = [];
          this.und.obj = drawControl.poly;
          this.und.include = false;
          this.shapeGeoJSON.features[ift].geometry.coordinates[0] = [];
          for (
            let ipoints = 0;
            ipoints < drawControl.poly._latlngs[0].length;
            ipoints++
          ) {
            this.shapeGeoJSON.features[ift].geometry.coordinates[0].push([
              drawControl.poly._latlngs[0][ipoints]["lng"],
              drawControl.poly._latlngs[0][ipoints]["lat"]
            ]);
            this.und.spos.push([
              drawControl.poly._latlngs[0][ipoints]["lat"],
              drawControl.poly._latlngs[0][ipoints]["lng"]
            ]);
          }
          this.shapeGeoJSON.features[ift].geometry.coordinates[0].push(
            this.shapeGeoJSON.features[ift].geometry.coordinates[0][0]
          );
          polygon = turf.polygon(
            this.shapeGeoJSON.features[ift].geometry.coordinates
          );
          rewind = turf.rewind(polygon);
          this.shapeGeoJSON.features[ift].geometry.coordinates[0] =
            rewind.geometry.coordinates[0];
          this.undo.push(this.und);
          if (this.undo.length - 2 > -1) {
            this.undo[this.undo.length - 2].include = true;
          }
        }
      }
    }
    let totalarea = 0;
    let points = [];
    points.push([]);
    let poly = null;
    for (let ilayers in this.featuregroup.leafletElement._layers) {
      points = [];
      points.push([]);
      poly = null;
      if (this.featuregroup.leafletElement._layers[ilayers].id) {
        let shapetype = this.featuregroup.leafletElement._layers[
          ilayers
        ].id.split("#")[1];
        if (shapetype === "polygon" || shapetype === "rectangle") {
          for (
            let ipoints = 0;
            ipoints <
            this.featuregroup.leafletElement._layers[ilayers]._latlngs[0]
              .length;
            ipoints++
          ) {
            points[0].push([
              parseFloat(
                this.featuregroup.leafletElement._layers[ilayers]._latlngs[0][
                  ipoints
                ]["lng"]
              ),
              parseFloat(
                this.featuregroup.leafletElement._layers[ilayers]._latlngs[0][
                  ipoints
                ]["lat"]
              )
            ]);
          }
          points[0].push([
            parseFloat(
              this.featuregroup.leafletElement._layers[ilayers]._latlngs[0][0][
                "lng"
              ]
            ),
            parseFloat(
              this.featuregroup.leafletElement._layers[ilayers]._latlngs[0][0][
                "lat"
              ]
            )
          ]);
          poly = turf.polygon(points);
          totalarea += turf.area(poly);
        }
        if (shapetype === "circle") {
          let radius = this.featuregroup.leafletElement._layers[ilayers]
            ._mRadius;
          let center = [
            this.featuregroup.leafletElement._layers[ilayers]._latlng.lng,
            this.featuregroup.leafletElement._layers[ilayers]._latlng.lat
          ];
          if (this.featuregroup.leafletElement._layers[ilayers]._mRadius > 0) {
            poly = turf.circle(center, radius / 1000, options);
            totalarea += turf.area(poly);
          }
        }
      }
    }
    stringshapeGeoJSON = this.shapeGeoJSON;
    this.props.getarea(Math.floor(totalarea * this.meterstoacres * 100) / 100);
    this.props.geojsontostate(stringshapeGeoJSON);
  };

  _oneditchange = drawControl => {
    let options = {
      steps: 200,
      units: "kilometers",
      options: {}
    };
    let stringshapeGeoJSON = "";
    this.layerinaction = drawControl;
    if (drawControl.layer) {
      let id = drawControl.layer.id;
      let ptype = id.split("#")[1];
      for (let ift = 0; ift < this.shapeGeoJSON.features.length; ift++) {
        if (
          this.shapeGeoJSON.features[ift].id.toUpperCase() ===
            id.toUpperCase() &&
          ptype === "rectangle"
        ) {
          this.und = {};
          this.und.id = id;
          this.und.order = this.order;
          this.order++;
          this.und.type = "edit";
          this.und.stype = ptype;
          this.und.spos = [];
          this.und.obj = drawControl.layer;
          this.und.include = false;
          this.shapeGeoJSON.features[ift].geometry.coordinates[0] = [];
          for (
            let ipoints = 0;
            ipoints < drawControl.layer._latlngs[0].length;
            ipoints++
          ) {
            this.shapeGeoJSON.features[ift].geometry.coordinates[0].push([
              drawControl.layer._latlngs[0][ipoints]["lng"],
              drawControl.layer._latlngs[0][ipoints]["lat"]
            ]);
            this.und.spos.push([
              drawControl.layer._latlngs[0][ipoints]["lat"],
              drawControl.layer._latlngs[0][ipoints]["lng"]
            ]);
          }
          this.undo.push(this.und);
          if (this.undo.length - 2 > -1) {
            this.undo[this.undo.length - 2].include = true;
          }
        }
        if (
          this.shapeGeoJSON.features[ift].id.toUpperCase() ===
            id.toUpperCase() &&
          ptype === "circle"
        ) {
          this.und = {};
          this.und.id = id;
          this.und.order = this.order;
          this.order++;
          this.und.type = "edit";
          this.und.stype = ptype;
          this.und.spos = [];
          this.shapeGeoJSON.features[ift].geometry.coordinates[0] = [];
          let radius = drawControl.layer._mRadius;
          let center = [
            drawControl.layer._latlng.lng,
            drawControl.layer._latlng.lat
          ];
          this.und.spos = [
            drawControl.layer._latlng.lat,
            drawControl.layer._latlng.lng
          ];
          this.und.obj = drawControl.layer;
          let polygon = "";
          this.und.radius = 0;
          this.und.include = false;
          if (drawControl.layer._mRadius > 0) {
            polygon = turf.circle(
              center,
              drawControl.layer._mRadius / 1000,
              options
            );
            this.shapeGeoJSON.features[ift].geometry.coordinates[0] =
              polygon.geometry.coordinates[0];
            this.und.radius = drawControl.layer._mRadius;
          }
          this.shapeGeoJSON.features[ift].others = {
            basetype: "Circle",
            center: center
          };
          this.shapeGeoJSON.features[ift].properties.radius = radius;
          this.undo.push(this.und);
          if (this.undo.length - 2 > -1) {
            this.undo[this.undo.length - 2].include = true;
          }
        }
      }
    }
    let totalarea = 0;
    let points = [];
    points.push([]);
    let poly = null;
    for (let ilayers in this.featuregroup.leafletElement._layers) {
      points = [];
      points.push([]);
      poly = null;
      if (this.featuregroup.leafletElement._layers[ilayers].id) {
        let shapetype = this.featuregroup.leafletElement._layers[
          ilayers
        ].id.split("#")[1];
        if (shapetype === "polygon" || shapetype === "rectangle") {
          for (
            let ipoints = 0;
            ipoints <
            this.featuregroup.leafletElement._layers[ilayers]._latlngs[0]
              .length;
            ipoints++
          ) {
            points[0].push([
              parseFloat(
                this.featuregroup.leafletElement._layers[ilayers]._latlngs[0][
                  ipoints
                ]["lng"]
              ),
              parseFloat(
                this.featuregroup.leafletElement._layers[ilayers]._latlngs[0][
                  ipoints
                ]["lat"]
              )
            ]);
          }
          points[0].push([
            parseFloat(
              this.featuregroup.leafletElement._layers[ilayers]._latlngs[0][0][
                "lng"
              ]
            ),
            parseFloat(
              this.featuregroup.leafletElement._layers[ilayers]._latlngs[0][0][
                "lat"
              ]
            )
          ]);
          poly = turf.polygon(points);
          totalarea += turf.area(poly);
        }
        if (shapetype === "circle") {
          let radius = this.featuregroup.leafletElement._layers[ilayers]
            ._mRadius;
          let center = [
            this.featuregroup.leafletElement._layers[ilayers]._latlng.lng,
            this.featuregroup.leafletElement._layers[ilayers]._latlng.lat
          ];
          if (this.featuregroup.leafletElement._layers[ilayers]._mRadius > 0) {
            poly = turf.circle(center, radius / 1000, options);
            totalarea += turf.area(poly);
          }
        }
      }
    }
    stringshapeGeoJSON = this.shapeGeoJSON;
    this.props.getarea(Math.floor(totalarea * this.meterstoacres * 100) / 100);
    this.props.geojsontostate(stringshapeGeoJSON);
  };

  _oneditfinished = drawControl => {
    this.layerinaction = drawControl;
    setTimeout(() => {
      this.drawobject._container.querySelector("#editpolygon").click();
    }, 300);
  };

  _onCreate = drawControl => {
    let options = {
      steps: 200,
      units: "kilometers",
      options: {}
    };
    drawControl.layer._path.setAttribute("id", "shape_" + this.layercount);
    drawControl.layer.id =
      "shape_" + this.layercount + "#" + drawControl.layerType;
    let stringshapeGeoJSON = "";
    let polygon = null;
    let rewind = null;
    this.und = {};
    if (
      drawControl.layerType === "polygon" ||
      drawControl.layerType === "rectangle"
    ) {
      let feature = {};
      feature.id = "shape_" + this.layercount + "#" + drawControl.layerType;
      this.und.id = feature.id;
      this.und.order = this.order;
      this.order++;
      this.und.type = "add";
      this.und.stype = drawControl.layerType;
      this.und.spos = [];
      this.und.obj = drawControl.layer;
      this.und.include = true;
      feature.type = "Feature";
      feature.geometry = {};
      feature.properties = {};
      feature.others = {};
      feature.geometry.type = "Polygon";
      feature.geometry.coordinates = [];
      feature.geometry.coordinates.push([]);
      let points = [];
      for (
        let ipoints = 0;
        ipoints < drawControl.layer._latlngs[0].length;
        ipoints++
      ) {
        feature.geometry.coordinates[0].push([
          drawControl.layer._latlngs[0][ipoints]["lng"],
          parseFloat(drawControl.layer._latlngs[0][ipoints]["lat"])
        ]);
        points.push(
          L.latLng(
            drawControl.layer._latlngs[0][ipoints]["lng"],
            parseFloat(drawControl.layer._latlngs[0][ipoints]["lat"])
          )
        );
        this.und.spos.push([
          drawControl.layer._latlngs[0][ipoints]["lat"],
          parseFloat(drawControl.layer._latlngs[0][ipoints]["lng"])
        ]);
      }
      feature.geometry.coordinates[0].push(feature.geometry.coordinates[0][0]);
      polygon = turf.polygon(feature.geometry.coordinates);
      rewind = turf.rewind(polygon);
      feature.geometry.coordinates[0] = rewind.geometry.coordinates[0];
      polygon = rewind;
      this.shapeGeoJSON.features.push(feature);
      stringshapeGeoJSON = this.shapeGeoJSON;
      this.undo.push(this.und);
      if (this.undo.length - 2 > -1) {
        this.undo[this.undo.length - 2].include = true;
      }
    }
    if (drawControl.layerType === "circle") {
      let feature = {};
      feature.id = "shape_" + this.layercount + "#" + drawControl.layerType;
      this.und.id = feature.id;
      this.und.order = this.order;
      this.order++;
      this.und.type = "add";
      this.und.stype = drawControl.layerType;
      this.und.obj = drawControl.layer;
      this.und.include = true;
      feature.type = "Feature";
      feature.geometry = {};
      feature.properties = {};
      feature.geometry.type = "Polygon";
      feature.geometry.coordinates = [];
      feature.geometry.coordinates.push([]);
      let radius = drawControl.layer._mRadius;
      let center = [
        drawControl.layer._latlng.lng,
        drawControl.layer._latlng.lat
      ];
      this.und.spos = [
        drawControl.layer._latlng.lat,
        drawControl.layer._latlng.lng
      ];
      if (drawControl.layer._mRadius > 0) {
        polygon = turf.circle(
          center,
          drawControl.layer._mRadius / 1000,
          options
        );
        feature.geometry.coordinates[0] = polygon.geometry.coordinates[0];
        this.und.radius = drawControl.layer._mRadius;
      }
      feature.others = { basetype: "Circle", center: center };
      feature.properties.radius = radius;
      this.shapeGeoJSON.features.push(feature);
      stringshapeGeoJSON = this.shapeGeoJSON;
      this.undo.push(this.und);
      if (this.undo.length - 2 > -1) {
        this.undo[this.undo.length - 2].include = true;
      }
    }
    let totalarea = 0;
    let points = [];
    points.push([]);
    let poly = null;
    for (let ilayers in this.featuregroup.leafletElement._layers) {
      points = [];
      points.push([]);
      poly = null;
      if (this.featuregroup.leafletElement._layers[ilayers].id) {
        let shapetype = this.featuregroup.leafletElement._layers[
          ilayers
        ].id.split("#")[1];
        if (shapetype === "polygon" || shapetype === "rectangle") {
          for (
            let ipoints = 0;
            ipoints <
            this.featuregroup.leafletElement._layers[ilayers]._latlngs[0]
              .length;
            ipoints++
          ) {
            points[0].push([
              parseFloat(
                this.featuregroup.leafletElement._layers[ilayers]._latlngs[0][
                  ipoints
                ]["lng"]
              ),
              parseFloat(
                this.featuregroup.leafletElement._layers[ilayers]._latlngs[0][
                  ipoints
                ]["lat"]
              )
            ]);
          }
          points[0].push([
            parseFloat(
              this.featuregroup.leafletElement._layers[ilayers]._latlngs[0][0][
                "lng"
              ]
            ),
            parseFloat(
              this.featuregroup.leafletElement._layers[ilayers]._latlngs[0][0][
                "lat"
              ]
            )
          ]);
          poly = turf.polygon(points);
          totalarea += turf.area(poly);
        }
        if (shapetype === "circle") {
          let radius = this.featuregroup.leafletElement._layers[ilayers]
            ._mRadius;
          let center = [
            this.featuregroup.leafletElement._layers[ilayers]._latlng.lng,
            this.featuregroup.leafletElement._layers[ilayers]._latlng.lat
          ];
          if (drawControl.layer._mRadius > 0) {
            poly = turf.circle(center, radius / 1000, options);
            totalarea += turf.area(poly);
          }
        }
      }
    }
    this.props.getarea(Math.floor(totalarea * this.meterstoacres * 100) / 100);
    this.props.geojsontostate(stringshapeGeoJSON);
    drawControl.layer.on({
      //      mouseover: this.highlightFeature.bind(this),
      //      mouseout: this.resetHighlight.bind(this),
      click: this._onLayerClick.bind(this)
    });
    this.layercount++;
    this.editstarted = true;
    this.drawobject._container.querySelector("#editpolygon").click();
    setTimeout(() => {
      if (this.drawobject._container.querySelector('[title="Save changes"]')) {
        this.drawobject._container
          .querySelector('[title="Save changes"]')
          .setAttribute("id", "savechanges");
      }
      if (
        this.drawobject._container.querySelector(
          '[title="Cancel editing, discards all changes"]'
        )
      ) {
        this.drawobject._container
          .querySelector('[title="Cancel editing, discards all changes"]')
          .setAttribute("id", "cancelchanges");
      }
    }, 500);
  };

  _onLayerClick(e) {
    this.setState({ selectedid: e.target.id });
  }

  deleteshape = () => {
    if (!this.state.selectedid) {
      return;
    }
    for (let idlayers in this.featuregroup.leafletElement._layers) {
      if (
        this.featuregroup.leafletElement._layers[idlayers].id ===
        this.state.selectedid
      ) {
        this.und = {};
        this.und.id = this.featuregroup.leafletElement._layers[idlayers].id;
        this.und.order = this.order;
        this.order++;
        this.und.type = "remove";
        this.und.stype = this.featuregroup.leafletElement._layers[
          idlayers
        ].id.split("#")[1];
        this.und.spos = [];
        this.und.include = false;
        this.und.obj = this.featuregroup.leafletElement._layers[idlayers];
        if (this.und.stype === "rectangle" || this.und.stype === "polygon") {
          for (
            let ipoints = 0;
            ipoints <
            this.featuregroup.leafletElement._layers[idlayers]._latlngs[0]
              .length;
            ipoints++
          ) {
            this.und.spos.push([
              parseFloat(
                this.featuregroup.leafletElement._layers[idlayers]._latlngs[0][
                  ipoints
                ]["lat"]
              ),
              parseFloat(
                this.featuregroup.leafletElement._layers[idlayers]._latlngs[0][
                  ipoints
                ]["lng"]
              )
            ]);
          }
        } else {
          this.und.spos = [
            parseFloat(
              this.featuregroup.leafletElement._layers[idlayers]._latlng["lat"]
            ),
            parseFloat(
              this.featuregroup.leafletElement._layers[idlayers]._latlng["lng"]
            )
          ];
          this.und.radius = this.featuregroup.leafletElement._layers[
            idlayers
          ]._mRadius;
        }
        this.featuregroup.leafletElement.removeLayer(
          this.featuregroup.leafletElement._layers[idlayers]
        );
        this.undo.push(this.und);
        if (this.undo.length - 2 > -1) {
          this.undo[this.undo.length - 2].include = true;
        }
      }
    }
    let nshapeGeoJSON = {};
    nshapeGeoJSON.type = "FeatureCollection";
    nshapeGeoJSON.features = [];
    for (
      let ifeatures = 0;
      ifeatures < this.shapeGeoJSON.features.length;
      ifeatures++
    ) {
      if (this.shapeGeoJSON.features[ifeatures].id === this.state.selectedid) {
        continue;
      }
      nshapeGeoJSON.features.push(this.shapeGeoJSON.features[ifeatures]);
    }
    this.shapeGeoJSON.features = nshapeGeoJSON.features;
    this.props.geojsontostate(this.shapeGeoJSON);
    this.setState({ selectedid: "" });
  };

  componentDidMount() {}

  addpolygon = () => {
    if (this.isLeafletdrawmounted) {
      if (this.drawobject._container.querySelector('[title="Save changes"]')) {
        this.drawobject._container
          .querySelector('[title="Save changes"]')
          .setAttribute("id", "savechanges");
        this.drawobject._container
          .querySelector('[title="Save changes"]')
          .click();
      }
      if (
        this.drawobject._container.querySelector(
          '[title="Cancel editing, discards all changes"]'
        )
      ) {
        this.drawobject._container
          .querySelector('[title="Cancel editing, discards all changes"]')
          .setAttribute("id", "cancelchanges");
      }
      this.drawobject._container.querySelector("#drawpolygon").click();
    }
  };

  addrectangle = () => {
    if (this.isLeafletdrawmounted) {
      if (this.drawobject._container.querySelector('[title="Save changes"]')) {
        this.drawobject._container
          .querySelector('[title="Save changes"]')
          .setAttribute("id", "savechanges");
        this.drawobject._container
          .querySelector('[title="Save changes"]')
          .click();
      }
      if (
        this.drawobject._container.querySelector(
          '[title="Cancel editing, discards all changes"]'
        )
      ) {
        this.drawobject._container
          .querySelector('[title="Cancel editing, discards all changes"]')
          .setAttribute("id", "cancelchanges");
      }
      this.drawobject._container.querySelector("#drawrectangle").click();
    }
  };

  addcircle = () => {
    if (this.isLeafletdrawmounted) {
      if (this.drawobject._container.querySelector('[title="Save changes"]')) {
        this.drawobject._container
          .querySelector('[title="Save changes"]')
          .setAttribute("id", "savechanges");
        this.drawobject._container
          .querySelector('[title="Save changes"]')
          .click();
      }
      if (
        this.drawobject._container.querySelector(
          '[title="Cancel editing, discards all changes"]'
        )
      ) {
        this.drawobject._container
          .querySelector('[title="Cancel editing, discards all changes"]')
          .setAttribute("id", "cancelchanges");
      }
      this.drawobject._container.querySelector("#drawcircle").click();
    }
  };

  onFeatureGroupAdd = e => {
    setTimeout(() => {
      let bnds = L.latLngBounds();
      for (let ilay in this.mapRef.current.leafletElement._layers) {
        if (
          this.mapRef.current.leafletElement._layers[ilay]._latlngs &&
          this.mapRef.current.leafletElement._layers[ilay]._latlngs[0]
        ) {
          for (
            var ipoints = 0;
            ipoints <
            this.mapRef.current.leafletElement._layers[ilay]._latlngs[0].length;
            ipoints++
          ) {
            bnds.extend(
              this.mapRef.current.leafletElement._layers[ilay]._latlngs[0][
                ipoints
              ]
            );
          }
        }
      }
      if (bnds.isValid()) {
        this.mapRef.current.leafletElement.fitBounds(bnds);
      }
      this.drawobject._container.querySelector("#editpolygon").click();
      setTimeout(() => {
        if (
          this.drawobject._container.querySelector('[title="Save changes"]')
        ) {
          this.drawobject._container
            .querySelector('[title="Save changes"]')
            .setAttribute("id", "savechanges");
        }
        if (
          this.drawobject._container.querySelector(
            '[title="Cancel editing, discards all changes"]'
          )
        ) {
          this.drawobject._container
            .querySelector('[title="Cancel editing, discards all changes"]')
            .setAttribute("id", "cancelchanges");
        }
      }, 500);
    }, 1500);
  };

  _onFeatureGroupReady = reactFGref => {
    if (this.props.isNew) {
      this.featuregroup = reactFGref;
    } else {
      if (this.isLeafletdrawmounted && this.state.firsttime) {
        this.drawobject._container.querySelector("#editpolygon").click();
        this.setState({ firsttime: false });
        return;
      }
      this.featuregroup = reactFGref;
      setTimeout(() => {
        if (this.props.farmdata && this.state.loadedgeoJSON) {
          this.setState({ loadedgeoJSON: false });
          this.shapeGeoJSON = this.props.farmdata;
          let leafletFG = this.featuregroup.leafletElement;
          let gpoints = null;
          this.layercount = 1;
          let poly = null;
          this.und = {};
          for (
            let ifeat = 0;
            ifeat < this.shapeGeoJSON.features.length;
            ifeat++
          ) {
            this.und = {};
            this.und.type = "initial";
            this.und.order = this.order;
            this.order++;
            let idss = this.shapeGeoJSON.features[ifeat].id.split("#")[1];
            if (
              idss === "polygon" &&
              !this.shapeGeoJSON.features[ifeat].others.basetype
            ) {
              gpoints = [];
              this.und.spos = [];
              for (
                let ipointsa = 0;
                ipointsa <
                this.shapeGeoJSON.features[ifeat].geometry.coordinates[0]
                  .length;
                ipointsa++
              ) {
                gpoints.push([
                  this.shapeGeoJSON.features[ifeat].geometry.coordinates[0][
                    ipointsa
                  ][1],
                  this.shapeGeoJSON.features[ifeat].geometry.coordinates[0][
                    ipointsa
                  ][0]
                ]);
                this.und.spos.push([
                  this.shapeGeoJSON.features[ifeat].geometry.coordinates[0][
                    ipointsa
                  ][1],
                  this.shapeGeoJSON.features[ifeat].geometry.coordinates[0][
                    ipointsa
                  ][0]
                ]);
              }
              poly = L.polygon(gpoints);
              poly.id = this.shapeGeoJSON.features[ifeat].id;
              leafletFG.addLayer(poly);
              poly._path.setAttribute(
                "id",
                this.shapeGeoJSON.features[ifeat].id
              );
              this.und.id = poly.id;
              this.und.stype = idss;
              this.und.obj = poly;
            }
            if (
              idss === "rectangle" &&
              !this.shapeGeoJSON.features[ifeat].others.basetype
            ) {
              gpoints = [];
              this.und.spos = [];
              for (
                let ipointsb = 0;
                ipointsb <
                this.shapeGeoJSON.features[ifeat].geometry.coordinates[0]
                  .length;
                ipointsb++
              ) {
                gpoints.push([
                  this.shapeGeoJSON.features[ifeat].geometry.coordinates[0][
                    ipointsb
                  ][1],
                  this.shapeGeoJSON.features[ifeat].geometry.coordinates[0][
                    ipointsb
                  ][0]
                ]);
                this.und.spos.push([
                  this.shapeGeoJSON.features[ifeat].geometry.coordinates[0][
                    ipointsb
                  ][1],
                  this.shapeGeoJSON.features[ifeat].geometry.coordinates[0][
                    ipointsb
                  ][0]
                ]);
              }
              poly = L.rectangle(gpoints);
              poly.id = this.shapeGeoJSON.features[ifeat].id;
              leafletFG.addLayer(poly);
              poly._path.setAttribute(
                "id",
                this.shapeGeoJSON.features[ifeat].id
              );
              this.und.id = poly.id;
              this.und.stype = idss;
              this.und.obj = poly;
            }
            if (
              this.shapeGeoJSON.features[ifeat].others.basetype === "Circle"
            ) {
              gpoints = [
                this.shapeGeoJSON.features[ifeat].others.center[1],
                this.shapeGeoJSON.features[ifeat].others.center[0]
              ];
              let radius = parseFloat(
                this.shapeGeoJSON.features[ifeat].properties.radius
              );
              let circle = L.circle(gpoints, { radius: radius });
              circle.id = this.shapeGeoJSON.features[ifeat].id;
              leafletFG.addLayer(circle);
              circle._path.setAttribute(
                "id",
                this.shapeGeoJSON.features[ifeat].id
              );
              poly = circle;
              this.und.spos = [
                this.shapeGeoJSON.features[ifeat].others.center[1],
                this.shapeGeoJSON.features[ifeat].others.center[0]
              ];
              this.und.id = poly.id;
              this.und.radius = radius;
              this.und.stype = this.shapeGeoJSON.features[
                ifeat
              ].others.basetype;
              this.und.obj = poly;
            }
            let ids = this.shapeGeoJSON.features[ifeat].id.split("#");
            this.layercount = parseFloat(ids[0].split("_")[1]);
            this.unddo.push(this.und);
            poly.on({
              click: this._onLayerClick.bind(this)
            });
          }
          if (this.layercount > 1) {
            this.layercount++;
          }
          //               this.setState({shapeGeoJSON:this.props.farmdata});
          //               let leafletGeoJSON = new L.GeoJSON(this.state.shapeGeoJSON);
          //               let leafletFG = this.featuregroup.leafletElement;
          //               leafletGeoJSON.eachLayer( layer =>leafletFG.addLayer(layer));
        }
      }, 500);
    }
  };

  deleteFarm = () => {
    this.props.onDeleteFarm();
  };

  renderDraw() {
    return (
      <div>
        <FeatureGroup
          ref={reactFGref => {
            this._onFeatureGroupReady(reactFGref);
          }}
          onAdd={this.onFeatureGroupAdd}
        >
          <EditControl
            position="bottomleft"
            onCreated={this._onCreate}
            onDeleted={this._onDeleted}
            onMounted={this._onMounted}
            onEditVertex={this._oneditvertex}
            onEditResize={this._oneditchange}
            onEditStop={this.__editfinished}
          />
        </FeatureGroup>
      </div>
    );
  }

  render() {
    const position = [this.props.lat, this.props.lng];
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
          <Dropdown
            style={{ marginLeft: 5 }}
            isOpen={this.state.deletedropdownOpen}
            toggle={this.toggledelete}
          >
            <DropdownToggle caret>Delete</DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={this.deleteshape}>
                Delete Shape
              </DropdownItem>
              {!this.props.isNew && (
                <DropdownItem onClick={this.deleteFarm}>
                  Delete Farm
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
          <Button
            style={{ marginLeft: 5 }}
            onClick={() => {
              let options = {
                steps: 200,
                units: "kilometers",
                options: {}
              };
              let undos = this.undo.sort((a, b) => {
                return a.order - b.order;
              });
              let poly = null;
              let fpolygon = null;
              let frewind = null;
              if (
                undos.length - 1 > 0 &&
                undos[undos.length - 1].type === "edit"
              ) {
                for (let icheck = 0; icheck < this.undo.length; icheck++) {
                  if (
                    this.undo[icheck].id === undos[undos.length - 1].id &&
                    this.undo[icheck].order < undos[undos.length - 1].order &&
                    this.undo[icheck].type === "add"
                  ) {
                    this.undo[icheck].type = "edit";
                    this.undo[icheck].btype = "add";
                    this.unddo.push(this.undo[icheck]);
                  }
                }
              }
              if (
                undos.length === 0 ||
                (this.undo.length === 1 &&
                  this.undo[0].type === "edit" &&
                  !this.undo[0].include)
              ) {
                for (let iund = 0; iund < this.unddo.length; iund++) {
                  for (let iddlayers in this.featuregroup.leafletElement
                    ._layers) {
                    if (
                      this.featuregroup.leafletElement._layers[iddlayers].id ===
                      this.unddo[iund].id
                    ) {
                      this.featuregroup.leafletElement.removeLayer(
                        this.featuregroup.leafletElement._layers[iddlayers]
                      );
                    }
                  }
                  if (this.unddo[iund].btype === "add") {
                    let n3shapeGeoJSON = {};
                    n3shapeGeoJSON.type = "FeatureCollection";
                    n3shapeGeoJSON.features = [];
                    for (
                      let ifts = 0;
                      ifts < this.shapeGeoJSON.features.length;
                      ifts++
                    ) {
                      if (
                        this.shapeGeoJSON.features[ifts].id ===
                        this.unddo[iund].id
                      ) {
                        continue;
                      }
                      n3shapeGeoJSON.features.push(
                        this.shapeGeoJSON.features[ifts]
                      );
                    }
                    this.shapeGeoJSON.features = n3shapeGeoJSON.features;
                    this.props.geojsontostate(this.shapeGeoJSON);
                    continue;
                  }
                  if (this.unddo[iund].stype.toLowerCase() === "polygon") {
                    poly = L.polygon([this.unddo[iund].spos]);
                    poly.id = this.unddo[iund].id;
                    this.featuregroup.leafletElement.addLayer(poly);
                    poly._path.setAttribute("id", this.unddo[iund].id);
                    for (
                      let iftt = 0;
                      iftt < this.shapeGeoJSON.features.length;
                      iftt++
                    ) {
                      if (
                        this.shapeGeoJSON.features[iftt].id.toUpperCase() ===
                        this.unddo[iund].id.toUpperCase()
                      ) {
                        this.shapeGeoJSON.features[
                          iftt
                        ].geometry.coordinates = [];
                        this.shapeGeoJSON.features[
                          iftt
                        ].geometry.coordinates.push([]);
                        for (
                          let ipoints = 0;
                          ipoints < this.unddo[iund].spos.length;
                          ipoints++
                        ) {
                          this.shapeGeoJSON.features[
                            iftt
                          ].geometry.coordinates[0].push([
                            this.unddo[iund].spos[ipoints][1],
                            this.unddo[iund].spos[ipoints][0]
                          ]);
                        }
                        this.shapeGeoJSON.features[
                          iftt
                        ].geometry.coordinates[0].push(
                          this.shapeGeoJSON.features[iftt].geometry
                            .coordinates[0][0]
                        );
                        fpolygon = turf.polygon(
                          this.shapeGeoJSON.features[iftt].geometry.coordinates
                        );
                        frewind = turf.rewind(fpolygon);
                        this.shapeGeoJSON.features[
                          iftt
                        ].geometry.coordinates[0] =
                          frewind.geometry.coordinates[0];
                      }
                    }
                    let stringshapeGeoJSON = this.shapeGeoJSON;
                    this.props.geojsontostate(stringshapeGeoJSON);
                  }
                  if (this.unddo[iund].stype.toLowerCase() === "rectangle") {
                    poly = L.rectangle([this.unddo[iund].spos]);
                    poly.id = this.unddo[iund].id;
                    this.featuregroup.leafletElement.addLayer(poly);
                    poly._path.setAttribute("id", this.unddo[iund].id);
                    for (
                      let iftt = 0;
                      iftt < this.shapeGeoJSON.features.length;
                      iftt++
                    ) {
                      if (
                        this.shapeGeoJSON.features[iftt].id.toUpperCase() ===
                        this.unddo[iund].id.toUpperCase()
                      ) {
                        this.shapeGeoJSON.features[
                          iftt
                        ].geometry.coordinates = [];
                        this.shapeGeoJSON.features[
                          iftt
                        ].geometry.coordinates.push([]);
                        for (
                          let ipoints = 0;
                          ipoints < this.unddo[iund].spos.length;
                          ipoints++
                        ) {
                          this.shapeGeoJSON.features[
                            iftt
                          ].geometry.coordinates[0].push([
                            this.unddo[iund].spos[ipoints][1],
                            this.unddo[iund].spos[ipoints][0]
                          ]);
                        }
                      }
                    }
                    let stringshapeGeoJSON = this.shapeGeoJSON;
                    this.props.geojsontostate(stringshapeGeoJSON);
                  }
                  if (this.unddo[iund].stype.toLowerCase() === "circle") {
                    let pos = L.latLng(
                      this.unddo[iund].spos[0],
                      this.unddo[iund].spos[1]
                    );
                    poly = L.circle(pos, { radius: this.unddo[iund].radius });
                    poly.id = this.unddo[iund].id;
                    this.featuregroup.leafletElement.addLayer(poly);
                    poly._path.setAttribute("id", this.unddo[iund].id);
                    for (
                      let iftt = 0;
                      iftt < this.shapeGeoJSON.features.length;
                      iftt++
                    ) {
                      if (
                        this.shapeGeoJSON.features[iftt].id.toUpperCase() ===
                        this.unddo[iund].id.toUpperCase()
                      ) {
                        this.shapeGeoJSON.features[
                          iftt
                        ].geometry.coordinates[0] = [];
                        let center = [
                          this.unddo[iund].spos[1],
                          this.unddo[iund].spos[0]
                        ];
                        if (this.unddo[iund].radius > 0) {
                          fpolygon = turf.circle(
                            center,
                            this.unddo[iund].radius / 1000,
                            options
                          );
                          this.shapeGeoJSON.features[
                            iftt
                          ].geometry.coordinates[0] =
                            fpolygon.geometry.coordinates[0];
                        }
                        this.shapeGeoJSON.features[iftt].others = {
                          basetype: "Circle",
                          center: center
                        };
                        this.shapeGeoJSON.features[
                          iftt
                        ].properties.radius = this.unddo[iund].radius;
                      }
                    }
                    let stringshapeGeoJSON = this.shapeGeoJSON;
                    this.props.geojsontostate(stringshapeGeoJSON);
                  }
                  if (
                    this.drawobject._container.querySelector(
                      '[title="Save changes"]'
                    )
                  ) {
                    this.drawobject._container
                      .querySelector('[title="Save changes"]')
                      .setAttribute("id", "savechanges");
                    this.drawobject._container
                      .querySelector("#savechanges")
                      .click();
                  }
                  this.drawobject._container
                    .querySelector("#editpolygon")
                    .click();
                }
                this.undo = [];
                if (poly) {
                  poly.on({
                    click: this._onLayerClick.bind(this)
                  });
                }
                let nund = [];
                for (let iund = 0; iund < this.unddo.length; iund++) {
                  if (this.unddo[iund].type === "add") {
                    continue;
                  }
                  nund.push(this.unddo[iund]);
                }
                this.unddo = nund;
                return;
              }
              let lstcnt = 0;
              let lstrev = [];
              for (let irev = undos.length - 1; irev >= 0; irev--) {
                if (undos[irev].include) {
                  lstrev = undos[irev];
                  break;
                }
              }
              if (lstrev) {
                for (let ilst = 0; ilst < undos.length; ilst++) {
                  if (undos[ilst].id === lstrev.id) {
                    lstcnt++;
                  }
                }
              }
              if (
                lstcnt === 0 &&
                undos.length === 1 &&
                undos[0].type === "edit"
              ) {
                lstcnt = 1;
                lstrev = undos[0];
              }
              if (lstcnt === 0) {
              }
              let lastrevert = lstrev;
              if (lastrevert.type === "add") {
                for (let iddlayers in this.featuregroup.leafletElement
                  ._layers) {
                  if (
                    this.featuregroup.leafletElement._layers[iddlayers].id ===
                    lastrevert.id
                  ) {
                    this.featuregroup.leafletElement.removeLayer(
                      this.featuregroup.leafletElement._layers[iddlayers]
                    );
                  }
                }
                let n2shapeGeoJSON = {};
                n2shapeGeoJSON.type = "FeatureCollection";
                n2shapeGeoJSON.features = [];
                for (
                  let ifts = 0;
                  ifts < this.shapeGeoJSON.features.length;
                  ifts++
                ) {
                  if (this.shapeGeoJSON.features[ifts].id === lastrevert.id) {
                    continue;
                  }
                  n2shapeGeoJSON.features.push(
                    this.shapeGeoJSON.features[ifts]
                  );
                }
                this.shapeGeoJSON.features = n2shapeGeoJSON.features;
                this.props.geojsontostate(this.shapeGeoJSON);
                if (
                  this.drawobject._container.querySelector(
                    '[title="Save changes"]'
                  )
                ) {
                  this.drawobject._container
                    .querySelector('[title="Save changes"]')
                    .setAttribute("id", "savechanges");
                  this.drawobject._container
                    .querySelector("#savechanges")
                    .click();
                }
                if (
                  this.drawobject._container.querySelector(
                    '[title="Cancel editing, discards all changes"]'
                  )
                ) {
                  this.drawobject._container
                    .querySelector(
                      '[title="Cancel editing, discards all changes"]'
                    )
                    .setAttribute("id", "cancelchanges");
                }
                this.drawobject._container
                  .querySelector("#editpolygon")
                  .click();
              }
              if (lastrevert.type === "edit") {
                if (
                  this.drawobject._container.querySelector(
                    '[title="Save changes"]'
                  )
                ) {
                  this.drawobject._container
                    .querySelector('[title="Save changes"]')
                    .setAttribute("id", "savechanges");
                  this.drawobject._container
                    .querySelector("#savechanges")
                    .click();
                }
                for (let iddlayers in this.featuregroup.leafletElement
                  ._layers) {
                  if (
                    this.featuregroup.leafletElement._layers[iddlayers].id ===
                    lastrevert.id
                  ) {
                    this.featuregroup.leafletElement.removeLayer(
                      this.featuregroup.leafletElement._layers[iddlayers]
                    );
                  }
                }
                if (lastrevert.stype.toLowerCase() === "polygon") {
                  poly = L.polygon([lastrevert.spos]);
                  poly.id = lastrevert.id;
                  this.featuregroup.leafletElement.addLayer(poly);
                  poly._path.setAttribute("id", lastrevert.id);
                  for (
                    let iftt = 0;
                    iftt < this.shapeGeoJSON.features.length;
                    iftt++
                  ) {
                    if (
                      this.shapeGeoJSON.features[iftt].id.toUpperCase() ===
                      lastrevert.id.toUpperCase()
                    ) {
                      this.shapeGeoJSON.features[
                        iftt
                      ].geometry.coordinates = [];
                      this.shapeGeoJSON.features[
                        iftt
                      ].geometry.coordinates.push([]);
                      for (
                        let ipoints = 0;
                        ipoints < lastrevert.spos.length;
                        ipoints++
                      ) {
                        this.shapeGeoJSON.features[
                          iftt
                        ].geometry.coordinates[0].push([
                          lastrevert.spos[ipoints][1],
                          lastrevert.spos[ipoints][0]
                        ]);
                      }
                      this.shapeGeoJSON.features[
                        iftt
                      ].geometry.coordinates[0].push(
                        this.shapeGeoJSON.features[iftt].geometry
                          .coordinates[0][0]
                      );
                      fpolygon = turf.polygon(
                        this.shapeGeoJSON.features[iftt].geometry.coordinates
                      );
                      frewind = turf.rewind(fpolygon);
                      this.shapeGeoJSON.features[iftt].geometry.coordinates[0] =
                        frewind.geometry.coordinates[0];
                    }
                  }
                  let stringshapeGeoJSON = this.shapeGeoJSON;
                  this.props.geojsontostate(stringshapeGeoJSON);
                }
                if (lastrevert.stype.toLowerCase() === "rectangle") {
                  poly = L.rectangle([lastrevert.spos]);
                  poly.id = lastrevert.id;
                  this.featuregroup.leafletElement.addLayer(poly);
                  poly._path.setAttribute("id", lastrevert.id);
                  for (
                    let iftt = 0;
                    iftt < this.shapeGeoJSON.features.length;
                    iftt++
                  ) {
                    if (
                      this.shapeGeoJSON.features[iftt].id.toUpperCase() ===
                      lastrevert.id.toUpperCase()
                    ) {
                      this.shapeGeoJSON.features[
                        iftt
                      ].geometry.coordinates = [];
                      this.shapeGeoJSON.features[
                        iftt
                      ].geometry.coordinates.push([]);
                      for (
                        let ipoints = 0;
                        ipoints < lastrevert.spos.length;
                        ipoints++
                      ) {
                        this.shapeGeoJSON.features[
                          iftt
                        ].geometry.coordinates[0].push([
                          lastrevert.spos[ipoints][1],
                          lastrevert.spos[ipoints][0]
                        ]);
                      }
                    }
                  }
                  let stringshapeGeoJSON = this.shapeGeoJSON;
                  this.props.geojsontostate(stringshapeGeoJSON);
                }
                if (lastrevert.stype.toLowerCase() === "circle") {
                  poly = L.circle(
                    L.latLng(lastrevert.spos[0], lastrevert.spos[1]),
                    { radius: lastrevert.radius }
                  );
                  poly.id = lastrevert.id;
                  this.featuregroup.leafletElement.addLayer(poly);
                  poly._path.setAttribute("id", lastrevert.id);
                  for (
                    let iftt = 0;
                    iftt < this.shapeGeoJSON.features.length;
                    iftt++
                  ) {
                    if (
                      this.shapeGeoJSON.features[iftt].id.toUpperCase() ===
                      lastrevert.id.toUpperCase()
                    ) {
                      this.shapeGeoJSON.features[
                        iftt
                      ].geometry.coordinates[0] = [];
                      let center = [lastrevert.spos[1], lastrevert.spos[0]];
                      if (lastrevert.radius > 0) {
                        fpolygon = turf.circle(
                          center,
                          lastrevert.radius / 1000,
                          options
                        );
                        this.shapeGeoJSON.features[
                          iftt
                        ].geometry.coordinates[0] =
                          fpolygon.geometry.coordinates[0];
                      }
                      this.shapeGeoJSON.features[iftt].others = {
                        basetype: "Circle",
                        center: center
                      };
                      this.shapeGeoJSON.features[iftt].properties.radius =
                        lastrevert.radius;
                    }
                  }
                  let stringshapeGeoJSON = this.shapeGeoJSON;
                  this.props.geojsontostate(stringshapeGeoJSON);
                }
                this.drawobject._container
                  .querySelector("#editpolygon")
                  .click();
              }
              if (lastrevert.type === "remove") {
                if (
                  this.drawobject._container.querySelector(
                    '[title="Save changes"]'
                  )
                ) {
                  this.drawobject._container
                    .querySelector('[title="Save changes"]')
                    .setAttribute("id", "savechanges");
                  this.drawobject._container
                    .querySelector("#savechanges")
                    .click();
                }
                if (lastrevert.stype.toLowerCase() === "polygon") {
                  poly = L.polygon([lastrevert.spos]);
                  poly.id = lastrevert.id;
                  this.featuregroup.leafletElement.addLayer(poly);
                  poly._path.setAttribute("id", lastrevert.id);
                  let feature = {};
                  feature.id = lastrevert.id;
                  feature.type = "Feature";
                  feature.geometry = {};
                  feature.properties = {};
                  feature.others = {};
                  feature.geometry.type = "Polygon";
                  feature.geometry.coordinates = [];
                  feature.geometry.coordinates.push([]);
                  for (
                    let ipoints = 0;
                    ipoints < lastrevert.spos.length;
                    ipoints++
                  ) {
                    feature.geometry.coordinates[0].push([
                      lastrevert.spos[ipoints][1],
                      parseFloat(lastrevert.spos[ipoints][0])
                    ]);
                  }
                  feature.geometry.coordinates[0].push(
                    feature.geometry.coordinates[0][0]
                  );
                  fpolygon = turf.polygon(feature.geometry.coordinates);
                  frewind = turf.rewind(fpolygon);
                  feature.geometry.coordinates[0] =
                    frewind.geometry.coordinates[0];
                  this.shapeGeoJSON.features.push(feature);
                }
                if (lastrevert.stype.toLowerCase() === "rectangle") {
                  poly = L.rectangle([lastrevert.spos]);
                  poly.id = lastrevert.id;
                  this.featuregroup.leafletElement.addLayer(poly);
                  poly._path.setAttribute("id", lastrevert.id);
                  let feature = {};
                  feature.id = lastrevert.id;
                  feature.type = "Feature";
                  feature.geometry = {};
                  feature.properties = {};
                  feature.others = {};
                  feature.geometry.type = "Polygon";
                  feature.geometry.coordinates = [];
                  feature.geometry.coordinates.push([]);
                  for (
                    let ipoints = 0;
                    ipoints < lastrevert.spos.length;
                    ipoints++
                  ) {
                    feature.geometry.coordinates[0].push([
                      lastrevert.spos[ipoints][1],
                      parseFloat(lastrevert.spos[ipoints][0])
                    ]);
                  }
                  this.shapeGeoJSON.features.push(feature);
                }
                if (lastrevert.stype.toLowerCase() === "circle") {
                  poly = L.circle(
                    L.latLng(lastrevert.spos[0], lastrevert.spos[1]),
                    { radius: lastrevert.radius }
                  );
                  poly.id = lastrevert.id;
                  this.featuregroup.leafletElement.addLayer(poly);
                  poly._path.setAttribute("id", lastrevert.id);
                  let feature = {};
                  feature.id = lastrevert.id;
                  feature.type = "Feature";
                  feature.geometry = {};
                  feature.properties = {};
                  feature.geometry.type = "Polygon";
                  feature.geometry.coordinates = [];
                  feature.geometry.coordinates.push([]);
                  let radius = lastrevert.radius;
                  let center = [lastrevert.spos[1], lastrevert.spos[0]];
                  if (radius > 0) {
                    fpolygon = turf.circle(center, radius / 1000, options);
                    feature.geometry.coordinates[0] =
                      fpolygon.geometry.coordinates[0];
                  }
                  feature.others = { basetype: "Circle", center: center };
                  feature.properties.radius = radius;
                  this.shapeGeoJSON.features.push(feature);
                }
                let stringshapeGeoJSON = this.shapeGeoJSON;
                this.props.geojsontostate(stringshapeGeoJSON);
                this.drawobject._container
                  .querySelector("#editpolygon")
                  .click();
              }
              let nundo = [];
              if (!this.undo[this.undo.length - 1].include) {
                if (this.undo.length < 3) {
                  for (let iundo = 0; iundo < this.undo.length - 2; iundo++) {
                    nundo.push(this.undo[iundo]);
                  }
                } else {
                  for (let iundo = 0; iundo < this.undo.length - 2; iundo++) {
                    nundo.push(this.undo[iundo]);
                  }
                }
              } else {
                for (let iundo = 0; iundo < this.undo.length - 1; iundo++) {
                  nundo.push(this.undo[iundo]);
                }
              }
              if (poly) {
                poly.on({
                  click: this._onLayerClick.bind(this)
                });
              }
              this.undo = nundo;
              let totalarea = 0;
              let points = [];
              points.push([]);
              for (let ilayers in this.featuregroup.leafletElement._layers) {
                points = [];
                points.push([]);
                poly = null;
                if (this.featuregroup.leafletElement._layers[ilayers].id) {
                  let shapetype = this.featuregroup.leafletElement._layers[
                    ilayers
                  ].id.split("#")[1];
                  if (shapetype === "polygon" || shapetype === "rectangle") {
                    for (
                      let ipoints = 0;
                      ipoints <
                      this.featuregroup.leafletElement._layers[ilayers]
                        ._latlngs[0].length;
                      ipoints++
                    ) {
                      points[0].push([
                        parseFloat(
                          this.featuregroup.leafletElement._layers[ilayers]
                            ._latlngs[0][ipoints]["lng"]
                        ),
                        parseFloat(
                          this.featuregroup.leafletElement._layers[ilayers]
                            ._latlngs[0][ipoints]["lat"]
                        )
                      ]);
                    }
                    points[0].push([
                      parseFloat(
                        this.featuregroup.leafletElement._layers[ilayers]
                          ._latlngs[0][0]["lng"]
                      ),
                      parseFloat(
                        this.featuregroup.leafletElement._layers[ilayers]
                          ._latlngs[0][0]["lat"]
                      )
                    ]);
                    poly = turf.polygon(points);
                    totalarea += turf.area(poly);
                  }
                  if (shapetype === "circle") {
                    let radius = this.featuregroup.leafletElement._layers[
                      ilayers
                    ]._mRadius;
                    let center = [
                      this.featuregroup.leafletElement._layers[ilayers]._latlng
                        .lng,
                      this.featuregroup.leafletElement._layers[ilayers]._latlng
                        .lat
                    ];
                    if (
                      this.featuregroup.leafletElement._layers[ilayers]
                        ._mRadius > 0
                    ) {
                      poly = turf.circle(center, radius / 1000, options);
                      totalarea += turf.area(poly);
                    }
                  }
                }
              }
              this.props.getarea(
                Math.floor(totalarea * this.meterstoacres * 100) / 100
              );
            }}
          >
            Undo
          </Button>
        </div>
        <Map
          ref={this.mapRef}
          center={position}
          zoom={this.props.zoom}
          style={styles.map}
        >
          {this.renderMap()}
          {this.renderDraw()}
        </Map>
      </div>
    );
  }
}
