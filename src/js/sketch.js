let isShow = false
let selectedPlaceDiv = null
let thisPlaceType = null
let genericTerm = ["超市", "蔬菜店", "公司", "小区", "定点医院", "饭店",
                    "医院", "隔离点", "亲属家", "医生办公室", "步行街", "中心", 
                    "购物中心", "百家", "餐厅", "单位", "酒店","药店", "小区亲属家", "市场", "县医院", "商业街"]

// 绘制路径
function drawTrack(currentCase) {
    // 清空画布
    track_svg.remove();
    icon_svg.remove();
    text_svg.remove();
    document.getElementsByClassName('leaflet-pane leaflet-popup-pane')[0].innerHTML = '';
    track_svg = svg.append("g");
    icon_svg = svg.append("g");
    text_svg = svg.append("g");

    var homePoint = map.latLngToLayerPoint([currentCase.address_POI.lat, currentCase.address_POI.lng]);

    let homeCircle = text_svg
        .append("image")
        .attr("x", homePoint.x-bigWidth/2)
        .attr("y", homePoint.y-bigWidth/2)
        .attr("height", bigWidth)
        .attr("width", bigWidth)
        .attr("xlink:href", "./src/img/place_home.png")
        .attr("filter", "url(#drop-shadow)");

    // place.name === ""
    if( currentCase['patient_information'][0]['current_address'] === "" ) {
        let popPoint = {}
        popPoint.x = homeCircle.node().getBBox().x + homeCircle.node().getBBox().width/2
        popPoint.y = homeCircle.node().getBBox().y + homeCircle.node().getBBox().height/3
        let popPOI = map.layerPointToLatLng(popPoint);
        let popup = L.popup({maxHeight: 20, minWidth: 25, autoPan: false})
            .setLatLng([popPOI.lat, popPOI.lng])
            .setContent('未知')
            .addTo(map);
    }

    var textBox;
    var test =  text_svg.append("text")
        .attr("x", homePoint.x)
        .attr("y", homePoint.y + 34)
        .attr("class", "text_tag")
        .text(currentCase.patient_information[0].current_address)
        .each(function() {
            textBox = this.getBBox();
        });
    test.remove();

    text_svg.append("rect")
        .attr("width", textBox.width + 12)
        .attr("height", textBox.height + 2)
        .attr("x", textBox.x - 6)
        .attr("y", textBox.y - 1)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", "#fff")
        .attr("filter", "url(#drop-shadow)");

    text_svg.append("text")
        .attr("x", homePoint.x)
        .attr("y", homePoint.y + 34)
        .attr("class", "text_tag")
        .text(currentCase.patient_information[0].current_address);

    // 日期中位数
    var median = parseInt(currentCase.track.length / 2);
    var pattern = /-|－|—|至|、/i;
    var date_type;
    // 左侧日期
    var offset = 0;
    var center_offset = 0;
    for (var i = median-1; i > -1; i--) {
        var datePoint = {};
        if (currentCase.track[i].date.search(pattern) > -1) {
            offset -= 54;
            center_offset = 24;
            date_type = 'multi-date';
        } else {
            offset -= 30;
            center_offset = 12;
            date_type = 'single-date';
        }
        datePoint.x = (homePoint.x-15) + offset + center_offset;
        datePoint.y = homePoint.y;
        drawPath(currentCase.track[i], datePoint, i, date_type);
    }

    // 右侧日期
    offset = 0;
    for (var i = median; i < currentCase.track.length; i++) {
        if (currentCase.track[i].date.search(pattern) > -1) {
            offset += 54;
            center_offset = 24;
            date_type = 'multi-date';
        } else {
            offset += 30;
            center_offset = 12;
            date_type = 'single-date';
        }
        var datePoint = {};
        datePoint.x = (homePoint.x + 15) + offset - center_offset;
        datePoint.y = homePoint.y;
        drawPath(currentCase.track[i], datePoint, i, date_type);
    }
}

