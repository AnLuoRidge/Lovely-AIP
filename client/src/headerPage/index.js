import React, { Component } from 'react';
import { Icon } from 'react-icons-kit';
import { ic_account_circle } from 'react-icons-kit/md/ic_account_circle';
import { ic_search } from 'react-icons-kit/md/ic_search';
import Axios from 'axios';
import Logo from '../Img/logo.png';
import * as style from './headerPageCss';
import Cart from './badgeIcon';
import SearchInput from './searchIcon';
import NavigationBar from './navigationBar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { connect } from 'react-redux';
import { loginUser, logoutUser } from '../account/actions/authActions';
import { Link, Redirect } from 'react-router-dom';

function MenuItems(props) {
	const handleClose = props.closeHandle;
	if (props.isAuthenticated) {
		return (
			<span>
			{/* <MenuItem onClick={handleClose}><Redirect to={"/kk"}/>My account</MenuItem> */}
			<MenuItem onClick={handleClose}><a href="/account">My account</a></MenuItem>

			{/* <MenuItem onClick={handleClose}><Link to={"/cc"}>Log out</Link></MenuItem> */}
			<MenuItem onClick={handleClose}>
			<div onClick={props.logoutUser}>Log out</div>
			</MenuItem>
			</span>
		);
	} else {
		return (
			<span>
			<MenuItem onClick={handleClose}>
			<a href="/login">Sign in</a>
			</MenuItem>
			<MenuItem onClick={handleClose}>
			<a href="/register">New here?</a>
			</MenuItem>
			</span>
		);
	}
}

class headerPageIndex extends Component {
	constructor(props) {
		super(props);
		this.state = {
			categories: [],
			anchorEl: null,
			cartNumber: 0,
		};
	}


	componentDidMount() {
		const requestURL = `http://localhost:5000/api/cart`;

		Axios({
			method: 'get',
			url: requestURL,
		}).then((response) => {
			this.setState({ cartNumber: response.data.length });
		}).catch((error) => {
			console.log(error);
		});
	}	

	handleClick = event => {
		this.setState({ anchorEl: event.currentTarget });
	  };
	
	handleClose = () => {
		this.setState({ anchorEl: null });
	  };

	render() {
		const { anchorEl } = this.state;
		const { 
			background, 
			containerDiv, 
			logoPart,
			iconLogo,
			searchIcon,
			rightIcon,
			avatarStyle
	 } = style;

		return (
			<div style={background}>
				<div style={containerDiv}>
					<div style={logoPart}>
						<img src={Logo} style={iconLogo} />
						<div style={searchIcon}>
							<SearchInput/>
							<Icon icon={ic_search} size={24} style={{ marginBottom: '8px' }} />
						</div>
						<div style={rightIcon}>
							<div style={avatarStyle} 
							onClick={this.handleClick}
							// onMouseOver={this.handleClick}
							// onMouseOut={this.handleClose}
							><Icon icon={ic_account_circle} size={24} />
							</div>
							<Menu
								id="simple-menu"
								anchorEl={anchorEl}
								open={Boolean(anchorEl)}
								onClose={this.handleClose}
							>
								<MenuItems 
								isAuthenticated={this.props.auth.isAuthenticated} 
								closeHandle={this.handleClose} 
								logoutUser={this.props.logoutUser}
								/>
							</Menu>
							<Cart/>
						</div>
					</div>
				</div>
				<NavigationBar/>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	auth: state.auth,
  })

export default connect(mapStateToProps, { loginUser, logoutUser })(headerPageIndex);

