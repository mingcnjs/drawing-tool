import React, { Component } from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/styles";
import Button from "@material-ui/core/Button";
import { getFarmList } from "../../../actions/farm";
import "./styles.css";
import _ from "lodash";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MAP_URL_DEFAULT } from "../../../constants";
import ReactPaginate from "react-paginate";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

const ITEM_PER_PAGE = 10;

class FarmFields extends Component {
  listRef = null;

  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      value: "",
      menuProps: {
        desktop: true,
        disableAutoFocus: true
      },
      fieldList: [],
      allFields: [],
      center: {
        pos: [36.7815021, -119.71189604874],
        zoom: 4
      },
      pageCount: 1,
      items: [],
      pageIndex: 0
    };
  }

  componentDidMount() {
    this.props.getFarmList(this.props.match.params.id);
  }

  handleClickAdd = () => {
    this.props.history.push(`/farm/${this.props.match.params.id}/fields/add`);
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.farm.getFarmsList) {
      if (nextProps.farm.getFarmsList.length > 0) {
        let sorted = _.orderBy(
          nextProps.farm.getFarmsList,
          ["fieldName"],
          ["asc"]
        );
        this.setState({
          allFields: sorted,
          fieldList: sorted,
          pageIndex: 0,
          pageCount: Math.ceil(sorted.length / ITEM_PER_PAGE),
          items: sorted.slice(0, ITEM_PER_PAGE - 1)
        });
      } else {
        if (this.state.allFields.length > 0) {
          this.setState({
            allFields: [],
            fieldList: [],
            pageIndex: 0,
            pageCount: 1,
            items: []
          });
        }
      }
    }
  }

  searchFields = _.debounce(keyword => {
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      const filterred = this.state.allFields.filter(field => {
        return (
          field.fieldName.toLowerCase().includes(lowerKeyword) ||
          field.farmName.toLowerCase().includes(lowerKeyword) ||
          field.clientName.toLowerCase().includes(lowerKeyword)
        );
      });
      this.setState({
        fieldList: filterred,
        pageIndex: 0,
        pageCount: Math.ceil(filterred.length / ITEM_PER_PAGE),
        items: filterred.slice(0, ITEM_PER_PAGE - 1)
      });
    } else {
      this.setState({
        fieldList: this.state.allFields,
        pageIndex: 0,
        pageCount: Math.ceil(this.state.allFields.length / ITEM_PER_PAGE),
        items: this.state.allFields.slice(0, ITEM_PER_PAGE - 1)
      });
    }
  }, 200);

  handlePageClick = data => {
    let pageIndex = data.selected;
    this.setState({
      pageIndex: pageIndex,
      items: this.state.fieldList.slice(
        pageIndex * ITEM_PER_PAGE,
        (pageIndex + 1) * ITEM_PER_PAGE - 1
      )
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <div style={{ display: "flex" }}>
        <div style={{ width: 400 }}>
          <input onChange={e => this.searchFields(e.target.value)}></input>
          <div>
            {this.state.items.map(field => {
              return (
                <div
                  onClick={() => {
                    const pos = [
                      ..._.get(
                        field,
                        "geoJSON.features[0].geometry[0].coordinates[0][0]",
                        []
                      )
                    ];
                    if (pos.length > 0) {
                      pos.reverse();
                      if (pos) {
                        this.setState({
                          center: {
                            pos,
                            zoom: 13
                          }
                        });
                      }
                    }
                  }}
                  key={`field_${field._id}`}
                  className="a_field"
                  style={{
                    border: "1px solid #cccccc",
                    borderRadius: "5px",
                    padding: "10px",
                    marginTop: 10,
                    position: "relative"
                  }}
                >
                  <div
                    style={{
                      fontSize: "15pt",
                      fontWeight: "bold",
                      color: "#6d6d6d",
                      lineHeight: "20px",
                      marginBottom: "5px"
                    }}
                  >
                    {field.fieldName}
                    <i style={{ fontSize: "11pt", fontWeight: "400" }}>
                      ({field.approxArea} ac)
                    </i>
                  </div>
                  <div style={{ fontSize: "10pt", color: "#00679a" }}>
                    <div>
                      <b>Farm</b>: {field.farmName}
                    </div>
                    <div>
                      <b>Client</b>: {field.clientName}
                    </div>
                  </div>
                  <a
                    href={`fields/${field._id}`}
                    style={{ position: "absolute", right: 10, top: "37%" }}
                  >
                    edit
                  </a>
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: this.state.items.length > 0 ? "block" : "none"
            }}
          >
            <ReactPaginate
              previousLabel={"previous"}
              nextLabel={"next"}
              breakLabel={"..."}
              breakClassName={"break-me"}
              pageCount={this.state.pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              forcePage={this.state.pageIndex}
              onPageChange={this.handlePageClick}
              containerClassName={"pagination"}
              subContainerClassName={"pages pagination"}
              activeClassName={"active"}
            />
          </div>
          <div style={{ marginTop: 10 }}>
            <Button
              id="add"
              className={classes.btnStyle}
              onClick={() => {
                this.props.history.goBack();
              }}
            >
              Back
            </Button>
            <Button
              style={{ float: "right" }}
              id="add"
              className={classes.btnStyle}
              onClick={this.handleClickAdd}
            >
              + Add a Field
            </Button>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            marginLeft: 10
          }}
        >
          <Map
            center={this.state.center.pos}
            zoom={this.state.center.zoom}
            style={{
              width: "100%",
              height: "100%",
              minHeight: 650
            }}
          >
            <TileLayer url={MAP_URL_DEFAULT} />
            {/* <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            /> */}
            {this.state.fieldList.map(field => {
              const pos = [
                ..._.get(
                  field,
                  "geoJSON.features[0].geometry[0].coordinates[0][0]",
                  []
                )
              ];
              if (pos.length === 0) {
                return null;
              }
              pos.reverse();
              return (
                <Marker key={field._id} position={pos}>
                  <Popup>
                    <div style={{ width: 200 }}>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>
                        {field.fieldName}
                        <i style={{ fontSize: 12 }}>({field.approxArea} ac)</i>
                      </div>
                      <div>Farm: {field.farmName}</div>
                      <div>Client: {field.clientName}</div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </Map>
        </div>
      </div>
    );
  }
}
const styles = {
  btnStyle: {
    color: "#2d7afa"
  }
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
  farm: state.farm
});

const mapDispatchToProps = {
  getFarmList
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(FarmFields));
