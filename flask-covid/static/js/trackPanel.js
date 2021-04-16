var themeFontColor = '#22324f'
var themeBgColor =  '#ebeef2'//'#ECF2F7'
var trackInfoBox = document.getElementById('track-info__box')
let trackInfoListBox = document.createElement('div')
trackInfoListBox.setAttribute('id', 'track-info-content__box')
// trackInfoListBox.setAttribute('draggable', 'true')
trackInfoBox.appendChild(trackInfoListBox)

var trans_bus_and_sub = '公交车|地铁|大巴|旅游车|通勤车|客车'
trans_bus_and_sub = trans_bus_and_sub.split('|')

var trans_walk = '步行|骑车|摩托车'
trans_walk = trans_walk.split('|')

var trans_train_and_plane = '火车|国航|航班'
trans_train_and_plane = trans_train_and_plane.split('|')

var trans_selfcar = '私家车|驾车|自驾车'  // 定义使用择一匹配符号的文本模式字符串
trans_selfcar = trans_selfcar.split('|')

var trans_taxi = '出租车|拼车|打车|网约车|乘车'
trans_taxi = trans_taxi.split('|')

var trans_ambulance = '救护车|120急救车|急救车|120'
trans_ambulance = trans_ambulance.split('|')

function healthStateColorFunc(hs) {
    switch(hs) {
        case '健康':
            return '#13E2A7';
        case '潜伏期':
            return '#FFD400';
        case '发病期':
            return '#F56256';
        default:
            return '#13E2A7';
    }
}

//文案编辑
function editWords(){
    // document.getElementById("word-others").style.display = "none";
    // document.getElementById("track-info__home").style.display = "none";
    // document.getElementById("track-info-content__box").style.display = "none";

    document.getElementById("user-list__content").style.display = "none";
    document.getElementById("data_description").style.display = "none";
    document.getElementById("word-write").style.display = "block";

    document.getElementById("order_select").style.color =  "#AFB8C5";
    document.getElementById("order_select").style.fontWeight = "500";

    document.getElementById("order_input").style.color =  "#567ABF";
    document.getElementById("order_input").style.fontWeight = "600";

    document.getElementById("hover_bar").style.left = "120px";


}

function backToOriginal(){
    // document.getElementById("word-others").style.display = "block";
    //
    // document.getElementById("track-info__home").style.display = "block";
    // document.getElementById("track-info-content__box").style.display = "block";
    document.getElementById("user-list__content").style.display = "block";
    document.getElementById("data_description").style.display = "block";
    document.getElementById("word-write").style.display = "none";

    document.getElementById("order_select").style.color =  "#567ABF";
    document.getElementById("order_select").style.fontWeight = "600";

    document.getElementById("order_input").style.color =  "#AFB8C5";
    document.getElementById("order_input").style.fontWeight = "500";

    document.getElementById("hover_bar").style.left = "30px";

}

//数据传输
function getTrack(){
    let write_message = {};
    write_message["province"]=document.getElementById("write-province").value;
    write_message["city"]=document.getElementById("write-area").value;
    write_message["place"]=document.getElementById("write-place").value;
    write_message["pub_time"]=document.getElementById("public-time").value;
    write_message["user_name"]=document.getElementById("patient-message").value;
    write_message["track"]=document.getElementById("track").value;


    $.ajax({
        type: 'POST',
        url: "/test",
        data:JSON.stringify(write_message),
        contentType: 'application/json; charset=UTF-8',
        success:function(data_1){ //成功的话，得到消息
            //alert(data);
            console.log(data_1);
            data = data_1;
            currentCase = data_1;
            console.log(cityData)
            // var fullName = pinyin.getFullChars(currentCase.province);
            // console.log(fullName)
            func(cityData);
            wordSegmentation();
            createPanel();
            document.getElementById("update-hint").style.opacity = 1;
            setTimeout(function () {
                document.getElementById("update-hint").style.opacity = 0;
            },2000)
            panel_transform_left();
            // document.getElementById("word-write").style.display = "none";
            // document.getElementById("word-others").style.display = "block";
            // document.getElementById("track-info__home").style.display = "block";
            // document.getElementById("track-info-content__box").style.display = "block";

        }
    })
}

// 预处理分词结构
function wordSegmentation() {
    currentCase.track.forEach((item, index) => {
        // 提前处理 word_segmentation

        if (typeof(item['word_segmentation']) === 'string' ) {
            let trackTextList = item['word_segmentation'].split(' ')
            let trackTextListDataSet = []

            trackTextList.forEach(textItem => {
            let labelObj =  {}
            labelObj.content = textItem.split('/')[0]
            labelObj.tag = textItem.split('/')[1]
            labelObj.placeIndex = textItem.split('/')[2]

            if(trans_bus_and_sub.indexOf(textItem.split('/')[0]) !== -1) {
                labelObj.tag = 'trans_bus'
            } else if(trans_walk.indexOf(textItem.split('/')[0]) !== -1) {
                labelObj.tag = 'trans_walk'
            } else if(trans_train_and_plane.indexOf(textItem.split('/')[0]) !== -1) {
                labelObj.tag = 'trans_train'
            } else if(trans_selfcar.indexOf(textItem.split('/')[0]) !== -1) {
                labelObj.tag = 'trans_car'
            } else if(trans_taxi.indexOf(textItem.split('/')[0]) !== -1) {
                labelObj.tag = 'trans_taxi'
            } else if(trans_ambulance.indexOf(textItem.split('/')[0]) !== -1) {
                labelObj.tag = 'trans_emergency'
            }
            //  else {
            //     labelObj.trans = ''
            // }
            trackTextListDataSet.push(labelObj)
        })

        item['word_segmentation'] = trackTextListDataSet
        }

    })

}
// wordSegmentation()


