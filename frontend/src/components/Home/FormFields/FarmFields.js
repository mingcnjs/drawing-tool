import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/styles'

import Button from '@material-ui/core/Button'
import { getFarmList } from '../../../actions/farm'
import Autocomplete from 'react-autocomplete'
import './styles.css'

class FarmFields extends Component {
  listRef = null

  constructor(props) {
    super(props)
    this.state = {
      modal: false,
      userId:this.props.auth.user.id,
      value:'',
      menuProps : {
        desktop: true,
        disableAutoFocus: true,
      },
      farmlist : [],
      selectedid : '',
      fdata:'',
      selecteddata:[]
    }
  }

  getData(key){
    let selectedobj = null;
    for (let islist = 0; islist < this.state.fdata.length; islist++)
        {
         if (this.state.fdata[islist]._id === key)
            {     
             selectedobj = this.state.fdata[islist];
             break;
            }          
        }   
    return selectedobj;
  }
  componentDidMount () {
    this.props.getFarmList(this.state.userId)
  }
  handleClickAdd = () => {
    this.props.history.push(`/detailfarmfield/${this.props.match.params.id}`)
  }
  handleClickModify = () => { 
    this.props.history.push(`/detailfarmfield/${this.props.match.params.id}/${this.state.selectedid}`)
  }

   
  componentWillReceiveProps(nextProps) {
   if (nextProps.farm.getFarmsList && nextProps.farm.getFarmsList.length > 0) { 
       this.setState({farmlist:[]});
       this.setState({fdata:nextProps.farm.getFarmsList});
       for (let ilist = 0; ilist < nextProps.farm.getFarmsList.length; ilist++)
           {
            let fr = {};
//            fr.name =  nextProps.farm.getFarmsList[ilist].farmName+" - " +nextProps.farm.getFarmsList[ilist].clientName+ " - "+ nextProps.farm.getFarmsList[ilist].fieldName;
            fr.name =  nextProps.farm.getFarmsList[ilist].farmName
            fr.client = nextProps.farm.getFarmsList[ilist].clientName
            fr.field = nextProps.farm.getFarmsList[ilist].fieldName;
            fr.key = nextProps.farm.getFarmsList[ilist]._id;
            this.state.farmlist.push(fr)
           } 
       let sdet = this.state.farmlist.sort(function(a,b){
         return a.name - b.name
       });
       this.setState({farmlist:sdet});
   }
  } 

  render() {
    const { classes } = this.props
    return (
      <div>
        <div className="right-section">
          <div id = "farmlist">
           {this.state.farmlist.length !== 0 ? (
            <Autocomplete
              value={this.state.value}
              wrapperStyle={{ position: 'relative', display: 'inline-block' }}
              items={this.state.farmlist}
              getItemValue={(item) => item.name}
              shouldItemRender={(item, value) => (item.name.toLowerCase().indexOf(value.toLowerCase())) > -1}
              onChange={(event, value) => {
                let founditem = false; 
                for (let ifarm = 0; ifarm < this.state.farmlist.length; ifarm++)
                    {
                     if (this.state.farmlist[ifarm].name.toUpperCase().indexOf(value.toUpperCase()) > -1)
                        {
                         founditem = true;
                         break;
                        }
                    }  
                 if (!founditem || value.length === 0)
                    {
                     setTimeout(()=>{
                        document.getElementById("modify").style.visibility = "hidden";
                     },400)
                    }                           
                 else
                    {
                     setTimeout(()=>{
                        document.getElementById("modify").style.visibility = "visible";
                     },400)
                    }    
                 this.setState({ value })
              } }
              onSelect={(item,value) => this.setState({"value":item,"selectedid":value.key,"selecteddata" : this.getData(value.key)})}
              renderMenu={(items, value) => (
                <div className="menu">
                  {value === '' ? (
                    <div className="item">Type of the name of a farm</div>
                  ) : this.state.loading ? (
                    <div className="item">Loading...</div>
                  ) : items.length === 0 ? (
                    <div className="item">No matches found</div>
                  ) : items
                  } 
                </div>
              )}
              renderItem={(item, isHighlighted) => (
                 <div style={{ background: isHighlighted ? 'lightgray' : 'lightblue', border: '1px solid',textAlign:'left'}}  key={item.key}>
                   <div><label style = {{color:'black',opacity:.4}}>Farm   : </label>{item.name}</div>
                   <div><label style = {{color:'black',opacity:.4}}>Client : </label>{item.client}</div>
                   <div><label style = {{color:'black',opacity:.4}}>Field  : </label>{item.field}</div>
                </div>
              )}
             />
             ) : (
              <div></div> 
             ) 
             }
             {this.state.value.length === 0 || this.state.farmlist.length === 0 ? (
                <Button id = 'modify' className={classes.btnStyle} style = {{visibility:'hidden',position:'absolute'}} onClick={this.handleClickModify}>
                   + Modify the Field
                </Button>
              ) : (
                <Button id = 'modify' className={classes.btnStyle} style = {{visibility:'visible',position:'absolute'}} onClick={this.handleClickModify}>
                   + Modify the Field
                </Button>
               )
              }             
          </div>
          <div>
             {this.state.value.length === 0 || this.state.farmlist === 0 ? (
               <Button id = 'add' className={classes.btnStyle} style = {{visibility:'visible'}} onClick={this.handleClickAdd}>
                  + Add a Field
               </Button>
             ) : (
               <Button id = 'add' className={classes.btnStyle} style = {{visibility:'hidden'}} onClick={this.handleClickAdd}>
                  + Add a Field
               </Button>
             )}
          </div>    
        </div>
        <div className="left-section"></div>
      </div>
    )
  }
}
const styles = {
  btnStyle: {
    color: '#2d7afa',
  },
}
const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
  farm:state.farm
})

const mapDispatchToProps = {
  getFarmList
}
export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(FarmFields))
