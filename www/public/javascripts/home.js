// Assign handlers immediately after making the request,
// and remember the jqxhr object for this request
var user_id = 2;
var location_x = 48.831357;
var location_y = 2.284441;
var user_name = 'User';
var selected_tags = [];
var all_tags = [];
var selected_places = [];
// First request for the data
firstTimeFetchData(user_id, location_x, location_y);

function firstTimeFetchData(user_id, location_x, location_y) {
  var jqxhr = $.post("/", { user_id: user_id, x: location_x, y: location_y })
    .done(function (data) {
      // console.log('success with data: ', data);
      user_name = data.user_name;
      all_tags = data.all_tags;
      selected_tags = data.tags;
      update_main_content(user_name, all_tags, data.tags, data.places);
    })
    .fail(function (e) {
      console.error(e);
    })
}

function getPlaces(user_id, location_x, location_y, tags) {
  // console.log('tags:',tags);
  var jqxhr = $.post("/search", { user_id: user_id, x: location_x, y: location_y, tags: JSON.stringify(tags) })
    .done(function (data) {
      selected_tags = data.tags;
      update_main_content(user_name, all_tags, selected_tags, data.places, location_x, location_y);
    })
    .fail(function (e) {
      console.error(e);
    })
}

function update_main_content(user_name, all_tags, s_tags, places, location_x, location_y) {
  var mainContent = document.getElementById('main-content');
  mainContent.innerHTML = '';
  var newMainContent = create_new_content(user_name, all_tags, s_tags, places, location_x, location_y)
  mainContent.appendChild(newMainContent);
  update_start_button();
}

function create_new_content(user_name, all_tags, s_tags, places, location_x, location_y) {
  var newMainDOM = document.createElement('div');

  var headerDOM = create_header_DOM(user_name);
  // newMainDOM.appendChild(headerDOM);

  var tagsDOM = create_tags_DOM(all_tags, s_tags);
  newMainDOM.appendChild(tagsDOM);

  if(places){
    var placesDOM = create_list_place_DOM(places);
    newMainDOM.appendChild(placesDOM);
  }

  var startButton = create_start_button(location_x, location_y, places)
  newMainDOM.appendChild(startButton);

  return newMainDOM;
}

function create_header_DOM(user_name) {
  var newHeaderDOM = document.createElement('h2');
  newHeaderDOM.setAttribute('class', 'headerDOM');
  newHeaderDOM.innerHTML = 'Hi ' + user_name;
  return newHeaderDOM;
}

function create_tags_DOM(all_tags, s_tags) {
  var newAllTagDOM = document.createElement('div');
  newAllTagDOM.setAttribute('class', 'tagsDOM');
  all_tags.forEach(tag => {
    var newTagDOM = document.createElement('button');
    var tagClass = 'btn-default';
    if (s_tags.indexOf(tag) > -1) {
      tagClass = 'btn-success';
    }
    newTagDOM.setAttribute('class', 'btn-tag btn ' + tagClass);
    newTagDOM.innerHTML = tag;
    //TODO: Add action
    newTagDOM.addEventListener('click', function () {
      // console.log('s_tags',s_tags);
      tagClickHandler(tag, all_tags, s_tags);
    });
    newAllTagDOM.appendChild(newTagDOM);
  });
  return newAllTagDOM;
}

function tagClickHandler(tag, all_tags, new_tags) {
  var tag_index = new_tags.indexOf(tag);
  if (tag_index > -1) {
    new_tags.splice(tag_index, 1);
  } else {
    new_tags.push(tag);
  }
  // console.log('new_tags:',new_tags);
  getPlaces(user_id, location_x, location_y, new_tags);
}

function create_list_place_DOM(places) {
  var newPlacesDOM = document.createElement('div');
  newPlacesDOM.setAttribute('id', 'list-place-DOM');
  places.forEach(place => {
    var newPlaceDOM = create_place_DOM(place);
    newPlacesDOM.appendChild(newPlaceDOM);
  });
  return newPlacesDOM;
}

function create_place_DOM(place) {
  var mediaDOM = document.createElement('div');
  mediaDOM.setAttribute('class', 'media text-left placeDOM');

  var mediaDOMLeft = document.createElement('div');
  mediaDOMLeft.setAttribute('class', 'media-left');

  var mediaDOMObject = document.createElement('img');
  mediaDOMObject.setAttribute('class', 'media-object');
  mediaDOMObject.setAttribute('src', place['photos'][0]);

  mediaDOMLeft.appendChild(mediaDOMObject);

  var mediaDOMBody = document.createElement('div');
  mediaDOMBody.setAttribute('class', 'media-body');

  var mediaDOMHeading = document.createElement('h4');
  mediaDOMHeading.setAttribute('class', 'media-heading');
  mediaDOMHeading.innerHTML = place['name'];

  mediaDOMBody.appendChild(mediaDOMHeading);

  var mediaDOMDescription = document.createElement('p');
  // mediaDOMDescription.setAttribute('class','place-desc');
  mediaDOMDescription.innerHTML = shorten_description(place['description']);

  mediaDOMBody.appendChild(mediaDOMDescription);

  mediaDOM.appendChild(mediaDOMLeft);
  mediaDOM.appendChild(mediaDOMBody);
  //TODO: Update with style/action and more information
  // console.log('place-1:',place);
  mediaDOM.addEventListener('click', function () {
    // console.log('place-2:',place);
    var currentClassName = mediaDOM.getAttribute('class');
    if(currentClassName.indexOf('selected-place') > -1){
      mediaDOM.setAttribute('class','media text-left placeDOM');
      var place_index = selected_places.indexOf(place);
      selected_places.splice(place_index,1);
    }else{
      mediaDOM.setAttribute('class','media text-left placeDOM selected-place');
      selected_places.push(place);
    }
    update_start_button();
  })
  return mediaDOM;
}

function shorten_description(desc) {
  if (desc.length > 64) {
    return desc.substring(0, 64);
  }
  return desc;
}

function create_start_button(location_x, location_y, places) {
  // var start_url = '/route?x=' + location_x + '&y=' + location_y + '&target=';
  // places.forEach(place => {
  //   start_url += '[' + place['location']['x'] + ',' + place['location']['y'] + '],';
  // });
  var startButton = document.createElement('a');
  startButton.setAttribute('class', 'btn btn-lg btn-primary');
  startButton.setAttribute('id', 'startButton');
  // startButton.setAttribute('href', start_url);
  startButton.innerHTML = "Start";
  return startButton;
}

function update_start_button() {
  // console.log('selected_places: ', selected_places);
  var startButton = document.getElementById('startButton');
  var start_url = '/map?x=' + location_x + '&y=' + location_y + '&target=';
  selected_places.forEach(place => {
    start_url += '[' + place['location']['x'] + ',' + place['location']['y'] + '],';
  });
  startButton.setAttribute('href', start_url);
}

function show_place_detail(place_id) {
  var placeWindow = document.getElementById('placeWindow');
  if(placeWindow){
    placeWindow.setAttribute('src','/place?place_id='+place_id);
    document.getElementById('btnOpenPlaceView').click();
  }
}

// console.log('home.js has been loaded!');