// document.addEventListener("DOMContentLoaded", () => {
export function generateMap(parks){

    let currentState = "United States of America"

    document.addEventListener('submit', (event)=>{
        event.preventDefault();
        let state = document.getElementById("state_select").value;
        let statePath = document.getElementById(state);
        removeElementsByClass("parks");
        zoomToState(state);
    })

    document.getElementById("parks_ul").addEventListener("click", (event)=>
        {
            event.preventDefault();
            console.log(event.target.data)
            if (event.target.data){

                showParkPage(event.target.data)
            }
        }
    )

    let states_features = [];

    const idToStates = {
        1: "AL", 2: "AK", 3: "AR", 4: "AZ", 5: "AR", 6: "CA", 7: "CT", 8: "CO", 9: "CT", 10: "DE",
        11: "GA", 12: "FL", 13: "GA", 14: "IL", 15: "HI", 16: "ID", 17: "IL", 18: "IN", 19: "IA",
        20: "KS", 21: "MD", 22: "LA", 23: "ME", 24: "MD", 25: "MA", 26: "MI", 27: "MN", 28: "NE",
        29: "MO", 30: "MT", 31: "NE", 32: "NV", 33: "NH", 34: "NJ", 35: "NM", 36: "NY", 37: "NC",
        38: "ND", 39: "OH", 40: "OK", 41: "OR", 42: "PA", 43: "TN", 44: "RI", 45: "SC", 46: "SD",
        47: "TN", 48: "TX", 49: "WV", 50: "VT", 51: "VA", 53: "WA", 54: "WV", 55: "WI" , 56: "UT"  
    }

    console.log("HII")
    console.log()
    var margin = {
        // top: 10,
        // bottom: 10,
        // left: 10,
        // right: 10,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    }, width = parseInt(d3.select('.viz').style('width'))
        , width = width - margin.left - margin.right - 2*parseFloat(d3.select('.viz').style('padding'))
        , mapRatio = 0.5 // previously 0.5
        , height = width * mapRatio
        , active = d3.select(null);

    var svg = d3.select('.viz').append('svg')
        .attr('class', 'center-container')
        .attr('height', height + margin.top + margin.bottom)
        .attr('width', width + margin.left + margin.right);

    svg.append('rect')
        .attr('class', 'background center-container')
        .attr('height', height + margin.top + margin.bottom)
        .attr('width', width + margin.left + margin.right)
        .on('click', clicked);

    Promise.resolve(d3.json('https://gist.githubusercontent.com/mbostock/4090846/raw/us.json'))
        .then(ready);

    let projection = d3.geoAlbersUsa()
        .translate([width /2 , height / 2])
        .scale(width);

    var path = d3.geoPath()
        .projection(projection);

    var g = svg.append("g")
        .attr('class', 'center-container center-items us-state')
        .attr('transform', 'translate('+margin.left+','+margin.top+')')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)

    
    let header = d3.select('.viz').append('div').attr('class','location-viewer')
        .append('div')
        .attr('class','location')
        .html(`You are currently viewing: ${currentState}`)

    function ready(us) {

        g.append("g")
            .attr("id", "counties")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
            .attr("d", path)
            .attr("class", "county-boundary")
            .on("click", reset);

        g.append("g")
            .attr("id", "states")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .attr("class", "state")
            .attr("id", (d)=>{
                // console.log(d);
                if (idToStates[d.id]){
                    // console.log(d.id);
                    // console.log(idToStates[d.id])
                    states_features.push(d)
                    return idToStates[d.id];
                } else {
                    return `${d.id}`
                }
            })
            .on("click", clicked);

        g.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
            .attr("id", "state-borders")
            .attr("d", path);
        
        g.append("g")
            // .attr("id","parks")
            .selectAll("path")
            .data(parks)
            .enter().append("circle")
            .attr("id", function(d){
                return d.id;
            })
            .attr("class", "parks")
            // .attr("id", d.id)
            .attr("r", 2)
            .attr("cx", function(d){
                // console.log(d.id)
                let coords = projection([parseFloat(d.longitude),parseFloat(d.latitude)])
                if (coords){
                    return coords[0];
                } else {
                    return null;
                }
            })
            .attr("cy", function(d){
                let coords = projection([parseFloat(d.longitude),parseFloat(d.latitude)])
                if (coords){
                    return coords[1];
                } else {
                    return null;
                }
            })
    }

    function clicked(d) {
        // console.log(d)
        currentState = idToStates[d.id]
        d3.select('.location').html(`You are currently viewing: ${currentState}`)

        if (d3.select('.background').node() === this) return reset();

        if (active.node() === this) return reset();

        active.classed("active", false);
        active = d3.select(this).classed("active", true);

        var bounds = path.bounds(d),
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = .9 / Math.max(dx / width, dy / height),
            translate = [width / 2 - scale * x, height / 2 - scale * y];

        g.transition()
            .duration(750)
            .style("stroke-width", 1.5 / scale + "px")
            .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
    }

    function zoomToState(state){
        // console.log(state)
        for(let i =1; i < 60; i++){
            if (idToStates[i] === state){
                // console.log(i)
                clicked(states_features[i-1])
                drawParksByState(idToStates[i])

            }
        }
    }

    function showParkPage(park_id) {

        // Declares var showPark to show selected park 
        let showPark;

        // Search for park from parks
        for(let i = 0; i < 467; i++){
            if (parks[i].id === park_id){
                showPark = parks[i]
            }
        }

        

        // Adds park name
        d3.select("#park-name").html(`${showPark.fullName}`)
        d3.select(".description p").html(`${showPark.description}`)

        // Flickr_URL
        let flickrURL = 
            `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=e19ad1e0c6bf594b6f00d76788a2ad44&format=json&nojsoncallback=1&text=${showPark.fullName}&extras=url_o`
        

        fetch(flickrURL)
            .then(res => res.json())
            .then(images => images.photos.photo)
            .then((images) => {
                let lightbox = document.querySelector(".small-images")
                removeAllChildNodes("small-images")
                for(let i = 0; i < 10; i++){
                    let image = document.createElement("img")
                    console.log(images[i].url_o)
                    image.src = `${images[i].url_o}`;
                    console.log(image)
                    lightbox.appendChild(image)
                }
                console.log(lightbox)
            }).then(()=>{
                // Clears out search-bar and renders parks showpage
                d3.select(".parks-sidebar-search").style('display','none')
                d3.select(".park-showpage").style('display','block')
            })

    }

    function removeElementsByClass(className){
        const elements = document.getElementsByClassName(className);
        while(elements.length > 0){
            elements[0].parentNode.removeChild(elements[0]);
        }
    }

    function removeAllChildNodes(className){
        let parent = document.getElementsByClassName(className)[0];
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }

    function drawParksByState(stateId){
        g.append("g")
            .selectAll("path")
            .data(parks)
            .enter().append("circle")
            .attr("id", function(d){
                return d.id;
            })
            .attr("class", "parks")
            // .attr("id", d.id)
            .attr("r", 2)
            .attr("cx", function(d){
                console.log(d)
                let coords = projection([parseFloat(d.longitude),parseFloat(d.latitude)])
                if (coords && d.states === idToStates[stateId]){
                    return coords[0];
                } else {
                    return null;
                }
            })
            .attr("cy", function(d){
                let coords = projection([parseFloat(d.longitude),parseFloat(d.latitude)])
                if (coords && d.states === idToStates[stateId]){
                    return coords[1];
                } else {
                    return null;
                }
            })
    }



    function reset() {
        currentState = "United States of America"
        d3.select('.location').html(`You are currently viewing: ${currentState}`)
        active.classed("active", false);
        active = d3.select(null);

        g.transition()
            .delay(100)
            .duration(750)
            .style("stroke-width", "1.5px")
            .attr('transform', 'translate('+margin.left+','+margin.top+')');

        testFunc();

    }

}
// module.exports.generateMap = us_map;