import React, { Component} from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/styles'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { Button, FormGroup, Label, Input } from 'reactstrap'
// import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import Map from './map'
import './styles.css'
import 'leaflet/dist/leaflet.css'
import { createFarm,updateFarm,getFarmList } from '../../../actions/farm'
import classnames from 'classnames'

class FarmFieldDetail extends Component {
  listRef = null
  constructor(props) {
    super(props)
    let id = this.props.location.pathname.split("/");
    let ids = id[id.length-2]     
    id = id[id.length-1];
    this.state = {
      lat: 51.505,
      lng: -0.09,
      zoom: 3,
      geoJSON:'',
      fieldName:'',
      clientName:'',
      farmName:'',
      approxArea:0,
      userId : this.props.auth.user.id,
      errors: {},
      farmId:'',
      farmdata:'',
      tid : id,
      status:'NEW',
      bstat:'',
      cid : ids 
     }
console.log(id);
   this.getMapdata = (getgeojson) => { 
       this.setState({geoJSON:getgeojson})
   }
   this.getAreadata = (getarea) => { 
       this.setState({approxArea:getarea})
   }

//   this.handleSubmit = this.handleSubmit.bind(this);
   this.handleInputChange = this.handleInputChange.bind(this)
  }

  handleInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    })
  }

  componentWillReceiveProps(nextProps) {
    this.setState({status:"NEW"});  
    let isolddata = false;
    if (nextProps.farm.getFarms.data) {
        this.setState({farmId:nextProps.farm.getFarms.data._id});
        this.setState({status:"OLD"}); 
        isolddata = true;
       }
    if (nextProps.farm.getFarmsList && nextProps.farm.getFarmsList.length > 0)
       {
        for (let idata = 0; idata < nextProps.farm.getFarmsList.length;idata++)
            {
             if (nextProps.farm.getFarmsList[idata]._id === this.state.tid)
                {
                 this.setState({farmId:this.state.tid}); 
                 this.setState({status:"OLD"});
                 isolddata = true;
                 this.setState({fieldName:nextProps.farm.getFarmsList[idata].fieldName}); 
                 this.setState({clientName:nextProps.farm.getFarmsList[idata].clientName}); 
                 this.setState({farmName:nextProps.farm.getFarmsList[idata].farmName}); 
                 this.setState({approxArea:nextProps.farm.getFarmsList[idata].approxArea}); 
                 let shapeGeoJSON = {}; 
                 shapeGeoJSON.type = "FeatureCollection";
                 shapeGeoJSON.features = [];
                 let shape = nextProps.farm.getFarmsList[idata].geoJSON.features; 
                 for (let ishape = 0; ishape < shape.length; ishape++)
                     {
                      let f = {};
                      for (let ikeys in shape[ishape])
                          {
                           if (shape[ishape][ikeys].length === 1)
                              {
                               f[ikeys] = shape[ishape][ikeys][0]
                              }
                           else
                              {     
                               f[ikeys] =shape[ishape][ikeys]  
                              }   
                          }  
                      shapeGeoJSON.features.push(f);
                     }  
                 this.setState({geoJSON:shapeGeoJSON});
                 break;   
                }
            }  
       }  
    setTimeout(() => { 
       if (this.state.recstatus === "NEW") { console.log("jitta");
           this.setState({farmId:''});
       } 
    },200);
    if (nextProps.errors) {
        this.setState({
          errors: nextProps.errors,
        })
    }
  }


  handleSubmit(e) { 
    e.preventDefault() 
    let shapeGeoJSON = {}; 
    shapeGeoJSON.type = "FeatureCollection";
    shapeGeoJSON.features = [];
    let shape = this.state.geoJSON.features;
    for (let ishape = 0; ishape < shape.length; ishape++)
        {
         let f = {};
         for (let ikeys in shape[ishape])
             {
              if (shape[ishape][ikeys].length > 0)
                 {
                  f[ikeys] = shape[ishape][ikeys]
                 }
              else
                 { 
                  f[ikeys] = [];
                  f[ikeys].push(shape[ishape][ikeys])
                 }   
             }  
         shapeGeoJSON.features.push(f);
        }  
    this.setState({geoJSON:shapeGeoJSON});

    const farm = {
      userId : this.state.userId,        
      fieldName: this.state.fieldName,
      clientName: this.state.clientName,
      farmName: this.state.farmName, 
      approxArea : String(this.state.approxArea),
      geoJSON: this.state.geoJSON,
     }
console.log(this.state.farmId);
    if (!this.state.farmId) 
       { 
        this.props.createFarm(farm)
       }
    else
       {
        this.props.updateFarm(this.state.farmId,farm)
       }    
    setTimeout(()=>{
      if (this.state.bstat === "Save" || this.state.bstat === "Cancel")
         {  
          this.props.history.go(-1)
         }
//       this.props.history.push(`/farmfields/${this.state.cid}`)
    },100)  
  }

  componentDidMount () {
    this.props.getFarmList(this.state.userId)
  }

  setbstat1 = (e) => { 
    this.setState({bstat:"Save"}); 
    this.handleSubmit(e)
  }

  setbstat2 = (e) => { 
    this.setState({bstat:"Save&Continue"}); 
    this.handleSubmit(e)
  }

  setbstat3 = (e) => { 
    this.setState({bstat:"Cancel"}); 
    this.handleSubmit(e)
  }

  render() {
    const { classes } = this.props
    const { errors } = this.state
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
                className={classnames('form-control form-control-lg', {
                  'is-invalid': errors.fieldName,
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
                className={classnames('form-control form-control-lg', {
                  'is-invalid': errors.clientName,
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
                className={classnames('form-control form-control-lg', {
                  'is-invalid': errors.farmName,
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
                className={classnames('form-control form-control-lg', {
                  'is-invalid': errors.approxArea,
                })}
                onChange={this.handleInputChange}
                value={this.state.approxArea}
              />
            </FormGroup>
          </div>
          <div className="btn-section">
            <Button className="btn-primary-section" onClick={this.setbstat1}>Save</Button>
            <Button className="btn-primary-section" onClick={this.setbstat2}>Save & Add More</Button>
            <Button
              className="btn-primary-section"
              style={{
                background: 'none',
                color: '#2d7afa',
                border: '1px solid #2d7afa',
              }}
              onClick={this.setbstat3} 
            >
              Cancel
            </Button>
          </div>
        </div>

        <div id="map" style={{ width: '100%', height: '100%' }}>
          <Map geojsontostate={this.getMapdata} getarea={this.getAreadata} farmid = {this.state.farmId} status = {this.state.status} farmdata = {this.state.geoJSON}/>
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
  farm:state.farm
})

const mapDispatchToProps = {
  createFarm,
  updateFarm,
  getFarmList
}
export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(FarmFieldDetail))
 