function createPanel() {
    // console.log(cityData,currentCase)

    let homeNodes = document.getElementById('track-info__home').childNodes
    for (let i = homeNodes.length-1;i >=0;i--) {
        homeNodes[i].remove();
    }

    let onlyForHomeBtnObj = {}
    onlyForHomeBtnObj.content = currentCase['patient_information'][0]['current_address']
    onlyForHomeBtnObj.tag = "home"
    onlyForHomeBtnObj.uniq = "home"
    let onlyForHomeBtnData = []
    onlyForHomeBtnData.push(onlyForHomeBtnObj)
    d3.select('#track-info__home')
        .selectAll('div')
        .data(onlyForHomeBtnData).enter()
        .append('div')
        .attr('id', 'place-home__btn')
        // .on('click', selectPlace)

    document.getElementById('user-info-date').innerHTML = currentCase['release_date'].split(' ')[0]
    document.getElementById('user-info-content').innerHTML =  currentCase['patient_information'][0]['name']
    + currentCase['patient_information'][0]['gender'] + ' '
    + currentCase['patient_information'][0]['age'] + '<br>'
     // 添加 居住地

     if (document.getElementById('home-place__info') !== null) {
        document.getElementById('home-place__info').innerHTML = currentCase['patient_information'][0]['current_address']
     } else {
        let homePlaceInfo = document.createElement('span')
        homePlaceInfo.setAttribute('id', 'home-place__info')
        homePlaceInfo.innerHTML = currentCase['patient_information'][0]['current_address']
        document.getElementById('track-info__home').appendChild(homePlaceInfo)
     }


    let reNodes = document.getElementById('track-info-content__box').childNodes
    for (let i = reNodes.length-1;i >=0;i--) {
        reNodes[i].remove();
    }

    // let placeHomeBtn = document.getElementById('place-home__btn')
    // placeHomeBtn.setAttribute('text', currentCase['patient_information'][0]['current_address'])

    currentCase.track.forEach((item, index) => {

        let trackTextDivTmp = document.createElement('div')
        let trackTextDiv = document.createElement('div')
        trackTextDiv.setAttribute('id', 'track-text-div-'+ index.toString())

        let trackInfoList = document.createElement('div')
        trackInfoList.classList.add('track-info__list')
        trackInfoList.setAttribute('index', index)

        trackTextDivTmp.appendChild(trackTextDiv)

        // 健康状态
        let healthStateColor = healthStateColorFunc(item['health_status'])

        trackInfoList.innerHTML = `
            <div class="time-line">
                <i class="time-line__circle" style="background-color:`+ healthStateColor +`"></i>
                <i class="time-line__line"></i>
            </div>
            <div class="track-info__content">
                <h1 class="track-date">`+ item['date'] +`</h1>
                <div class="track-text" track-text-index=` + index +`>`
                    + trackTextDivTmp.innerHTML +
                `</div>
            </div>
        `
        trackInfoListBox.appendChild(trackInfoList)

        // dom绑定数据，绘制元素
        d3.select('#track-text-div-' + index)
        .selectAll("div")
        .data(item['word_segmentation']).enter()
        .append("div")
        .attr('class', 'text-label track-text__label-'+index)
        .attr('draggable', function(d) {
            if((d.tag === 'ns' || d.tag === 'nis' || d.tag === 'nt' || d.tag === 'ntu' ||
                d.tag === 'nth' || d.tag === 'n' || d.tag === 'nr' ||
                d.tag === 'f' || d.tag === 'ng' || d.tag === 'place' ||  d.tag === 'otherPlace') ) {
                return 'true'
             }
             else {
                 return 'false'
                }
            })
        .style('background-color', function(obj) {
            let bgColor;
            // 判断地名
            if(obj.tag === 'ns' || obj.tag === 'nis' || obj.tag === 'nt' || obj.tag === 'ntu' ||
            obj.tag === 'nth' || obj.tag === 'n' || obj.tag === 'nr' ||
            obj.tag === 'f' || obj.tag === 'ng' || obj.tag === 'place' || obj.tag === 'otherPlace') { bgColor = themeBgColor }  //#ECF2F7
            // 判断交通工具
            if(obj.tag === 'trans_bus') {
                bgColor = '#FFE5D9'

            } else if(obj.tag === 'trans_walk') {
                bgColor = '#D0EFF4'

            } else if(obj.tag === 'trans_train') {
                bgColor = '#D7EBFF'

            } else if(obj.tag === 'trans_car') {
                bgColor = '#E6EAFF'

            } else if(obj.tag === 'trans_taxi') {
                bgColor = '#FFF5D9'

            } else if(obj.tag === 'trans_emergency') {
                bgColor = '#FCD9D9'
            }
            return bgColor;
            })
        .style('color', function(obj) {
            let fontColor;
            if(obj.tag === 'ns' || obj.tag === 'nis' || obj.tag === 'nt' || obj.tag === 'ntu' ||
            obj.tag === 'nth' || obj.tag === 'n' || obj.tag === 'nr'  ||
            obj.tag === 'f' || obj.tag === 'ng' || obj.tag === 'place' || obj.tag === 'otherPlace') { fontColor = themeFontColor }

            if(obj.tag === 'trans_bus') {
                fontColor = '#FF945F'

            } else if(obj.tag === 'trans_walk') {
                fontColor = '#4CBCD6'

            } else if(obj.tag === 'trans_train') {
                fontColor = '#579CFF'

            } else if(obj.tag === 'trans_car') {
                fontColor = '#858EFF'

            } else if(obj.tag === 'trans_taxi') {
                fontColor = '#FFD13E'

            } else if(obj.tag === 'trans_emergency') {
                fontColor = '#EF4437'
            }
            return fontColor;
        })
        .style('pointer-events', function(obj) {
            if(obj.tag === 'ns' || obj.tag === 'nis' || obj.tag === 'nt' || obj.tag === 'ntu' ||
            obj.tag === 'nth' || obj.tag === 'n' || obj.tag === 'nr' ||
            obj.tag === 'f' || obj.tag === 'ng' || obj.tag === 'place' || obj.tag === 'otherPlace') { return 'auto' }
        })
        .style('cursor', function(obj) {
            if(obj.tag === 'ns' || obj.tag === 'nis' || obj.tag === 'nt' || obj.tag === 'ntu' ||
            obj.tag === 'nth' || obj.tag === 'n' || obj.tag === 'nr' ||
            obj.tag === 'f' || obj.tag === 'ng' || obj.tag === 'place' || obj.tag === 'otherPlace') { return 'pointer' }
        })
        .style('white-space', function(obj) {
            // 超过15个字换行
            if (obj.content.length > 15) {
                return 'normal'
            }
        })
        .text(function(d){
            return d.content
        })
        .style('font-weight', function(obj){
            if(obj.tag === 'ns' || obj.tag === 'nis' || obj.tag === 'nt' || obj.tag === 'ntu' ||
            obj.tag === 'nth' || obj.tag === 'n' || obj.tag === 'nr'||
            obj.tag === 'f' || obj.tag === 'ng' || obj.tag === 'place' || obj.tag === 'otherPlace') { return '800' }
        })
    })

    // 很重要，绑定事件
    currentCase.track.forEach((item, index) => {
        d3.selectAll('.track-text__label-' + index )
        .call(
            d3.drag()
            // .clickDistance(400)
            .on("start", dragStart)
            .on("drag", draged)
            .on("end", dragEnd)
        )
        .on('dblclick', modifyPlace)
    })


    // .on('click', modifyPlace)
    // console.log(currentCase['track'][ 0 ]['word_segmentation'], 'word_segmentation')
}




