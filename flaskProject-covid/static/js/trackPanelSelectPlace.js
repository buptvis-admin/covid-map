var isSelectPlace = false
var startHomeMark = false
function selectPlaceState() {
    if(!isSelectPlace) {
        document.getElementById('select-place__btn').style.opacity = .3
        // document.getElementById('modify-place__btn').style.opacity = 1
        currentCase.track.forEach((item, index) => {
            d3.selectAll('.track-text__label-' + index )
            .call(
                d3.drag()
                // .clickDistance(400)
                .on("start", null)
                .on("drag", null)
                .on("end", null)
            )
            .on('dblclick', null)
            .on('click', selectPlace)
        })
        
        d3.select('#place-home__btn')
        .on('click', selectPlace)

        if (document.getElementById('modi-input')) {
            document.getElementById('modi-input').parentNode.innerHTML = document.getElementById('modi-input').value
        }
        isSelectPlace = true

    } else {
        document.getElementById('select-place__btn').style.opacity = 1
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
            .on('click', null)
        })
        isSelectPlace = false

        d3.select('#place-home__btn')
        .on('click', null)

        // 清空所有选择
        createPanel()
        let transIcon = document.getElementsByClassName('trans-btn')
        for(let i = 0; i < transIcon.length; i++) {
            transIcon[i].style.opacity = 0
            transIcon[i].style.display = 'none'
        }
    }
}

var selectedDiv = null
var selectedStatusForHint = false

function findStartPlace() {
    let state = false;
    spanLabels = document.getElementsByClassName('text-label')
    for(let i = 0; i < spanLabels.length; i++) {
        if(spanLabels[i].getAttribute('selected-place') === 'start') {
            state = true
            break;
        } else {
            state = false
        }
    }
    if (document.getElementById('place-home__btn').getAttribute('selected-place') === 'start') {
        state = true
    }
    return state
}

function findEndPlace() {
    let state = false;
    spanLabels = document.getElementsByClassName('text-label')
    for(let i = 0; i < spanLabels.length; i++) {
        if(spanLabels[i].getAttribute('selected-place') === 'end') {
            state = true
            break;
        } else {
            state = false
        }
    }
    if (document.getElementById('place-home__btn').getAttribute('selected-place') === 'end') {
        state = true
    }
    return state
}

var newPathObj = {}
var createPathParentIndex, insertIndex
var startPlaceIsExist = false
var preDataStartTag, preDataEndTag
// // if else 永生难忘
function selectPlace(data, index) {
//  console.log(data, 'selectPlace!!!!')
    let _this = d3.select(this).node()
    /* 点击选中起点 */
    if(!findStartPlace() &&  _this.getAttribute('selected-place') !== 'end') {
        _this.draggable = false
        // _this.style.backgroundColor = '#F9FBFF'
        // _this.style.color = '#8D9DB4'

        _this.setAttribute('selected-place', 'start')
        let placeHintStart = document.createElement('i')
        placeHintStart.classList.add('place-hint-start')
        placeHintStart.innerHTML = '起'
        placeHintStart.style.backgroundColor = '#f19a69'

        _this.appendChild(placeHintStart)

        //起点名称保存起来
        if (data.placeIndex === undefined && data.uniq !== 'home') { //不能把家选中成为append对象
            // console.log('no!!!')
            newPathObj.name = data.content
            newPathObj.tag = 'place'

            // startPlaceIsExist = true
        } else {
            // console.log('yes!!!')
            insertIndex = (data.placeIndex ? data.placeIndex : 0) + 1
            // startPlaceIsExist = true
        }

        preDataStartTag = data.tag // 当我选中这个标签的时候，赋予其 tag 为 place， 取消反之***
        data.tag = 'place'

        // 暂时保存 parentIndex 用来对付终点是家的情况
        createPathParentIndex = Number(_this.parentNode.parentNode.getAttribute('track-text-index'))

        // 如果起点是家
        if (data.uniq === 'home') {
            startHomeMark = true
        }

    // 点击选中终点
    } else if(findStartPlace() && !findEndPlace() && _this.getAttribute('selected-place') !== 'start') {

        let allowPathState = true

        // 如果终点是家，就要改插入的 parentIndex
        if (data.uniq === 'home') {
            createPathParentIndex = createPathParentIndex
            startHomeMark = true
        } else {
            // 拿到当前点击的节点 index / parentIndex
            if (createPathParentIndex === Number(_this.parentNode.parentNode.getAttribute('track-text-index')) || startHomeMark === true) {
                createPathParentIndex = Number(_this.parentNode.parentNode.getAttribute('track-text-index'))
            } else {
                allowPathState = false
                // alert('无效路径')
               showHint('无效路径' , false)
            }
        }

        if (allowPathState) {
            _this.draggable = false

            // 添加 hint
            _this.setAttribute('selected-place', 'end')
            let placeHintEnd = document.createElement('i')
            placeHintEnd.classList.add('place-hint-end')
            placeHintEnd.innerHTML = '终'
            placeHintEnd.style.backgroundColor = '#6891f8'
            _this.appendChild(placeHintEnd)
    
            // 终点名称保存起来
            // newPathItem.target.name = _this.id ? _this.getAttribute('text') : _this.innerText.replace('终', '')
            // newPathItem.target.tag = ''
            // if(startPlaceIsExist) {
                if (data.placeIndex === undefined || data.uniq === 'home') {
                    newPathObj.name = data.content
                    newPathObj.tag = 'place'
                    // startPlaceIsExist = false
                } else {
                    insertIndex = data.placeIndex
                    // startPlaceIsExist = false
                }
            // } 
    
            preDataEndTag = data.tag // 当我选中这个标签的时候，赋予其 tag 为 place， 取消反之***
            data.tag = 'place'
    
            //找出点击位置 为了添加弹出框（trans）
            selectedDiv = _this
            let thisAbPosition = _this.getBoundingClientRect()
            let thisCenterX = thisAbPosition.left + thisAbPosition.width/2 - 15
            let thisCenterY = thisAbPosition.top
            let transIcon = document.getElementsByClassName('trans-btn')
            // console.log(Math.round(thisCenterX) + 'px')
            let arc = Math.PI/(transIcon.length-1)
    
            for(let i = 0; i < transIcon.length; i++) {
                let x = Math.cos(arc*i)*50
                let y = Math.sin(arc*i)*50
                transIcon[i].style.left = Math.round(thisCenterX + x )+ 'px'
                transIcon[i].style.top = Math.round(thisCenterY + y )+ 'px'
                transIcon[i].style.opacity = 1
                transIcon[i].style.display = 'block'
                transIcon[i].addEventListener('click', selectTrans)
            }
        }


    // 取消起点
    } else if ((findStartPlace()) && _this.getAttribute('selected-place') === 'start') {
        _this.draggable = true
        // _this.style.backgroundColor = this.id ? '#fff' : '#BAC4D1'
        // _this.style.color = '#fff'
        let node = document.getElementsByClassName('place-hint-start')[0]
        _this.removeChild(node) // 这里有坑
        
        _this.removeAttribute('selected-place')
        // 还要记得重新绑定事件！
        // bindLabels()
        // selectPlaceState()

        // 如果起点是家，就取消
        if(data.uniq === 'home') {
            startHomeMark = false
        }

        data.tag = preDataStartTag // 当我选中这个标签的时候，赋予其 tag 为 place， 取消反之***

    // 取消终点
    } else if((findEndPlace()) && _this.getAttribute('selected-place') === 'end') {
        _this.draggable = true
        // _this.style.backgroundColor = this.id ? '#fff' : '#BAC4D1'
        // _this.style.color = '#fff'
   
        let node = document.getElementsByClassName('place-hint-end')[0]
        _this.removeChild(node) // 这里有坑 
        _this.removeAttribute('selected-place')
        // 还要记得重新绑定事件！
        // bindLabels() 
        // selectPlaceState()

         // 如果终点是家，就取消
         if(data.uniq === 'home') {
            startHomeMark = false
        }

        data.tag = preDataEndTag // 当我选中这个标签的时候，赋予其 tag 为 place， 取消反之***
        
        let transIcon = document.getElementsByClassName('trans-btn')
        for(let i = 0; i < transIcon.length; i++) {
            transIcon[i].style.opacity = 0
            transIcon[i].style.display = 'none'
        }
    }
    
}


