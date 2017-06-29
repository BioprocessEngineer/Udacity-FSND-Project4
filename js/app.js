var ViewModel = function() {
    var self = this;

    //Create courtlist to import data from location variable
    self.courtList = ko.observableArray([]);

    locations.forEach(function(courtItem){
        self.courtList.push(new court(courtItem));});

    //Intialize variable for category
    self.selectedCategory = ko.observable("All");
    
    //Filter cities where courts are located
    self.filteredCourts = ko.computed(function(){
        var category = self.selectedCategory();
        if (category === "All"){
        return self.courtList();
        console.log("Passed");}
        else {
        var tempList = self.courtList.slice();
        return tempList.filter(function(crt){
            return crt.city === category;
            });};
    });
};

// create court object
var court = function(data) {
    this.title = data.title,
    this.location = data.location,
    this.city = data.city,
    this.ID = data.ID
};

var locations = [
{title: 'Admiral Park Basketball Court', location: {lat: 43.437292, lng: -80.507840}, city: 'K', ID: 'court#0'},
{title: 'Caryndale Park Basketball Court', location: {lat: 43.384687, lng: -80.451839}, city: 'K', ID: 'court#1'},
{title: 'Doon Pioneer Park C.C. Basketball Court', location: {lat: 43.393900, lng: -80.436895}, city: 'K', ID: 'court#2'},
{title: 'Guelph Park Basketball Court', location: {lat: 43.466636, lng: -80.483150}, city: 'K', ID: 'court#3'},
{title: 'Weber Park Basketball Court', location: {lat: 43.458268, lng: -80.474419}, city: 'K', ID: 'court#4'},
{title: 'Tremaine Park Basketball Court', location: {lat: 43.442125, lng: -80.410050}, city: 'K', ID: 'court#5'},
{title: 'Brent Park Basketball Court', location: {lat: 43.393868, lng: -80.339230}, city: 'C', ID: 'court#6'},
{title: 'Chirchill Park Basketball Court', location: {lat: 43.342612, lng: -80.303474}, city: 'C', ID: 'court#7'},
{title: 'Gordon Chaplin Park Basketball Court', location: {lat: 43.374321, lng: -80.310987}, city: 'C', ID: 'court#8'},
{title: 'Santa Maria Park Basketball Court', location: {lat: 43.347730, lng: -80.339230}, city: 'C', ID: 'court#9'},
{title: 'Brent Park Basketball Court', location: {lat: 43.393868, lng: -80.282874}, city: 'C', ID: 'court#10'}
];


//Global object: map and markers
var map;
var markers = [];

function initMap() {
    //Initial lise map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 43.425584, lng: -80.433527},
        zoom: 20,
        mapTypeControl: false
    });

    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    //Import location data into markers array and intialize markers
    for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].title;
        var city = locations[i].city;
        // let num = i;
        var marker = new google.maps.Marker({
            map: map,
            icon: 'img/bball_s.png',
            position: position,
            title: title,
            animation: '',
            id: i,
            city: city,
            zIndex: 0
        });

        markers.push(marker);
        bounds.extend(marker.position);
        //Add event listeners to markers
        marker.addListener('click', function(){
            markerAction(this, largeInfowindow);
             });

        marker.addListener('mouseover', function(){
            this.setIcon('img/bball_sf.png');
        });

        marker.addListener('mouseout', function(){
            this.setIcon('img/bball_s.png');
            this.setAnimation(null);
        });

        //Make connection between markers and list items.
        listMarker(marker);        
    }
    map.fitBounds(bounds);


    //Make connections between marker category and filter function
    google.maps.event.addDomListener(document.getElementById('C'), 'click', function(){
        hideListings();
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].city === 'C') {
            markers[i].setMap(map);
            listMarker(markers[i]);
            } else {markers[i].setMap(null)};
        }});

        google.maps.event.addDomListener(document.getElementById('K'), 'click', function(){
        hideListings();
        var bounds = new google.maps.LatLngBounds();
       for (var i = 0; i < markers.length; i++) {
            if (markers[i].city === 'K') {
            markers[i].setMap(map);
            listMarker(markers[i]);
        } else {markers[i].setMap(null)}; 
        }});

        google.maps.event.addDomListener(document.getElementById('All'), 'click', function(){
        hideListings();
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
            listMarker(markers[i]);
        }; 
        });
    
    //Initialize info window and retrieve weather info for each court locaton using OpenWeatherMap API
    function markerAction(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
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


    //Make connection between markers and listitems
    function listMarker(marker){
        var num = marker.id;
        google.maps.event.addDomListener(document.getElementById('court#' + num), 'click', function(){
        markerAction(marker, largeInfowindow);
            });
        google.maps.event.addDomListener(document.getElementById('court#' + num), 'mouseover', function(){
        marker.setIcon('img/bball_sf.png');
        marker.setAnimation(google.maps.Animation.BOUNCE);
        });

        google.maps.event.addDomListener(document.getElementById('court#' + num), 'mouseout', function(){
        marker.setIcon('img/bball_s.png');
        marker.setAnimation(null);
        });
    }

    //Function to hide markers
    function hideListings () {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }


}



ko.applyBindings(new ViewModel());




