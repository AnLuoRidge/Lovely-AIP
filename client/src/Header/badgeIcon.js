import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import { withStyles } from '@material-ui/core/styles';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import { Link } from 'react-router-dom';

const styles = theme => ({
	badge: {
		top: 1,
		right: -15,
		// The border color match the background color.
		border: `2px solid ${
			theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[900]
			}`,
	},
});

function CustomizedBadge(props) {
	const { classes } = props;

	return (
		<IconButton aria-label="Cart" component={Link} to={props.authed ? '/cart' : '/login'}>
			{
				props.quantity === 0 || !props.quantity ? (
					<ShoppingCartIcon style={{ color: 'white' }}/>
				) : (
					<Badge badgeContent={props.quantity} color="primary" classes={{ badge: classes.badge }}>
						<ShoppingCartIcon style={{ color: 'white' }}/>
					</Badge>
				)
			}
		</IconButton>
	);
}

CustomizedBadge.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CustomizedBadge);