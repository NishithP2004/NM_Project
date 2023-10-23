var map, polyline = [],
    markers = [];

setTimeout(() => {
    map = new MapmyIndia.Map("map", {
        center: [12.8949688, 77.6735508],
        zoomControl: true,
        hybrid: true
    });

}, 1000);

function randomColor() {
    let color = "#",
        charset = "0123456789ABCDEF";
    for (let i = 1; i <= 6; i++)
        color += charset[Math.floor(Math.random() * 16)];
    return color;
}

let form = document.forms[0];

form.addEventListener('submit', ev => {
    ev.preventDefault();
    let posA = form.posA.value,
        posB = form.posB.value;
    posA = posA.split(", ");
    posB = posB.split(", ");

    let points = [{
            x: 0,
            lat: parseFloat(posA[0]),
            lng: parseFloat(posA[1])
        },
        {
            x: 1,
            lat: parseFloat(posB[0]),
            lng: parseFloat(posB[1])
        }
    ]

    points.forEach(pt => {
        addMarker(pt, `Point ${(pt.x == 0)? "A": "B"}`)
    })

    let output = document.querySelector('#output > b')
    let intPts = [];

    let d1 = new Date().getTime();
    for (let i = 0; i <= 1; i += 0.01)
        intPts.push(lagrangeInterpolation(points, parseFloat(i.toFixed(2))))

    /* let ctr=0;
    intPts.forEach(pt => {
        addMarker(pt, `Point ${ctr++}`)
    }); */

    createPolyline(intPts, "Interpolated Polyline")
    getDirections(points)
    let d2 = new Date().getTime();
    output.innerText = `${d2-d1}ms`

    form.posA.value = "";
    form.posB.value = "";
    return false;
})

function addMarker(data, content) {
    let marker = L.marker([data.lat, data.lng]).addTo(map);
    marker.bindPopup(content);
    markers.push(marker)
}

function createPolyline(pts, content) {
    var poly = new L.Polyline(pts, {
        weight: 4, // The thickness of the polyline 
        opacity: 0.75, //The opacity of the polyline colour ,
        color: randomColor()
    })
    poly.bindPopup(content)
    polyline.push(poly);
    map.addLayer(poly);
}

async function getDirections(points) {
    try {
        let res = await fetch(`https://mapmyindiaapi.nishithp2004.repl.co/api/?points=${points.map(pt => pt.lng + "," + pt.lat).join(";")}`, {
                method: "GET"
            })
            .then(r => r.json())
            .catch(err => {
                if (err)
                    console.error(err)
            })
        let geometry = decode(res.routes[0].geometry)
        createPolyline(geometry, "Actual Polyline")
    } catch (err) {
        if (err) console.error(err)
    }
}

function resetMap() {
    form.posA.value = "";
    form.posB.value = "";
    document.querySelector('#output > b').innerText = ""

    polyline.forEach(poly => {
        map.removeLayer(poly)
    })

    markers.forEach(marker => {
        map.removeLayer(marker)
    })
}

document.getElementById("reset").onclick = resetMap;

function decode(encoded) {
    var points = [],
        index = 0,
        len = encoded.length,
        lat = 0,
        lng = 0;
    while (index < len) {
        var b, shift = 0,
            result = 0;
        do {

            b = encoded.charAt(index++).charCodeAt(0) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        var dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
        lat += dlat;
        shift = 0;
        result = 0;
        do {
            b = encoded.charAt(index++).charCodeAt(0) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        var dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
        lng += dlng;
        points.push([lat / 1E5, lng / 1E5])
    }
    return points
}