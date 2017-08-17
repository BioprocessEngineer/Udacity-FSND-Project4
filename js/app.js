var ViewModel = function() {
    var self = this;

    //Create courtlist to import data from location variable
    self.courtList = ko.observableArray([]);
    locations.forEach(function(courtItem){
        self.courtList.push(new court(courtItem));});

    //Intialize variables for city filtering function
    self.availableCities = ko.observableArray(['All', 'GTA', 'Outside-GTA']);
    self.selectedCity = ko.observable("All");


    //Connect list event with marker event
    self.listClick = function(filteredCourts){
        var ci = filteredCourts.ID;
        google.maps.event.trigger(markers[ci],'click');
    };

    self.listMouseover = function(filteredCourts){
        var ci = filteredCourts.ID;
        google.maps.event.trigger(markers[ci],'mouseover');
    };

    self.listMouseout = function(filteredCourts){
        var ci = filteredCourts.ID;
        google.maps.event.trigger(markers[ci],'mouseout');
    };

    //Filter cities where courts are located
    self.filteredCourts = ko.computed(function(){
        city = self.selectedCity();

        if (city === "All"){
        filteredLocations = locations;
        filterMarker();
        return self.courtList();
        }
        else {
        var tempList = self.courtList.slice();
        var tempLocations = locations.slice();
        filteredLocations = [];
        filteredLocations = tempLocations.filter(function(crt){
            return crt.city === city;
            });
        filterMarker();
        return tempList.filter(function(crt){
            return crt.city === city;
            });
        }
    });
};

// create court object
var court = function(data) {
    this.title = data.title,
    this.location = data.location,
    this.city = data.city,
    this.ID = data.ID;
};

//Global objects
var map;
var markers = [];
var city;
var filteredLocations = [];
var locations = [
{title: 'Admiral Park Basketball Court', location: {lat: 43.437292, lng: -80.507840}, city: 'GTA', ID: '0'},
{title: 'Ambleside Park Basketball Court', location: {lat: 43.0154219, lng: -81.2940176}, city: 'Outside-GTA', ID: '1'},
{title: 'Alton Parker Park Basketball Court', location: {lat: 42.312723, lng: -83.028019}, city: 'Outside-GTA', ID: '2'},
{title: 'Brock Park Basketball Court', location: {lat: 44.381632, lng: -79.696755}, city: 'Outside-GTA', ID: '3'},
{title: 'David Crombie Park Basketball Court', location: {lat: 43.648182, lng: -79.370273}, city: 'GTA', ID: '4'},
{title: 'Bennetto Park Basketball Court', location: {lat: 43.269776, lng: -79.861550}, city: 'Outside-GTA', ID: '5'},
];

function initMap() {
    //Initialise map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 43.425584, lng: -80.433527},
        zoom: 10,
        mapTypeControl: false
    });

    var infowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    //Import location data into markers array and intialize markers

    function showMarker(markerLocation){
        for (var i = 0; i < filteredLocations.length; i++) {
            var position = filteredLocations[i].location;
            var title = filteredLocations[i].title;
            var city = filteredLocations[i].city;
            // let num = i;
            var marker = new google.maps.Marker({
                map: map,
                icon: 'img/bball_s.png',
                position: position,
                title: title,
                animation: '',
                id: i,
                city: city,
            });
            markers.push(marker);
            bounds.extend(marker.position);

            //Add event listeners to markers
            marker.addListener('click', mclick);
            marker.addListener('mouseover', mover);
            marker.addListener('mouseout', mout);
        }
        map.fitBounds(bounds);
    }
    showMarker(filteredLocations);
    google.maps.event.addDomListener(document.getElementById('city'), 'change', windowClose);

    function windowClose () {
        infowindow.close();
    }
  
    function mover () {
        var marker = this;
        this.setIcon('img/bball_sf.png');
    }

    function mout () {
        var marker = this;
        if (infowindow.marker != this) {
        this.setIcon('img/bball_s.png');
            }
    }
 
    // Initialize info window and retrieve weather info for each court locaton using OpenWeatherMap API
    function mclick() {
        var marker = this;
        if (infowindow.marker != marker) {                
            infowindow.marker = marker;
            infowindow.setContent(null);
            this.setIcon('img/bball_sf.png');
            for (var i = 0; i < markers.length; i++) {
                if (markers[i] != this) {
                markers[i].setIcon('img/bball_s.png');}
                }
            var wurl = 'http://api.openweathermap.org/data/2.5/weather?lat=' + marker.position.lat() + '&lon=' + marker.position.lng() + '&APPID=5b37904a067f4ea5c74a6b365b07dbc4';
            $.getJSON(wurl, function(data) {
            var wcourt = data.weather[0].description;
            infowindow.setContent('<div id="mtitle">' + marker.title + '</div>' + '<div id = "wcourt">Current Condition: ' + wcourt + '</div>');
            })
            .fail(function(){
                alert("Error with OpenWeatherMap API");
            });                
            infowindow.open(map, marker);
            infowindow.addListener('closeclick', function(){
                infowindow.setContent(null);
            });
    }}
}


//Function to filter markers
function filterMarker () {
    hideListings();
    for (var i = 0; i < markers.length; i++) {
        if (markers[i].city === city) {
            markers[i].setVisible(true);
        } else if (city === "All") {
            markers[i].setVisible(true);
        }   
    }
}

//Function to hide markers
function hideListings () {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setVisible(false);
        markers[i].setIcon('img/bball_s.png');
    }
}

//Function to handle errors when loading googleMAP API
function mapAPI () {
    alert("Error with GoogleMap API");
}

ko.applyBindings(new ViewModel());
