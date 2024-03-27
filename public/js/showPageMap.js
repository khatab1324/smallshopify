//this map for show page
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v12", // style URL
  center: campground.geometry.coordinates, // starting position [lng, lat]
  zoom: 10, // starting zoom
});

// add marker (pin) in our map
new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    //it like info show to user when he click on marker
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h3>${campground.title}</h3><p>${campground.location}</p>`
    )
  )
  .addTo(map);
map.addControl(new mapboxgl.NavigationControl());
