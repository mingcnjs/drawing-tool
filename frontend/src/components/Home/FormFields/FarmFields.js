import React, { Component } from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/styles";
import Button from "@material-ui/core/Button";
import { getFarmList } from "../../../actions/farm";
import "./styles.css";
import _ from "lodash";

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
      allFields: []
    };
  }

  componentDidMount() {
    this.props.getFarmList(this.props.match.params.id);
  }

  handleClickAdd = () => {
    this.props.history.push(`/farm/${this.props.match.params.id}/fields/add`);
  };

  handleClickModify = fieldId => {
    this.props.history.push(
      `/farm/${this.props.match.params.id}/fields/${fieldId}`
    );
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.farm.getFarmsList) {
      if (nextProps.farm.getFarmsList.length > 0) {
        const sorted = _.orderBy(
          nextProps.farm.getFarmsList,
          ["fieldName"],
          ["asc"]
        );
        this.setState({
          allFields: sorted,
          fieldList: sorted
        });
      } else {
        if (this.state.allFields.length > 0) {
          this.setState({
            allFields: [],
            fieldList: []
          });
        }
      }
    }
  }

  searchFields = _.debounce(keyword => {
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      this.setState({
        fieldList: this.state.allFields.filter(field => {
          return (
            field.fieldName.toLowerCase().includes(lowerKeyword) ||
            field.farmName.toLowerCase().includes(lowerKeyword) ||
            field.clientName.toLowerCase().includes(lowerKeyword)
          );
        })
      });
    } else {
      this.setState({
        fieldList: this.state.allFields
      });
    }
  }, 200);

  render() {
    const { classes } = this.props;
    return (
      <div>
        <div className="right-section">
          <input onChange={e => this.searchFields(e.target.value)}></input>
          <div>
            {this.state.fieldList.map(field => {
              return (
                <div
                  onClick={() => {
                    this.handleClickModify(field._id);
                  }}
                  key={`field_${field._id}`}
                  className="a_field"
                  style={{
                    border: "1px solid #cccccc",
                    borderRadius: "5px",
                    padding: "10px",
                    marginTop: 10
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
                </div>
              );
            })}
          </div>
          <Button
            style={{ marginTop: 10 }}
            id="add"
            className={classes.btnStyle}
            onClick={this.handleClickAdd}
          >
            + Add a Field
          </Button>
        </div>
        <div className="left-section"></div>
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
