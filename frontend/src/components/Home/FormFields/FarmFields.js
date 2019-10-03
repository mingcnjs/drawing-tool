import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/styles'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import './styles.css'

class FarmFields extends Component {
  listRef = null

  constructor(props) {
    super(props)
    this.state = {
      modal: false,
    }
  }
  handleClick = () => {
    this.props.history.push(`/detailfarmfield/${this.props.match.params.id}`)
  }
  render() {
    const { classes } = this.props
    return (
      <div>
        <div className="right-section">
          <TextField />
          <TextField />
          <Button className={classes.btnStyle} onClick={this.handleClick}>
            + Add a Field
          </Button>
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
})

export default connect(mapStateToProps)(withStyles(styles)(FarmFields))
