var ViewModel = function() {
    var self = this;

    //Create courtlist to import data from location variable
    self.courtList = ko.observableArray([]);
    locations.forEach(function(courtItem){
        self.courtList.push(new court(courtItem));});

    //Intialize variables for city filtering function
    self.availableCities = ko.observableArray(['All', 'Kitchener', 'Cambridge']);
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
        return self.courtList();
        }

        else {
        var tempList = self.courtList.slice();
        var tempLocations = locations.slice();

        filteredLocations = [];
        filteredLocations = tempLocations.filter(function(crt){
            return crt.city === city;
            });

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

var locations = [
{title: 'Admiral Park Basketball Court', location: {lat: 43.437292, lng: -80.507840}, city: 'Kitchener', ID: '0'},
{title: 'Caryndale Park Basketball Court', location: {lat: 43.384687, lng: -80.451839}, city: 'Kitchener', ID: '1'},
{title: 'Doon Pioneer Park C.C. Basketball Court', location: {lat: 43.393900, lng: -80.436895}, city: 'Kitchener', ID: '2'},
{title: 'Guelph Park Basketball Court', location: {lat: 43.466636, lng: -80.483150}, city: 'Kitchener', ID: '3'},
{title: 'Weber Park Basketball Court', location: {lat: 43.458268, lng: -80.474419}, city: 'Kitchener', ID: '4'},
{title: 'Tremaine Park Basketball Court', location: {lat: 43.442125, lng: -80.410050}, city: 'Kitchener', ID: '5'},
{title: 'Brent Park Basketball Court', location: {lat: 43.393868, lng: -80.339230}, city: 'Cambridge', ID: '6'},
{title: 'Chirchill Park Basketball Court', location: {lat: 43.342612, lng: -80.303474}, city: 'Cambridge', ID: '7'},
{title: 'Gordon Chaplin Park Basketball Court', location: {lat: 43.374321, lng: -80.310987}, city: 'Cambridge', ID: '8'},
{title: 'Santa Maria Park Basketball Court', location: {lat: 43.347730, lng: -80.339230}, city: 'Cambridge', ID: '9'},
{title: 'Brent Park Basketball Court', location: {lat: 43.393868, lng: -80.282874}, city: 'Cambridge', ID: '10'}
];

var filteredLocations = [];



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

    google.maps.event.addDomListener(document.getElementById('city'), 'change', filterMarker);

    function filterMarker () {
        infowindow.close();
        hideListings();
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].city === city) {
                markers[i].setVisible(true);
            } else if (city === "All") {
                markers[i].setVisible(true);
            }   
        }
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
            this.setIcon('img/bball_sf.png');
            for (var i = 0; i < markers.length; i++) {
                if (markers[i] != this) {
                markers[i].setIcon('img/bball_s.png');}
                }
                
            infowindow.setContent('<div id="mtitle">' + marker.title + '</div>' + '<div id = "wcourt">Current Condition: </div>');
            infowindow.open(map, marker);
            infowindow.addListener('closeclick', function(){
                infowindow.setContent(null);
            });
            var wurl = 'http://api.openweathermap.org/data/2.5/weather?lat=' + marker.position.lat() + '&lon=' + marker.position.lng() + '&APPID=5b37904a067f4ea5c74a6b365b07dbc4';
            $.getJSON(wurl, function(data) {
            var wcourt;
            wcourt = data.weather[0].description;
            document.getElementById('wcourt').append(wcourt);
        });
    }}


   //Function to hide markers
    function hideListings () {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setVisible(false);
            markers[i].setIcon('img/bball_s.png');
        }
    }

}

ko.applyBindings(new ViewModel());