// // 好像没什么用
// function selectTrackLabel(e) {
//     let _this = e.target
//     let classList = []
//     for(let i = 0; i < _this.classList.length; i++) {
//         classList.push(_this.classList[i])
//     }
//     if(classList.indexOf('span-active') === -1) {
//         _this.classList.add('span-active')
//         targetPlaceText += _this.innerHTML
//         //console.log(targetPlaceText)
//     } else {
//         _this.classList.remove('span-active')
//         targetPlaceText = targetPlaceText.replace(_this.innerHTML, '')
//         //console.log(targetPlaceText)
//     }
// }


//面板收缩
function panel_transform_left(){
    if(is_panel_click_left == false){
        document.getElementById("user-list__box").setAttribute("style", "left:-290px;");
        document.getElementById("panel-control-left").setAttribute("style", "left:0px;");
        document.getElementById("panel-left").style.transform = "translate(-50%,-50%) rotate(180deg) ";
        is_panel_click_left = true;
    }
    else {
        document.getElementById("user-list__box").setAttribute("style", "left:0px;");
        document.getElementById("panel-control-left").setAttribute("style", "left:290px;");
        document.getElementById("panel-left").style.transform = "translate(-50%,-50%) rotate(0deg)";
        is_panel_click_left = false;
    }

}

function panel_transform_right(){
    if(is_panel_click_right == false){
        document.getElementById("track-info__box").setAttribute("style", "right:-260px;");
        document.getElementById("panel-control-right").setAttribute("style", "right:0px;");
        document.getElementById("panel-right").style.transform = "translate(-50%,-50%) rotate(0deg)";
        is_panel_click_right = true;
    }
    else {
        document.getElementById("track-info__box").setAttribute("style", "right:0px;");
        document.getElementById("panel-control-right").setAttribute("style", "right:260px;");
        document.getElementById("panel-right").style.transform = "translate(-50%,-50%) rotate(180deg)";
        is_panel_click_right = false;
    }

}