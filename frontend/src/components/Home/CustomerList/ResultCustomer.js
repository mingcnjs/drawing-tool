import React, { Component } from "react";
import { connect } from "react-redux";
import { getCustomerList, deleteCustomer } from "../../../actions/customer";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Checkbox from "@material-ui/core/Checkbox";
import { Button } from "reactstrap";
import { getFarmList } from "../../../actions/farm";
import { toast } from "react-toastify";
import JSZip from "jszip";
import "./styles.css";
var shpwrite = require("shp-write");
var FileSaver = require("file-saver");
import S3 from "aws-s3";

const b64toBlob = (b64Data, contentType = "", sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

class ResultCustomer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      customerDatas: [],
      checkStatus: false,
      selected: []
    };
    this.delete = this.delete.bind(this);
    this.edit = this.edit.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  componentDidMount() {
    this.props.getCustomerList(this.props.auth.user.id);
  }

  refresh = () => {
    this.setState({
      selected: []
    });
    this.props.getCustomerList(this.props.auth.user.id);
  };

  handleClick(event, name) {
    const { selected } = this.state;
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    this.setState({
      selected: newSelected
    });
  }

  delete() {
    if (this.state.selected.length > 0) {
      Promise.all(
        this.state.selected.map(customerId => {
          return this.props.deleteCustomer(customerId);
        })
      ).then(() => {
        this.refresh();
      });
    }
  }

  sendToGrowers = item => {
    this.props.getFarmList(item._id).then(fields => {
      if (fields.length > 0) {
        var zip = new JSZip();
        fields.forEach(field => {
          let shapeGeoJSON = {};
          shapeGeoJSON.type = "FeatureCollection";
          shapeGeoJSON.features = [];
          let shape = field.geoJSON.features;
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
          const z = shpwrite.zip(shapeGeoJSON, {
            folder: "",
            types: {
              point: `${item.operationName}_${field.farmName}_${field.fieldName}__points`,
              polygon: `${item.operationName}_${field.farmName}_${field.fieldName}__polygons`,
              line: `${item.operationName}_${field.farmName}_${field.fieldName}__lines`
            }
          });
          zip.file(
            `${item.operationName}_${field.farmName}_${field.fieldName}.zip`,
            b64toBlob(z)
          );
        });
        zip.generateAsync({ type: "blob" }).then(function(content) {
          const s3Client = new S3({
            bucketName: "manuel-growers",
            dirName: "temps/",
            region: "ap-southeast-1",
            accessKeyId: "AKIAIZ6AOEOZT3DH3EIQ",
            secretAccessKey: "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"
          });
          FileSaver.saveAs(
            content,
            `${new Date().getMonth()}${new Date().getDate()}${new Date().getFullYear()}__${Date.now()}.zip`
          );
          toast.success(`Success. Boundaries sent to Growers`);
        });
      }
    });
  };

  edit(item) {
    this.props.onEdit(item);
  }

  view(item) {
    this.props.onView(item);
  }

  render() {
    const { customer } = this.props;
    const { selected } = this.state;
    const isSelected = name => selected.indexOf(name) !== -1;
    return (
      <div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Farming Operation Name</TableCell>
              <TableCell>Farmer Name</TableCell>
              <TableCell>Email Address</TableCell>
              <TableCell>Growsers ID</TableCell>
              <TableCell style={{ width: 380 }}>Operations</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customer &&
              Object.values(customer).map((row, i) => {
                const isItemSelected = isSelected(row._id);
                const labelId = `enhanced-table-checkbox-${i}`;
                return (
                  <TableRow
                    hover
                    onClick={event => this.handleClick(event, row._id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row._id}
                    selected={isItemSelected}
                  >
                    <TableCell key={i}>
                      <Checkbox
                        checked={isItemSelected}
                        inputProps={{ "aria-labelledby": labelId }}
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                    >
                      {row.operationName}
                    </TableCell>
                    <TableCell>{row.farmerName}</TableCell>
                    <TableCell>{row.farmerEmail}</TableCell>
                    <TableCell>{row.growerCustomerNumber}</TableCell>
                    <TableCell>
                      <Button
                        className="btn-edit-customer"
                        color="primary"
                        size="sm"
                        onClick={() => this.edit(row)}
                      >
                        Edit
                      </Button>
                      <Button
                        style={{ marginLeft: 10 }}
                        className="btn-edit-customer"
                        color="primary"
                        size="sm"
                        onClick={() => this.view(row)}
                      >
                        View Options
                      </Button>
                      <Button
                        style={{ marginLeft: 10 }}
                        className="btn-edit-customer"
                        color="primary"
                        size="sm"
                        onClick={() => this.sendToGrowers(row)}
                      >
                        Send Boundaries to Growers
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <div className="btn-sub-group">
          <Button
            className="btn-delete-customer"
            color="danger"
            size="sm"
            onClick={this.delete}
            disabled={this.state.selected.length === 0}
          >
            Delete
          </Button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
  customer: state.customer.getCustomers
});

const mapDispatchToProps = {
  getCustomerList,
  deleteCustomer,
  getFarmList
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { withRef: true }
)(ResultCustomer);
