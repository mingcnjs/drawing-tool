import React, { Component } from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/styles";
import Typography from "@material-ui/core/Typography";
import { Button, FormGroup, Label, Input } from "reactstrap";
import Map from "./map";
import "./styles.css";
import "leaflet/dist/leaflet.css";
import {
  createFarm,
  updateFarm,
  getFarmList,
  deleteFarm
} from "../../../actions/farm";
import classnames from "classnames";
import Autocomplete from "react-autocomplete";
import request from "request";
import L from "leaflet";
import { toast } from "react-toastify";

class FarmFieldDetail extends Component {
  listRef = null;
  mapRef = React.createRef();

  constructor(props) {
    super(props);

    console.log(props);
    this.USAbound = [-171.791110603, 18.91619, -66.96466, 71.3577635769];
    this.USAbounds = L.latLngBounds();
    this.USAbounds.extend([this.USAbound[0], this.USAbound[1]]);
    this.USAbounds.extend([this.USAbound[2], this.USAbound[3]]);

    console.log(this.USAbounds);
    this.state = {
      lat: 30.51,
      lng: -0.06,
      zoom: 12,
      geoJSON: "",
      fieldName: "",
      clientName: "",
      farmName: "",
      approxArea: 0,
      userId: this.props.auth.user.id,
      errors: {},
      addressList: [],
      value: "",
      addressresultcount: 500000,
      addressUrl: "https://nominatim.openstreetmap.org/search?"
    };

    this.getMapdata = getgeojson => {
      this.setState({ geoJSON: getgeojson });
    };

    this.getAreadata = getarea => {
      this.setState({ approxArea: getarea });
    };

    //   this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  isNew = () => {
    return this.props.match.params.fieldId === "add";
  };