function drawPath(daily, datePoint, parentIndex, shape) {
    // 绘制日期起点
    function addDate(x, date) {
        icon_svg.append("rect")
            .attr("x", x-12)
            .attr("y", datePoint.y-24)
            .attr("width", 24)
            .attr("height", 48)
            .attr("rx", 12)
            .attr("ry", 12)
            .style("fill", () => {
                if (daily.health_status == "潜伏期")  return "#FFEDC5";
                else if (daily.health_status == "发病期")  return "#F9D4E0";
                else return "#D0F7E9";
            });

        icon_svg.append("text")
            .attr("x", x)
            .attr("y", datePoint.y-4)
            .attr("text-anchor", "middle")
            .attr("class", "date")
            .attr("fill", () => {
                if (daily.health_status == "潜伏期")  return "#FF9700";
                else if (daily.health_status == "发病期")  return "#EF4437";
                else return "#13E2A7";
            })
            .text(date.split("-")[0]);

        icon_svg.append("text")
            .attr("x", x)
            .attr("y", datePoint.y+10)
            .attr("text-anchor", "middle")
            .attr("class", "date")
            .attr("fill", () => {
                if (daily.health_status == "潜伏期")  return "#FF9700";
                else if (daily.health_status == "发病期")  return "#EF4437";
                else return "#13E2A7";
            })
            .text(date.split("-")[1]);
    }

    var startPoint = {};
    // 多日期情况
    if (shape == 'multi-date') {
        var patt = /-|－|—|至/i;
        var startDate, endDate;
        if (daily.date.search(patt) > -1) {
            startDate = daily.date.split(patt)[0];
            endDate = daily.date.split(patt)[1];
            if (endDate.search("月") < 0) {
                endDate = startDate.split("月")[0] + "月" + endDate
            }
        } else if (daily.date.search("、" > -1)) {
            var dates = daily.date.split("、");
            startDate = dates[0];
            endDate = dates[dates.length-1];
            if (endDate.search("月") < 0) {
                endDate = startDate.split("月")[0] + "月" + endDate
            }
        }
        startDate = d3.timeFormat("%m-%d")(d3.timeParse("%m月%e日")(startDate));
        endDate = d3.timeFormat("%m-%d")(d3.timeParse("%m月%e日")(endDate));
        addDate(datePoint.x - 11, startDate); //12+1
        addDate(datePoint.x + 11, endDate); //36-1 保证有重叠

    // 单日期情况
    } else {
        var date = d3.timeFormat("%m-%d")(d3.timeParse("%m月%e日")(daily.date));
        addDate(datePoint.x, date);
    }    

    // 线生成器
    var lineFunction = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        //.curve(d3.curveBasis)
        .curve(d3.curveNatural);

    if (daily.place.length > 0) {
        startPoint = datePoint;
        daily.place.forEach((place, j) => {
            //console.log('place',place)
            place.parentIndex = parentIndex
            place.index = j
            if (j > 0) {
                 // 每段路径的终点坐标
                let endPOI = place.POI;                
                let endPoint = map.latLngToLayerPoint([endPOI.lat, endPOI.lng]);
                let midPoint, points = [];

                if (place.midPOI) {
                    midPoint = map.latLngToLayerPoint(place.midPOI);
                    points = [startPoint, midPoint, endPoint];
                } else {
                    var arc_d = "M" + startPoint.x + "," + startPoint.y + "A" + Math.abs(startPoint.x-endPoint.x)  + ",\
                        " + Math.abs(startPoint.y-endPoint.y) + " 0 0 0 " + endPoint.x + "," + endPoint.y;
                    var arc = text_svg.append("path").attr("d", arc_d).style("stroke", "none").style("fill","none")
                    var length = arc.node().getTotalLength();
                    midPoint = arc.node().getPointAtLength(length*0.5);
                    points = [startPoint, midPoint, endPoint];
                }

                // 计算控制点数组
                /*if (endPoint.y < startPoint.y) { // 上半部分
                    var verticalPoint = {x: startPoint.x, y: (startPoint.y + endPoint.y) / 2}
                } else {
                    var verticalPoint = {x: startPoint.x, y: (startPoint.y + endPoint.y) / 2}
                }
                if (endPoint.x < startPoint.x) { // 左半部分
                    var horizontalPoint = {x: (startPoint.x + endPoint.x) / 2, y: endPoint.y}
                } else {
                    var horizontalPoint = {x: (startPoint.x + endPoint.x) / 2, y: endPoint.y}
                }
                var points = [startPoint, verticalPoint, horizontalPoint, endPoint];*/
                //console.log(points);

                // 如果每次终点 name 是 居住地的话，回到日期的位置
                if (place.name === currentCase['patient_information'][0]['current_address']) {
                    endPoint.x =  datePoint.x
                    // (homePoint.x + 15) + offset - center_offset;
                }
                startPoint = endPoint;

                // 添加路径
                var path_wrapper = track_svg.datum(place)
                    .append("g")
                    .style("visibility", (d) => {
                        if (daily.place[j].show == false)  return "hidden";
                        else return "visible";
                    })
                    .on("contextmenu", function() {
                    //.on("click", function() {
                        // 取消默认事件
                        d3.event.preventDefault();

                        // 弹窗确认是否删除
                        var isConfirmed = confirm("确定要删除该路径吗？");
                        if (isConfirmed == true)
                        {

                            // 为了回溯: 放在添加路径之前
                            pushBackList(parentIndex)

                            // 新增 ：联动修改 word-segment 数组内容 删掉的点 placeIndex 改成 undefined
                            daily['word_segmentation'].forEach((item, index) => {
                                if(item.placeIndex == j ) {
                                    item.placeIndex = undefined
                                }
                            })

                            // splice() 方法用于添加或删除数组中的元素 参数1：元素位置 参数2：删除几个
                            daily.place.splice(j,1);

                            // 更新 word-segment 的 placeIndex
                            let placeNum = 0
                            daily['word_segmentation'].forEach((item, index) => {
                                if(item.placeIndex !== undefined ) {
                                    if(daily['place'][0].name === '') {
                                        item.placeIndex = placeNum + 1
                                        placeNum++
                                    } else {
                                        item.placeIndex = placeNum
                                        placeNum++
                                    }
                                }
                            })

                            drawTrack(currentCase);
                        }
                    });

                var curve = path_wrapper
                    .append("path")
                    .attr("d", lineFunction(points))
                    .attr("stroke", () => {
                        switch (place.vehicle) {
                            case "train":
                                return "#579CFF";
                            case "plane":
                                return "#579CFF";
                            case "taxi":
                                return "#FFD13E";
                            case "bus":
                                return "#FF945F";
                            case "subway":
                                return "#FF945F";
                            case "car":
                                return "#858EFF";
                            case "emergency":
                                return "#F56256";
                            case "walk":
                                return "#4CBCD6";
                            default:
                                return "#81BBEE";
                        }
                    })
                    .attr("class", "curve")
                    //.attr("marker-mid","url(#arrow)")
                    .style("pointer-events", "visiblePainted");

                // 箭头
                var arrow1 = path_wrapper.append("use").attr("xlink:href", "#arrow");
                addArrow(arrow1, curve, 0.25);

                var arrow2 = path_wrapper.append("use").attr("xlink:href", "#arrow");
                addArrow(arrow2, curve, 0.75);

                // 交通icon
                path_wrapper.datum([points[0],points[2]])
                    .append("circle")
                    .attr("cx", midPoint.x)
                    .attr("cy", midPoint.y)
                    .attr("r", smallWidth/2)
                    .style("fill", () => {
                        if (place.vehicle != "others" && place.vehicle != "" &&  place.vehicle != "unknown") {
                            var vehicle = place.vehicle;
                            if (vehicle == "plane")  vehicle = "train";
                            if (vehicle == "subway")  vehicle = "bus";
                            return "url(#" + vehicle + ")";
                        }
                        return "url(#trans_unknown)";
                    })
                    .call(d3.drag()
                        .subject(function(d) {
                            return { x: d3.select(this).attr("cx"), y: d3.select(this).attr("cy") };
                        })
                        .on("drag", function(d) {
                            d3.select(this).attr("cx", d3.event.x).attr("cy", d3.event.y);

                            midPoint.x = d3.event.x;
                            midPoint.y = d3.event.y;
                            points = [d[0], midPoint, d[1]];
                            //console.log("trans", points);

                            curve.attr("d", lineFunction(points));
                            addArrow(arrow1, curve, 0.25);
                            addArrow(arrow2, curve, 0.75);

                            place.midPOI = map.layerPointToLatLng(midPoint);
                        })
                    );

                // 远距离标签
                if (place.isRemote == true) {
                    var popPoint = curve.node().getPointAtLength(250);
                    var popPOI = map.layerPointToLatLng(popPoint);
                    var popup = L.popup({maxHeight: 20, minWidth: 25, autoPan: false})
                        .setLatLng([popPOI.lat, popPOI.lng])
                        .setContent(place.name)
                        .addTo(map);
                }
                

                // 终点icon
                let end_wrapper = text_svg.append("g").attr('class', 'place-icon');
                let end_tag = end_wrapper.append("g").attr('class', 'end_tag');
                let end_circle = end_wrapper.datum(place)
                    .append("image")
                    .attr('class', 'site')
                    .attr("x", function(d) {
                        if (d.name === currentCase['patient_information'][0]['current_address']) {
                            return datePoint.x
                            // (homePoint.x + 15) + offset - center_offset;
                        } else {
                            return (endPoint.x-bigWidth/2)
                        } 
                    })
                    .attr("y", endPoint.y-bigWidth/2)
                    .attr("height", bigWidth)
                    .attr("width", bigWidth)
                    .style('display', function(d) {
                        if (d.name === currentCase['patient_information'][0]['current_address']) {
                            return 'none'
                            // (homePoint.x + 15) + offset - center_offset;
                        } else return 'block'
                    })
                    .attr("xlink:href", () => {
                        if (place.tag === 'home' ||
                        place.tag === 'market' || 
                        place.tag === 'company' ||
                        place.tag === 'hospital' ||
                        place.tag === 'restaurant' ||
                        place.tag === 'station' ||
                        place.tag === 'relations' )  return "./src/img/place_" + place.tag + ".png";
                        else return "./src/img/place_unknown.png"
                    })
                    .attr("filter", "url(#drop-shadow)")
                    .style("pointer-events", "visiblePainted")
                    .on("contextmenu", function() {
                    //.on("click", function() { //调试用
                        // 取消默认事件
                        d3.event.preventDefault();

                        // 弹窗确认是否删除
                        var isConfirmed = confirm("确定要删除该路径吗？");
                        if (isConfirmed == true)
                        {
                            pushBackList(parentIndex)
                            // 新增 ：联动修改 word-segment 数组内容 删掉的点 placeIndex 改成 undefined
                            daily['word_segmentation'].forEach((item, index) => {
                                if(item.placeIndex == j ) {
                                    item.placeIndex = undefined
                                }
                            })

                            // splice() 方法用于添加或删除数组中的元素 参数1：元素位置 参数2：删除几个
                            daily.place.splice(j,1)

                            // 更新 word-segment 的 placeIndex
                            let placeNum = 0
                            daily['word_segmentation'].forEach((item, index) => {
                                if(item.placeIndex !== undefined ) {
                                    if(daily['place'][0].name === '') {
                                        item.placeIndex = placeNum + 1
                                        placeNum++
                                    } else {
                                        item.placeIndex = placeNum
                                        placeNum++
                                    }
                                }
                            })
                            drawTrack(currentCase);
                        }
                    })
        
                
                // 未知地点标签
                if (genericTerm.indexOf(place.name) !== -1 || 
                (place.name.substring(place.name.length - 2) !== '小区' && place.name.substring(place.name.length - 1) === '区')) {
                    let popPoint = {}
                    popPoint.x = end_circle.node().getBBox().x + end_circle.node().getBBox().width/2
                    popPoint.y = end_circle.node().getBBox().y + end_circle.node().getBBox().height/3
                    let popPOI = map.layerPointToLatLng(popPoint);
                    let popup = L.popup({maxHeight: 20, minWidth: 25, autoPan: false})
                        .setLatLng([popPOI.lat, popPOI.lng])
                        .setContent('未知')
                        .addTo(map);
                }

                // 地点标签
                var textBox;
                var test = end_tag.append("text")
                    .attr("x", endPoint.x)
                    .attr("y", endPoint.y + 32)
                    .attr("class", "text_tag")
                    .text(place.name)
                    .each(function() {
                        textBox = this.getBBox();
                    });
                test.remove();

                end_tag.append("rect")
                    .attr("width", textBox.width + 12)
                    .attr("height", textBox.height + 2)
                    .attr("x", textBox.x - 6)
                    .attr("y", textBox.y - 1)
                    .attr("rx", 4)
                    .attr("ry", 4)
                    .attr("fill", "#fff")
                    .attr("filter", "url(#drop-shadow)")
                    .style('display',function() {
                        if (place.name === currentCase['patient_information'][0]['current_address']) {
                            return 'none'
                            // (homePoint.x + 15) + offset - center_offset;
                        } else return 'block'
                    });

                end_tag.append("text")
                    .attr("x", endPoint.x)
                    .attr("y", endPoint.y + 32)
                    .attr("class", "text_tag")
                    .text(place.name)
                    .style('display',function() {
                        if (place.name === currentCase['patient_information'][0]['current_address']) {
                            return 'none'
                            // (homePoint.x + 15) + offset - center_offset;
                        } else return 'block'
                    });

                // 拖动地点图标
                end_circle.call(d3.drag()
                    .on("drag", function(d) {
                        d3.select(this).attr("x", d3.event.x - bigWidth/2).attr("y", d3.event.y - bigWidth/2);

                        endPoint.x = d3.event.x;
                        endPoint.y = d3.event.y;
                        points = [points[0], midPoint, endPoint];
                        // console.log("icon", points);

                        curve.attr("d", lineFunction(points));
                        addArrow(arrow1, curve, 0.25);
                        addArrow(arrow2, curve, 0.75);
                    })
                );

                // 拖动地点标签
                end_tag.call(d3.drag()
                    .on("drag", function(d) {
                        d3.select(this).select('rect').attr("x", d3.event.x - (textBox.width+12)/2).attr("y", d3.event.y - (textBox.height+2)/2);
                        d3.select(this).select('text').attr("x", d3.event.x).attr("y", d3.event.y+4);
                    })
                )
            }           
        });
    }

    d3.selectAll('.site')
        .on("click", function(data, index) {
            let _this = d3.select(this).node()

            thisPlaceType = data
            // console.log(thisPlaceType, 'index')

            //找出点击位置 为了添加 地点类型 弹出框（placeType）
            selectedPlaceDiv = _this
            let thisAbPosition = _this.getBoundingClientRect()
            let thisCenterX = thisAbPosition.left + thisAbPosition.width/2 - 18
            let thisCenterY = thisAbPosition.top
            let placeIcon = document.getElementsByClassName('place-btn')
            // console.log(Math.round(thisCenterX) + 'px')
            let arc = - Math.PI/(placeIcon.length-1)

            if(!isShow) {
                for(let i = 0; i < placeIcon.length; i++) {
                    let x = Math.cos(arc*i) * 50
                    let y = Math.sin(arc*i) * 50
                    placeIcon[i].style.left = Math.round(thisCenterX + x )+ 'px'
                    placeIcon[i].style.top = Math.round(thisCenterY + y )+ 'px'
                    placeIcon[i].style.opacity = 1
                    placeIcon[i].style.display = 'block'
                    placeIcon[i].onclick = selectPlaceType
                }
                isShow = true
            } else {
                let placeIcon = document.getElementsByClassName('place-btn')
                        for(let i = 0; i < placeIcon.length; i++) {
                            placeIcon[i].style.opacity = 0
                            placeIcon[i].style.display = 'none'
                            placeIcon[i].removeEventListener('click', selectPlaceType)
                        }
                isShow = false
            }
            // console.log(place, 'sss')
        })
}

