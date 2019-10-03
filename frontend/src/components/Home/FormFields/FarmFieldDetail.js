import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/styles'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { Button, FormGroup, Label, Input } from 'reactstrap'
// import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import Map from './map'
import './styles.css'
import 'leaflet/dist/leaflet.css'
import { createFarm } from '../../../actions/farm'

class FarmFieldDetail extends Component {
  listRef = null

  constructor(props) {
    super(props)

    this.state = {
      lat: 51.505,
      lng: -0.09,
      zoom: 13,
      geoJSON:'',
      fieldName:'',
      clientName:'',
      farmName:'',
      approxArea:0,
      userId : this.props.auth.user.id
    }
   this.getMapdata = (getgeojson) => { console.log(getgeojson);
       this.setState({geoJSON:getgeojson})
   }
   this.handleSubmit = this.handleSubmit.bind(this);
   this.handleInputChange = this.handleInputChange.bind(this)
  }

  handleInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    })
  }

  handleSubmit(e) {
    e.preventDefault() 
    console.log(this.state);
    const farm = {
      userId : this.state.userId,        
      fieldName: this.state.fieldName,
      clientName: this.state.clientName,
      farmName: this.state.farmName, 
      farmArea : this.state.approxArea,
      geoJSON: this.state.geoJSON,
    }
    this.props.createFarm(farm)
  }


  render() {
    const { classes } = this.props
    const position = [51.505, -0.09]
    return (
     <form onSubmit={this.handleSubmit}>
      <div className="detail-form-section">
        <div className="section">
          <div className="form-right-section">
            <TextField className={classes.search} placeholder="Search Field" />
            <Typography className={classes.title} component="h6">
              Add a Field
            </Typography>
            <Typography className={classes.content} component="p">
              You can use the Draw tool to create a shape, or you can upload a
              shape by clicking import in the top navigation.
            </Typography>
          </div>
          <div className="form-content-section">
            <FormGroup>
              <Label for="fieldName">Field Name</Label>
              <Input
                type="text"
                name="fieldName"
                id="fieldName"
                placeholder="Field Name"
                onChange={this.handleInputChange}
                value={this.state.fieldName}
              />

              <Label for="clientName">Client Name</Label>
              <Input
                type="text"
                name="clientName"
                id="clientName"
                placeholder="Client Name"
                onChange={this.handleInputChange}
                value={this.state.clientName}
              />
              <Label for="farmName">Farm Name</Label>
              <Input
                type="text"
                name="farmName"
                id="farmName"
                placeholder="Farm Name"
                onChange={this.handleInputChange}
                value={this.state.farmName}
              />
              <Label for="approxArea">Approximate Area</Label>
              <Input
                type="text"
                name="approxArea"
                id="approxArea"
                placeholder="0 ac"
                onChange={this.handleInputChange}
                value={this.state.farmArea}
              />
            </FormGroup>
          </div>
          <div className="btn-section">
            <Button className="btn-primary-section">Save</Button>
            <Button className="btn-primary-section">Save & Add More</Button>
            <Button
              className="btn-primary-section"
              style={{
                background: 'none',
                color: '#2d7afa',
                border: '1px solid #2d7afa',
              }}
            >
              Cancel
            </Button>
          </div>
        </div>

        <div id="map" style={{ width: '100%', height: '100%' }}>
          <Map geojsontostate={this.getMapdata} />
        </div>
      </div>
     </form>
    )
  }
}
const styles = {
  btnStyle: {
    color: '#2d7afa',
  },
  search: {
    marginLeft: '20px',
  },
  title: {
    padding: '1px',
    marginLeft: '15px',
  },
  content: {
    padding: '5px',
    marginLeft: '15px',
    fontSize: '12px',
  },
}
const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
})

const mapDispatchToProps = {
  createFarm
}
export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(FarmFieldDetail))


