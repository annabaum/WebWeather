/***********************************
  LAT / LONG
***********************************/
var str = window.location.href; 
var n = str.split("="); 
var p = n[1].split("&");

//TODO: kein Runden
var vessel_lat = parseFloat(p[0]);
var vessel_long = parseFloat(n[2]);
var map_zoom = 8;
var api_key = 'd2e5ed215d62e633daa3f305ac037b49';
var map_units = 'metric'; // imperial °F, default K

/***********************************
  MAP SETUP
***********************************/
// Position_Lat="50406" Position_Long="-66456" ?!
var mymap = L.map('map-div', {zoomControl: false, center: [vessel_lat, vessel_long], zoom: map_zoom})

/***********************************
  LAYERS
***********************************/
/* BASE */
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    layername: 'base',
}).addTo(mymap);
// base URL:
// http://{s}.tile.openweathermap.org/map/{layername}/{z}/{x}/{y}.png

/* WIND */
L.tileLayer('http://{s}.tile.openweathermap.org/map/{layername}/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    layername: 'wind',
    opacity: 0.4
}).addTo(mymap);

/***********************************
  MARKERS
***********************************/
var vesselIcon = L.icon({
    iconUrl: 'img/vessel-icon.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [-3, -76],
    shadowUrl: 'img/vessel-icon-shadow.png',
    shadowSize: [20, 20],
    shadowAnchor: [8, 6] 
});
var marker = L.marker([vessel_lat, vessel_long], {icon: vesselIcon}).addTo(mymap);


/***********************************
  CONTROLS
***********************************/
L.control.scale({metric: true}).addTo(mymap);


/***********************************
  API CALL
***********************************/
var getJSON = function(url, data, successHandler, errorHandler) {
  var results = document.getElementById("results");
  
  var xhr = new XMLHttpRequest();

  xhr.open("GET", url);
  //xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Content-Length', JSON.stringify(data).length);
  xhr.onreadystatechange = function() {
    var status;
    var data;
    // https://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
    xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      if(xhr.responseText.indexOf("{") > -1){
              var data = JSON.parse(xhr.responseText);
            }
            else{
              var data = xhr.responseText;
            }
      //window.currentlist = data;
      successHandler && successHandler(data);
    }  else {
            status = xhr.status;
            errorHandler && errorHandler(status);
        }
    }
  };
  xhr.send(JSON.stringify(data));
};



function getWind() {
    var api_url = 'http://api.openweathermap.org/data/2.5/weather?lat='+ vessel_lat + 
                  '&lon=' + vessel_long + '&units=' + map_units + '&APPID=' + api_key;
    getJSON(api_url, null, 
        function(data){
            console.log('Success: ' + JSON.stringify(data));

            document.getElementById('td-lat').innerHTML = data.coord.lat;
            document.getElementById('td-lon').innerHTML = data.coord.lon;
            document.getElementById('td-temp').innerHTML = data.main.temp+'°C';
            document.getElementById('td-hum').innerHTML = data.main.humidity+'%';
            document.getElementById('td-wind-speed').innerHTML = data.wind.speed+'m/s';
            
            if (data.wind.deg != undefined){
                document.getElementById('td-wind-deg').innerHTML = data.wind.deg + '° ' + '<span><img id="wind-icon" src="img/wind-icon.png"></img></span>';
                document.getElementById('wind-icon').style.transform = 'rotate(' + data.wind.deg + 'deg)';
            } else {
                document.getElementById('td-wind-deg').innerHTML = 'N/A';
                document.getElementById('wind-icon').style.display = 'none';
            }
            
            document.getElementById('td-warn').innerHTML = data.weather[0].description;

            //TODO: Warnings

        },
        function(data){
            console.log('Error: ' + data);
        });
}

getWind();

