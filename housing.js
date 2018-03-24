// create a variable to store the houses 'database' in
var houses;

// use fetch to retrieve it, and report any errors that occur in the fetch operation
// once the houses have been successfully loaded and formatted as a JSON object
// using response.json(), run the initialize() function
fetch('houses.json').then(function(response) {
  if(response.ok) {
    response.json().then(function(json) {
      houses = json;
      initialize();
    });
  } else {
    console.log('Network request for houses.json failed with response ' + response.status + ': ' + response.statusText);
  }
});

// sets up the app logic, declares required variables, contains all the other functions
function initialize() {
  // grab the UI elements that we need to manipulate
  var category = document.querySelector('#category');
  var capacity = document.querySelector('input');
  var searchTerm = document.querySelector('#searchTerm');
  var yearTerm = document.querySelector('#yearTerm');
  var searchBtn = document.querySelector('button');
  var main = document.querySelector('main');

  // keep a record of what the last filters entered were
  var lastCategory = category.value;
  var lastCapacity = capacity.value;
  var lastSearch = searchTerm.value;

  // these contain the results of filtering by category, and search term
  // finalGroup will contain the houses that need to be displayed after
  // the searching has been done. Each contains an arrays of house objects
  var categoryGroup;
  var selectedGroup;
  var finalGroup;

  finalGroup = houses;
  updateDisplay();

  // Set both to equal an empty array, in time for searches to be run
  categoryGroup = [];
  selectedGroup = [];
  finalGroup = [];

  // when the search button is clicked, invoke selectCategory() to start
  // a search running to select the category of houses we want to display
  searchBtn.onclick = selectCategory;

  // listening for range change on slider
  var myListener = function(event) {
    var par = document.getElementById("rangeVal");
    par.innerHTML = "Capacity: " + event.target.value + "+";
  };

  onRangeChange(capacity, myListener);


  function selectCategory(e) {
    // Use preventDefault() to stop the form submitting
    e.preventDefault();

    // Set these back to empty arrays, to clear out the previous search
    categoryGroup = [];
    selectedGroup = [];
    finalGroup = [];

    console.log(capacity.value);

    // if the category and search term are the same as they were the last time a
    // search was run, the results will be the same, so there is no point running
    // it again — just return out of the function
    if(category.value === lastCategory && capacity.value === lastCapacity && searchTerm.value === lastSearch) {
      return;
    } else {
      // update the record of last category and search term
      lastCategory = category.value;
      lastCapacity = capacity.value;
      lastSearch = searchTerm.value;
      // In this case we want to select all houses, then filter them by the search
      // term, so we just set categoryGroup to the entire JSON object, then run selectHouses()
      if(category.value === 'All') {
        categoryGroup = houses;
        selectHouses();
      // If a specific category is chosen, we need to filter out the houses not in that
      // category, then put the remaining houses inside categoryGroup, before running
      // selectHouses()
      } else {
        // the values in the <option> elements are uppercase, whereas the categories
        // store in the JSON (under "type") are lowercase. We therefore need to convert
        // to lower case before we do a comparison
        var lowerCaseArea = category.value;
        for(var i = 0; i < houses.length ; i++) {
          // If a house's type property is the same as the chosen category, we want to
          // dispay it, so we push it onto the categoryGroup array
          if(houses[i].area === lowerCaseArea) {
            categoryGroup.push(houses[i]);
          }
        }


        // Run selectHouses() after the filtering has bene done
        selectHouses();
      }
    }
  }

  // selectHouses() Takes the group of houses selected by selectCategory(), and further
  // filters them by the entered search term (if one has been entered)
  function selectHouses() {
    // If no search term has been entered, just make the finalGroup array equal to the categoryGroup
    // array — we don't want to filter the houses further — then run updateDisplay().
    if(searchTerm.value === '') {
      selectedGroup = categoryGroup;
      selectCapacity();
    } else {
      // Make sure the search term is converted to lower case before comparison. We've kept the
      // house names all lower case to keep things simple
      var lowerCaseSearchTerm = searchTerm.value.toLowerCase();
      // For each house in categoryGroup, see if the search term is contained inside the following
      // attributes: name, year, 
      // (if the indexOf() result doesn't return -1, it means it is) — if it is, then push the house
      // onto the finalGroup array
      for(var i = 0; i < categoryGroup.length ; i++) {
        if(categoryGroup[i].name.toLowerCase().indexOf(lowerCaseSearchTerm) !== -1) {
          selectedGroup.push(categoryGroup[i]);
        } else if(categoryGroup[i].year_built.toString().indexOf(lowerCaseSearchTerm) !== -1) {
          selectedGroup.push(categoryGroup[i]);
        } else if(categoryGroup[i].year_renovated.toString().indexOf(lowerCaseSearchTerm) !== -1) {
          selectedGroup.push(categoryGroup[i]);
        }
      }

      // run selectCapacity() for a third layer of filtering by house capacity
      selectCapacity();
    }

  }

   function selectCapacity() {

    // every house has at least 0 capacity so everything is selected
    if(capacity.value === 0) {
      finalGroup = selectedGroup;
      updateDisplay();
    } 

    // find all houses that have a capacity >= value selected
    else {
      for(var i = 0; i < selectedGroup.length ; i++) {
        if(selectedGroup[i].capacity >= capacity.value) {
          finalGroup.push(selectedGroup[i]);
        }
      }

      // run updateDisplay() after this round of sorting has been done
      updateDisplay();
    }
  }

  // start the process of updating the display with the new set of houses
  function updateDisplay() {
    // remove the previous contents of the <main> element
    while (main.firstChild) {
      main.removeChild(main.firstChild);
    }

    // if no houses match the search term, display a "No results to display" message
    if(finalGroup.length === 0) {
      var para = document.createElement('p');
      para.textContent = 'No results to display!';
      main.appendChild(para);
    // for each house we want to display, pass its house object to fetchBlob()
    } else {
      for(var i = 0; i < finalGroup.length; i++) {
        fetchBlob(finalGroup[i]);
      }
    }
  }

  // fetchBlob uses fetch to retrieve the image for that house, and then sends the
  // resulting image display URL and house object on to showhouse() to finally
  // display it
  function fetchBlob(house) {
    // construct the URL path to the image file from the house.image property
    var url = 'images/' + house.image;
    // Use fetch to fetch the image, and convert the resulting response to a blob
    // Again, if any errors occur we report them in the console.
    fetch(url).then(function(response) {
      if(response.ok) {
        response.blob().then(function(blob) {
          // Convert the blob to an object URL — this is basically an temporary internal URL
          // that points to an object stored inside the browser
          objectURL = URL.createObjectURL(blob);
          // invoke showhouse
          showHouse(objectURL, house);
        });
      } else {
        console.log('Network request for "' + house.name + '" image failed with response ' + response.status + ': ' + response.statusText);
      }
    });
  }

  // Display a house inside the <main> element
  function showHouse(objectURL, house) {
    // create <section>, <div>, <h2>, <p>, and <img> elements
    var section = document.createElement('section');
    var overlay = document.createElement('div');
    var text = document.createElement('div');
    var heading = document.createElement('h2');
    var para = document.createElement('p');
    var image = document.createElement('img');

    // check if house is accessible and has elevator
    // if so, it's given respective icons that indicate so
    if (house.accessible == "yes") {
      var img = document.createElement('img');
      img.setAttribute('src', 'icons/accessible.svg');
      img.setAttribute('class', "accessible");
      overlay.appendChild(img);
    }

    if (house.elevator == "yes") {
      var img = document.createElement('img');
      img.setAttribute('src', 'icons/elevator.png');
      img.setAttribute('class', "elevator");
      overlay.appendChild(img);
    }

    // set classes
    overlay.setAttribute("class", "overlay");
    text.setAttribute("class", "text");

    // Give the <h2> textContent equal to the house "name" property, but with the first character
    // replaced with the uppercase version of the first character
    heading.textContent = house.name.replace(house.name.charAt(0), house.name.charAt(0).toUpperCase());

    // Give the <p> textContent equal to the all the various house properties, plus link to floor plans
    para.innerHTML = house.area + "<br>" + "Built: " + house.year_built + ", Renovated: " + 
      house.year_renovated + "<br>capacity: " + house.capacity + ", singles: " + house.singles +
      "<br>doubles: " + house.doubles + ", triples: " + house.triples + "<br> Num sharing bathroom: " +
      house.num_sharing_bathrm + "<br><a href=" + house.plan + " target=\"blank\">floor plan</a>";

    // Set the src of the <img> element to the ObjectURL, and the alt to the house "name" property
    image.src = objectURL;
    image.alt = house.name;

    // append the elements to the DOM as appropriate, to add the house to the UI
    main.appendChild(section);
    section.appendChild(image);
    section.appendChild(overlay);
    overlay.appendChild(text);
    text.appendChild(heading);
    text.appendChild(para);
  }
}

// function for "change" event when capacity is changed:
function onRangeChange(rangeInputElmt, listener) {

  var inputEvtHasNeverFired = true;

  var rangeValue = {current: undefined, mostRecent: undefined};
  
  rangeInputElmt.addEventListener("input", function(evt) {
    inputEvtHasNeverFired = false;
    rangeValue.current = evt.target.value;
    if (rangeValue.current !== rangeValue.mostRecent) {
      listener(evt);
    }
    rangeValue.mostRecent = rangeValue.current;
  });

  rangeInputElmt.addEventListener("change", function(evt) {
    if (inputEvtHasNeverFired) {
      listener(evt);
    }
  }); 

}

