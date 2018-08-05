import { withStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';import React from 'react';
import PropTypes from 'prop-types';
import white from '@material-ui/core/colors';
import FormControl from '@material-ui/core/FormControl';
import purple from '@material-ui/core/colors/purple';
const styles = theme => ({
    margin: {
        margin: theme.spacing.unit,
      },
      cssLabel: {
        '&$cssFocused': {
          color: '#FFFFFF',
        },
      },
      cssFocused: {},
      cssUnderline: {
        '&:after': {
          borderBottomColor: '#FFFFFF',
        },
      },
});

class TextFields extends React.Component {
  
    handleChange = name => event => {
      this.setState({
        [name]: event.target.value,
      });
    };
  
    render() {
      const { classes } = this.props;
  
        return (
            <FormControl className={classes.margin}>
            <InputLabel
                FormLabelClasses={{
                root: classes.cssLabel,
                focused: classes.cssFocused,
                }}
                htmlFor="custom-css-input"
            >
            Search
            </InputLabel>
            <Input
                classes={{
                underline: classes.cssUnderline,
                }}
                id="custom-css-input"
            />
            </FormControl>
      );
    }
  }
  
  TextFields.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
  export default withStyles(styles)(TextFields);