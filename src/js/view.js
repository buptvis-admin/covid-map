map.on("zoom", zoomView)
    .on("move", moveView);

// 视图缩放
function zoomView() {
    // 怎么平稳过渡
    //map.panTo([currentCase.address_POI.lat, currentCase.address_POI.lng]);
    drawTrack(currentCase);
}

// 视图移动
function moveView() {
    var panes = document.getElementsByClassName('leaflet-pane leaflet-map-pane')[0];
    var transform = panes.style.transform.slice(12, -1);
    var offsetX = +transform.split(",")[0].replace("px", ""),
        offsetY = +transform.split(",")[1].replace("px", "")
    //console.log(offsetX, offsetY);
    var fixed_svg = document.getElementsByClassName("fixed_svg")[0];
    fixed_svg.style.left = -offsetX + "px";
    fixed_svg.style.top = -offsetY + "px";
    svg.attr("transform", "translate(" + offsetX + "," + offsetY + ")");

    // 地点 icon 的位置
    if (selectedPlaceDiv) {
        let thisAbPosition = selectedPlaceDiv.getBoundingClientRect()
        let thisCenterX = thisAbPosition.left + thisAbPosition.width/2 - 18
        let thisCenterY = thisAbPosition.top
        let placeIcon = document.getElementsByClassName('place-btn')
        // console.log(Math.round(thisCenterX) + 'px')
        let arc = - Math.PI/(placeIcon.length-1)

        for(let i = 0; i < placeIcon.length; i++) {
            let x = Math.cos(arc*i) * 50
            let y = Math.sin(arc*i) * 50
            placeIcon[i].style.left = Math.round(thisCenterX + x )+ 'px'
            placeIcon[i].style.top = Math.round(thisCenterY + y )+ 'px'
        }
    }
}

function getZoom(maxLng, minLng, maxLat, minLat) {  
    var zoom = ["50","100","200","500","1000","2000","5000","10000","20000","25000","50000","100000","200000","500000","1000000","2000000"]//级别18到3。  
    var maxPoint = L.latLng(maxLat, maxLng);
    var minPoint = L.latLng(minLat, minLng);
    var distance = maxPoint.distanceTo(minPoint).toFixed(1);
    /*console.log("d",distance)
    if (zoom[pre_zoom] < distance) {
        console.log("fanda")
        for (var i = pre_zoom; i >= 0; i--) {
            if (zoom[i] >= distance) {
                console.log("i", i, zoom[i])
                return i+1;
            }
        }
    } else {
        console.log("suoxiao")
        for (var i = pre_zoom; i < zoom.length; i++) {
            if (zoom[i] < distance) {
                console.log("i", i)
                return i;
            }
        }
    }*/

    for (var i = 0,zoomLen = zoom.length; i < zoomLen; i++) {  
        if(zoom[i] - distance > 0){  
            return 18-i+3;//之所以会多3，是因为地图范围常常是比例尺距离的10倍以上。所以级别会增加3。  
        }
    };  
}

