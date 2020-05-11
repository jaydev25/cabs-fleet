import React from 'react';
import { GoogleApiWrapper, InfoWindow, Map, Marker } from 'google-maps-react';
import styled from 'styled-components';
import { getInfoWindowString, getDistanceMatrix, getDistance } from './helper';
import axios from 'axios';
import _ from 'lodash';

const Wrapper = styled.main`
  width: 100vw;
  height: 100%;
`;

class GoogleMapsContainer extends React.Component {
    state = {
        center: {
            lat: 16.8524076,
            lng: 74.5814659
        },
        markers: [],
        cabs: [],
        assignedCab: null,
        assignedCabIndex: null,
        startAddress: '',
        destination: null,
        rideDistance: null,
        bookedCab: null,
        icon: null
    }
    constructor(props) {
        super(props);
        // binding this to event-handler functions
        this.onMarkerClick = this.onMarkerClick.bind(this);
        this.onMapClick = this.onMapClick.bind(this);
        this.setIconSize = this.setIconSize.bind(this);
    }
    onMarkerClick = (props, marker, e) => {
        this.refs['Inf' + marker.title].infowindow.open(props.map, marker);
    }
    onMapClick = async (mapProps, marker, event) => {
        let { cabs, markers } = this.state;
        if (this.state.markers.length > 1) {
            this.setState({
                markers: []
            });
        } else {
            markers.push({
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
                icon: this.state.markers.length === 0 ?
                    'http://maps.google.com/mapfiles/ms/icons/red-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            });
            const source = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
            };
            const service = new mapProps.google.maps.DistanceMatrixService;

            if (this.state.markers.length === 1) {
                const response = await getDistanceMatrix(service, {
                    origins: [source.lat + "," + source.lng], // technician locations
                    destinations: cabs.map((c) => {
                        return c.location.lat + ',' + c.location.lng;
                    }),
                    travelMode: 'DRIVING',
                    unitSystem: mapProps.google.maps.UnitSystem.METRIC,
                    avoidHighways: false,
                    avoidTolls: false
                });
                // cabs = await cabs.forEach(async (cab, index) => {

                const dests = response.rows && response.rows[0] && response.rows[0].elements;
                const startAddress = response.originAddresses[0];
                var lowest = Number.POSITIVE_INFINITY;
                var highest = Number.NEGATIVE_INFINITY;
                var tmp;
                var lowestIndex;

                if (dests) {
                    for (let i = dests.length - 1; i >= 0; i--) {
                        tmp = dests[i].distance.value;
                        if (tmp < lowest) {
                            lowest = tmp;
                            lowestIndex = i;
                        }
                        if (tmp > highest) {
                            highest = tmp;
                        }
                        cabs[i].distance = dests[i];
                        cabs[i].sourceAddress = startAddress;
                    }
                }

                const avlCab = cabs[lowestIndex];

                this.refs['Inf' + avlCab.id].infowindow.content = getInfoWindowString(avlCab);
                this.refs['Inf' + avlCab.id].infowindow.open(mapProps.google.map, this.refs[avlCab.id].marker);
                // infowindow.open(map, marker);
                this.setState({
                    startAddress: startAddress
                });
                this.props.onChangeSource(avlCab, source);
            } else {
                const response = await getDistanceMatrix(service, {
                    origins: [markers[0].lat + "," + markers[0].lng], // technician locations
                    destinations: [markers[1].lat + "," + markers[1].lng],
                    travelMode: 'DRIVING',
                    unitSystem: mapProps.google.maps.UnitSystem.METRIC,
                    avoidHighways: false,
                    avoidTolls: false
                });
                // cabs = await cabs.forEach(async (cab, index) => {
                const dest = response.rows && response.rows[0] && response.rows[0].elements[0];
                const destinationAddress = response.destinationAddresses[0];
                this.props.onChangeDestination(destinationAddress, dest);
                this.setState({
                    destination: {
                        destinationAddress,
                        stats: dest
                    },
                    rideDistance: dest.distance && dest.distance.value
                })
            }
            this.setState({
                assignedCabIndex: lowestIndex,
                assignedCab: cabs[lowestIndex],
                markers: markers,
                cabs: cabs,
            });
        }
    }
    componentWillReceiveProps(props) {
        const cabs = props.cabs;
        cabs.forEach((cab) => {
            cab.icon = this.state.icon;
        });
        if (props.cabs) {
            this.setState({
                cabs: props.cabs,
            });
        }
        if (props.bookedCab) {
            this.setState({
                bookedCab: props.bookedCab,
            });
        }

    }
    removeMarkers() {
        this.setState({ markers: [] });
    }

    handleApiLoaded = async (mapProps, map) => {
        const { google } = mapProps;
        const icon = {
            url: "cab.png", // url
            scaledSize: new google.maps.Size(20, 20), // scaled size
            origin: new google.maps.Point(0, 0), // origin
            anchor: new google.maps.Point(0, 0),
            scaeSiazeFunc: new google.maps.Size // function to sacle size
        };
        console.log('................................', new google.maps.Size(20, 20));
        
        const cabs = this.props.cabs;
        cabs.forEach((cab) => {
            cab.icon = icon;
        });
        this.setState({
            cabs: cabs,
            icon: icon
        });
    }

    setIconSize () {
        return this.state.icon.scaeSiazeFunc(10,10);
    }

    render() {
        const style = {
            width: '100vw',
            height: '100%',
        }
        return (
            <Wrapper>
                <Map
                    item
                    ref="map"
                    xs={12}
                    style={style}
                    google={this.props.google}
                    onClick={this.onMapClick}
                    zoom={14}
                    initialCenter={this.state.center}
                    center={this.state.center}
                    onReady={this.handleApiLoaded}

                >
                    {this.state.markers.map((marker, index) => {
                        return (
                            <Marker
                                key={'M' + index}
                                // onClick={this.onMarkerClick}
                                ref={'M' + index}
                                title={'Changing Colors Garage'}
                                position={marker}
                                name={'Changing Colors Garage'}
                                options={{ icon: `${marker.icon}` }}
                            />
                        );
                    })}
                    {this.state.cabs.map((cab, index) => {
                        return (
                            <Marker
                                key={cab.id}
                                onClick={this.onMarkerClick}
                                ref={cab.id}
                                title={cab.id}
                                position={cab.location}
                                name={'Changing Colors Garage'}
                                options={{ icon: cab.icon }}
                            />
                        );
                    })}
                    {

                        this.state.cabs.map((cab, index) => {
                            return (
                                <InfoWindow
                                    key={'Inf' + cab.id}
                                    ref={'Inf' + cab.id}
                                    // marker={this.refs[cab.id].marker}
                                    // visible={this.state.showingInfoWindow}
                                    content={getInfoWindowString(cab)}
                                >
                                    Test
                                </InfoWindow>
                            );
                        })

                    }
                    {
                        this.state.bookedCab ?
                            <Marker
                                key={this.state.bookedCab.id}
                                onClick={this.state.onMarkerClick}
                                ref={this.state.bookedCab.id}
                                title={this.state.bookedCab.id}
                                position={this.state.bookedCab.location}
                                name={'Changing Colors Garage'}
                                options={{
                                    icon: {
                                        url: "red_cab.png",
                                        scaledSize: {width: 17, height: 17},
                                        origin: this.state.bookedCab.origin,
                                        anchor: this.state.bookedCab.anchor
                                    }
                                }}
                            /> : ''
                    }
                </Map>
            </Wrapper>
        );
    }
}
export default GoogleApiWrapper({
    apiKey: (process.env.REACT_APP_MAP_KEY)
})(GoogleMapsContainer)