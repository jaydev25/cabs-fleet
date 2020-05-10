import React from 'react';

import { Link } from 'react-router-dom';
import styled from 'styled-components';
import GoogleMapsContainer from './components/Map';
import { Component } from 'react/cjs/react.production.min';
import axios from 'axios';
import ToggleButton from 'react-toggle-button'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: #fefefe;
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  width: 80%;
  padding: 15px;
  border: 1px solid #d8d8d8;
  list-style: none;
  text-align: left;
`;

const ListItem = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80vw%
  background: #fff;
  border-bottom: 1px solid #7f7f7f;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }
`;

const StyledLink = styled(Link)`
  width: 100%;
  padding: 15px 15px 15px 0;
  color: #000000;
  text-decoration: none;
  text-align: center;
`;

const defaultPath = process.env.REACT_APP_BASE_PATH;

class Home extends Component {
  state = {
    myLoc: {},
    cab: {},
    cabs: {},
    sourceAddress: '',
    destinationAddress: '',
    distance: null,
    pinkCabsOnly: false
  };
  constructor(props) {
    super(props);

    this.changeMyLocation = this.changeMyLocation.bind(this);
    this.onChangeSource = this.onChangeSource.bind(this);
    this.onChangeDestination = this.onChangeDestination.bind(this);
    this.book = this.book.bind(this);
    this.reset = this.reset.bind(this);

    // if (navigator.geolocation) {

    //   navigator.geolocation.getCurrentPosition((position) => {
    //     this.setState({ myLoc: [position.coords.latitude, position.coords.longitude] });
    //   });
    // }

    this.setState({ myLoc: [16.8524076, 74.5814659] });

    axios.get(`http://localhost:9002/cabs`).then((res) => {
      this.setState({
        cabs: this.state.pinkCabsOnly ? res.data.cabs.filter((cab) => {
          return cab.color === 'Pink';
        }) : res.data.cabs,
      });
    });
  }

  changeMyLocation() {
    this.setState({ myLoc: [16.8524076, 74.5814659] });
  }
  onChangeSource(cab, source) {
    this.setState({
      cab: cab,
      sourceAddress: cab.sourceAddress
    });
  }
  onChangeDestination(destinationAddress, distance) {
    this.setState({
      destinationAddress: destinationAddress,
      distance: distance
    });
  }
  book() {
    if (this.state.sourceAddress && this.state.destinationAddress) {
      axios.post(`http://localhost:9002/cab/book/${this.state.cab.id}`).then((res) => {
        if (res.data.success) {
          alert('Booked!!!');
        } else {
          alert('Cab Already Booked, Book Another Cab');
        }
        this.setState({
          cabs: this.state.pinkCabsOnly ? res.data.cabs.filter((cab) => {
            return cab.color === 'Pink';
          }) : res.data.cabs,
        });
      });
    }
  }
  reset() {
    axios.get(`http://localhost:9002/cabs/reset`).then((res) => {
      if (res.data.success) {
        this.setState({
          myLoc: {},
          cab: {},
          cabs: this.state.pinkCabsOnly ? res.data.cabs.filter((cab) => {
            return cab.color === 'Pink';
          }) : res.data.cabs,
          sourceAddress: '',
          destinationAddress: '',
          distance: null
        });
      }
    });
  }

  componentWillUnmount() {

  }

  render() {
    return (
      <Wrapper>
        Click on the map to set your current location and destination. Map will show you your nearest Cab info.
        Click on Book to book the nearest cab. <button onClick={this.reset}>Reset All Cabs</button>
        <List>
          <ListItem>
            <strong>From:</strong> {this.state.sourceAddress}
          </ListItem>
          <ListItem>
            <strong>To:</strong> {this.state.destinationAddress}
          </ListItem>
          <h4>Ride Details</h4>
          <ListItem>
            {`Driver Name: ${this.state.cab && this.state.cab.driverName ? this.state.cab.driverName : ''}`} |
            {`Vehicle Number: ${this.state.cab && this.state.cab.cabNumber ? this.state.cab.cabNumber : ''}`} |
            {`Phone Number: ${this.state.cab && this.state.cab.phoneNumber ? this.state.cab.phoneNumber : ''}`}
          </ListItem>
          <ListItem>
            {`Distance: ${this.state.distance ? this.state.distance.distance.text : ''}`} |
            {`Duration: ${this.state.distance ? this.state.distance.duration.text : ''}`} |
            {`Fair: ${this.state.distance ? this.state.distance.distance.value / 100 * 10 : ''}`}
          </ListItem>
        </List>
        <button onClick={this.book}>Book Now</button>
        <ToggleButton
          inactiveLabel={'Any'}
          activeLabel={'Pink'}
          value={this.state.pinkCabsOnly || false}
          colors={{
            active: {
              base: 'rgb(242, 62, 247)',
            },
          }}
          onToggle={(value) => {
            axios.get(`http://localhost:9002/cabs`).then((res) => {
              this.setState({
                cabs: !value ? res.data.cabs.filter((cab) => {
                  return cab.color === 'Pink';
                }) : res.data.cabs,
                pinkCabsOnly: !value
              });
            });
          }} />
        <GoogleMapsContainer myLoc={this.state.myLoc} onChangeSource={(cab, source) => this.onChangeSource(cab, source)}
          onChangeDestination={(destinationAddress, distance) => this.onChangeDestination(destinationAddress, distance)}
          cabs={this.state.cabs} />
      </Wrapper>
    )
  }
}

export default Home;