function selectPlaceType(e) {
    currentCase['track'][thisPlaceType.parentIndex]['place'][thisPlaceType.index].tag = e.target.id
    // 关闭trans弹框
    let placeIcon = document.getElementsByClassName('place-btn')
    for(let i = 0; i < placeIcon.length; i++) {
        placeIcon[i].style.opacity = 0
        placeIcon[i].style.display = 'none'
        placeIcon[i].removeEventListener('click', selectPlaceType)
    }
    isShow = false

    drawTrack(currentCase)
   
}

// 添加箭头函数
function addArrow(arrow, path, percent) {
    var pathLength = path.node().getTotalLength();
    if (pathLength > 0) {
        var pathPoint = path.node().getPointAtLength(pathLength*percent);

        var point1 = path.node().getPointAtLength(pathLength*percent+5);
        var point2 = path.node().getPointAtLength(pathLength*percent-5);
        var slope = (point2.y - point1.y)/(point2.x - point1.x);
        var angel = Math.atan(slope)*180/Math.PI;

        //console.log(angel);
        if (point1.x < point2.x) {
            angel = angel+180;
        }
        if (angel != undefined) {
            arrow.attr("transform", "translate("+pathPoint.x+","+pathPoint.y+")rotate("+angel+")")
        }        
    }    
}