window.addEventListener("resize", rePosition)
function rePosition() {
    if(selectedDiv) {
            // console.log(, '_this.getBoundingClientRect()')
        let thisAbPosition = selectedDiv.getBoundingClientRect()
        let thisCenterX = thisAbPosition.left + thisAbPosition.width/2 - 15
        let thisCenterY = thisAbPosition.top
        let transIcon = document.getElementsByClassName('trans-btn')
        // console.log(Math.round(thisCenterX) + 'px')
        let arc = Math.PI/(transIcon.length-1)

        for(let i = 0; i < transIcon.length; i++) {
            let x = Math.cos(arc*i)*50
            let y = Math.sin(arc*i)*50
            transIcon[i].style.left = Math.round(thisCenterX + x )+ 'px'
            transIcon[i].style.top = Math.round(thisCenterY + y )+ 'px'
            // transIcon[i].addEventListener('click', selectTrans)
        }
    }

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

// /* 给trans盘添加点击事件 */
function selectTrans(e) {
    let _this = e.target
    newPathObj.vehicle = _this.id

    if(newPathObj.name) {
        // 为了回溯: 放在添加路径之前
        pushBackList(createPathParentIndex)

        currentCase['track'][createPathParentIndex]['place'].splice(insertIndex, 0, newPathObj)
        showHint('路径添加成功！' , true)
        // 清空对象
        newPathObj = {}
    } else {
        showHint('路径已经存在！' , false)
    }
    
    // 联动修改 word-segment
    // 更新 word-segment 的 placeIndex
    let placeNum = 0
    currentCase['track'][createPathParentIndex]['word_segmentation'].forEach((item, index) => {
        if(currentCase['track'][createPathParentIndex]['place'][0].name === '' ) {
            if(item.tag === 'place' && placeNum < currentCase['track'][createPathParentIndex]['place'].length -1) {
                item.placeIndex = placeNum + 1
                placeNum++
            }
        } else {
            if(item.tag === 'place' && placeNum < currentCase['track'][createPathParentIndex]['place'].length) {
                item.placeIndex = placeNum
                placeNum++
            } 
        }
    })

    func()
    
    // createPathParentIndex = 0
    // insertIndex = 0

    // 关闭trans弹框
    let transIcon = document.getElementsByClassName('trans-btn')
    for(let i = 0; i < transIcon.length; i++) {
        transIcon[i].style.opacity = 0
        transIcon[i].style.display = 'none'
        transIcon[i].removeEventListener("click", selectTrans)
    }
    dataUpdate = true;
}