  componentWillReceiveProps(nextProps) {
    const fieldId = this.props.match.params.fieldId;
    if (fieldId !== "add") {
      if (
        nextProps.farm.getFarmsList &&
        nextProps.farm.getFarmsList.length > 0
      ) {
        const field = nextProps.farm.getFarmsList.find(f => f._id === fieldId);
        if (field) {
          const {
            fieldName,
            farmName,
            clientName,
            approxArea,
            geoJSON
          } = field;
          let shapeGeoJSON = {};
          shapeGeoJSON.type = "FeatureCollection";
          shapeGeoJSON.features = [];
          let shape = geoJSON.features;
          for (let ishape = 0; ishape < shape.length; ishape++) {
            let f = {};
            for (let ikeys in shape[ishape]) {
              if (shape[ishape][ikeys].length === 1) {
                f[ikeys] = shape[ishape][ikeys][0];
              } else {
                f[ikeys] = shape[ishape][ikeys];
              }
            }
            shapeGeoJSON.features.push(f);
          }
          this.setState({
            status: "EDIT",
            fieldName,
            farmName,
            clientName,
            approxArea,
            geoJSON: shapeGeoJSON
          });
        } else {
          this.props.history.goBack();
        }
      } else {
        this.props.history.goBack();
      }
    }

    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors
      });
    }
  }

  getAddress = value => {
    request(
      this.state.addressUrl +
        "format=json&limit=" +
        this.state.addressresultcount +
        "&q=" +
        value,
      (error, response, body) => {
        let data = JSON.parse(body);
        data.sort(function(a, b) {
          return parseFloat(a) - parseFloat(b);
        });
        let addressL = "";
        this.setState({ addressList: [] });
        let addl = [];
        for (let idata = 0; idata < data.length; idata++) {
          if (addressL) {
            if (
              addressL
                .toUpperCase()
                .indexOf(data[idata]["display_name"] + "||".toUpperCase() > -1)
            ) {
              continue;
            }
          }
          let pss = [parseFloat(data[idata].lon), parseFloat(data[idata].lat)];
          if (!this.USAbounds.contains(pss)) {
            continue;
          }
          let add = {};
          add.name = data[idata]["display_name"];
          addressL += data[idata]["display_name"] + "||";
          add.pos = {};
          add.pos.lat = parseFloat(data[idata].lat);
          add.pos.lng = parseFloat(data[idata].lon);
          add.key = idata;
          addl.push(add);
        }
        this.setState({ addressList: addl });
      }
    );
  };

  save = () => {
    if (!this.state.geoJSON || this.state.geoJSON.features.length === 0)
      return Promise.reject();
    let shapeGeoJSON = {};
    shapeGeoJSON.type = "FeatureCollection";
    shapeGeoJSON.features = [];
    let shape = this.state.geoJSON.features;
    for (let ishape = 0; ishape < shape.length; ishape++) {
      let f = {};
      for (let ikeys in shape[ishape]) {
        if (shape[ishape][ikeys].length > 0) {
          f[ikeys] = shape[ishape][ikeys];
        } else {
          f[ikeys] = [];
          f[ikeys].push(shape[ishape][ikeys]);
        }
      }
      shapeGeoJSON.features.push(f);
    }
    const farm = {
      userId: this.props.match.params.id,
      fieldName: this.state.fieldName,
      clientName: this.state.clientName,
      farmName: this.state.farmName,
      approxArea: String(this.state.approxArea),
      geoJSON: shapeGeoJSON
    };
    if (this.isNew()) {
      return this.props.createFarm(farm);
    } else {
      return this.props.updateFarm(this.props.match.params.fieldId, farm);
    }
  };

  componentDidMount() {
    this.props.getFarmList(this.props.match.params.id);
  }

  justSave = () => {
    this.save().then(() => {
      toast.success(`Success. ${this.state.fieldName} was updated`);
      this.props.history.goBack();
    });
  };

  saveAndContinue = () => {
    this.save().then(() => {
      toast.success(`Success. ${this.state.fieldName} was updated`);
      if (this.isNew()) {
        this.setState({
          fieldName: "",
          clientName: "",
          farmName: "",
          approxArea: 0
        });
        this.mapRef.current.reset();
      } else {
        this.props.history.push(`/farm/${this.props.auth.user.id}/fields/add`);
      }
    });
  };

  cancel = () => {
    this.props.history.goBack();
  };

  deleteFarm = () => {
    if (!this.isNew()) {
      this.props.deleteFarm(this.props.match.params.fieldId).then(() => {
        toast.success(`Success. ${this.state.fieldName} was deleted`);
        this.props.history.goBack();
      });
    }
  };

  rePosition = pos => {
    console.log(pos);
    this.setState({ lat: pos.lat });
    this.setState({ lng: pos.lng });
  };

  render() {
    const { classes } = this.props;
    const { errors } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <div className="detail-form-section">
          <div className="section">
            <div className="form-right-section">
              <div id="addresslist" style={{ marginLeft: "15px" }}>
                <Autocomplete
                  value={this.state.value}
                  wrapperStyle={{
                    width: "220px",
                    position: "absolute",
                    display: "inline-block"
                  }}
                  items={this.state.addressList}
                  inputProps={{ style: { width: "220px" } }}
                  getItemValue={item => item.name}
                  shouldItemRender={(item, value) =>
                    item.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                  }
                  onChange={(event, value) => {
                    this.getAddress(value);
                    this.setState({ value });
                  }}
                  onSelect={(item, value) =>
                    this.setState({
                      value: item,
                      reposition: this.rePosition(value.pos)
                    })
                  }
                  renderMenu={(items, value) => (
                    <div className="menu">
                      {value === "" ? (
                        <div style={{ background: "#FAEBD7" }} className="item">
                          Type of the name of a farm
                        </div>
                      ) : this.state.loading ? (
                        <div style={{ background: "#FAEBD7" }} className="item">
                          Loading...
                        </div>
                      ) : items.length === 0 ? (
                        <div style={{ background: "#FAEBD7" }} className="item">
                          No matches found
                        </div>
                      ) : (
                        items
                      )}
                    </div>
                  )}
                  renderItem={(item, isHighlighted) => (
                    <div
                      style={{
                        background: isHighlighted ? "#FAEBD7" : "lightblue",
                        border: "1px solid",
                        textAlign: "left"
                      }}
                      key={item.key}
                    >
                      <div
                        style={{
                          width: "220px",
                          flexDirection: "row",
                          flex: 1,
                          flexWrap: "wrap",
                          flexShrink: 1
                        }}
                      >
                        {item.name}
                      </div>
                    </div>
                  )}
                />
              </div>
              <Typography
                className={classes.content}
                component="p"
                style={{ paddingTop: "35px", marginLeft: "10px" }}
              >
                You can use the Draw tool to create a shape, or you can upload a
                shape by clicking import in the top navigation.
              </Typography>
            </div>
            <div className="form-content-section">
              <FormGroup style={{ marginBottom: 0 }}>
                <Label for="fieldName">Field Name</Label>
                <Input
                  type="text"
                  name="fieldName"
                  id="fieldName"
                  placeholder="Field Name"
                  className={classnames("form-control form-control-lg", {
                    "is-invalid": errors.fieldName
                  })}
                  onChange={this.handleInputChange}
                  value={this.state.fieldName}
                />

                <Label for="clientName">Client Name</Label>
                <Input
                  type="text"
                  name="clientName"
                  id="clientName"
                  placeholder="Client Name"
                  className={classnames("form-control form-control-lg", {
                    "is-invalid": errors.clientName
                  })}
                  onChange={this.handleInputChange}
                  value={this.state.clientName}
                />
                <Label for="farmName">Farm Name</Label>
                <Input
                  type="text"
                  name="farmName"
                  id="farmName"
                  placeholder="Farm Name"
                  className={classnames("form-control form-control-lg", {
                    "is-invalid": errors.farmName
                  })}
                  onChange={this.handleInputChange}
                  value={this.state.farmName}
                />
                <Label for="approxArea">Approximate Area</Label>
                <Input
                  type="text"
                  name="approxArea"
                  id="approxArea"
                  placeholder="0 ac"
                  className={classnames("form-control form-control-lg", {
                    "is-invalid": errors.approxArea
                  })}
                  onChange={this.handleInputChange}
                  value={this.state.approxArea}
                />
              </FormGroup>
            </div>
            <div className="btn-section">
              <Button
                className="btn-primary-section"
                onClick={this.justSave}
                style={{ marginTop: 0 }}
              >
                Save
              </Button>
              <Button
                className="btn-primary-section"
                onClick={this.saveAndContinue}
              >
                Save & Add More
              </Button>
              <Button
                className="btn-primary-section"
                style={{
                  background: "none",
                  color: "#2d7afa",
                  border: "1px solid #2d7afa"
                }}
                onClick={this.cancel}
              >
                Cancel
              </Button>
            </div>
          </div>
          <div id="map" style={{ width: "100%", height: "100%" }}>
            <Map
              ref={this.mapRef}
              zoom={this.state.zoom}
              lat={this.state.lat}
              lng={this.state.lng}
              onDeleteFarm={this.deleteFarm}
              geojsontostate={this.getMapdata}
              getarea={this.getAreadata}
              isNew={this.isNew()}
              status={this.state.status}
              farmdata={this.state.geoJSON}
            />
          </div>
        </div>
      </form>
    );
  }
}
const styles = {
  btnStyle: {
    color: "#2d7afa"
  },
  search: {
    marginLeft: "20px"
  },
  title: {
    padding: "1px",
    marginLeft: "15px"
  },
  content: {
    padding: "5px",
    marginLeft: "15px",
    fontSize: "12px"
  },
  menu: {
    overflowY: "auto !important",
    overflowX: "hidden !important"
  }
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
  farm: state.farm
});

const mapDispatchToProps = {
  createFarm,
  updateFarm,
  getFarmList,
  deleteFarm
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(FarmFieldDetail));
