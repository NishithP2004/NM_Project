const lagrangeInterpolation = (points, x) => {
    let res = {
        lat: 0,
        lng: 0
    }

    for(let i=0;i<points.length;i++) {
        let {lat, lng} = points[i];
        for(let j=0;j<points.length;j++) {
            if(i !== j) {
                let k = (x - points[j].x) / (points[i].x - points[j].x);
                lat *= k;
                lng *= k;
            }
        }
        res.lat += lat;
        res.lng += lng;
    }

    return res;
}

