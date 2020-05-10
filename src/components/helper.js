/**
* Generates number of random geolocation points given a center and a radius.
* @param  {Object} center A JS object with lat and lng attributes.
* @param  {number} radius Radius in meters.
* @param {number} count Number of points to generate.
* @return {array} Array of Objects with lat and lng attributes.
*/
export const generateRandomPoints = (center, radius, count) => {
  var points = [];
  for (var i = 0; i < count; i++) {
    points.push(generateRandomPoint(center, radius));
  }
  return points;
}


/**
* Generates number of random geolocation points given a center and a radius.
* Reference URL: http://goo.gl/KWcPE.
* @param  {Object} center A JS object with lat and lng attributes.
* @param  {number} radius Radius in meters.
* @return {Object} The generated random points as JS object with lat and lng attributes.
*/
export const generateRandomPoint = (center, radius) => {
  var x0 = center.lng;
  var y0 = center.lat;
  // Convert Radius from meters to degrees.
  var rd = radius / 111300;

  var u = Math.random();
  var v = Math.random();

  var w = rd * Math.sqrt(u);
  var t = 2 * Math.PI * v;
  var x = w * Math.cos(t);
  var y = w * Math.sin(t);

  var xp = x / Math.cos(y0);

  // Resulting point.
  return { 'lat': y + y0, 'lng': xp + x0 };
};


export const getInfoWindowString = cab => `
    <div>
      <div style="font-size: 16px;">
        ${cab.driverName}
      </div>
      <div style="font-size: 14px; color: grey;">
        ${cab.cabNumber}
      </div>
      <div style="font-size: 14px; color: ${cab.color};">
        <strong>Color: ${cab.color}</strong>
      </div>
      <div style="font-size: 14px; color: green;">
        ${cab.phoneNumber}
      </div>
      <div style="font-size: 14px; color: orange;">
        ${cab.distance ? cab.distance.text : ''}, ${cab.duration ? cab.duration.text : ''}
      </div>
    </div>`;

export const getDistanceMatrix = (service, data) => new Promise((resolve, reject) => {
  service.getDistanceMatrix(data, (response, status) => {
    if (status === 'OK') {
      return resolve(response)
    } else {
      return reject(response);
    }
  })
});

export const getDistance = (lat1, lon1, lat2, lon2, unit = 'K') => {
  if ((lat1 == lat2) && (lon1 == lon2)) {
    return 0;
  }
  else {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") { dist = dist * 1.609344 }
    if (unit == "N") { dist = dist * 0.8684 }
    return dist;
  }
}
