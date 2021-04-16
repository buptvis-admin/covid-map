/* 开始交互 */
var targetPlaceText = '';
var dragDiv = document.createElement('div')
dragDiv.classList.add('drag-box')
var body = document.getElementsByTagName('body')[0]
body.appendChild(dragDiv)
// document.onselectstart = () => false;
// document.ondragstart = () => false;
var mouseStartX, mouseStartY, mouseOffsetX, mouseOffsetY;
var backToMergeList = [];
var cloneNodeForDrag = null;
var highlightBgColor = '#455b7c' //'#6FAAFF'

function dragEnd(data, index) {

// if(wasMoved) {
    // 删除浮动标签
    let hoverLabel = document.getElementById('hover-label')
    hoverLabel.parentNode.removeChild(hoverLabel)

    let _this = d3.select(this) // 元素距离左边界的距离
    _this.node().style.backgroundColor = themeBgColor
    _this.node().style.color = themeFontColor
    let thisIndex = index


    mouseOffsetX =  d3.event.sourceEvent.clientX - mouseStartX
    mouseOffsetY =  d3.event.sourceEvent.clientY - mouseStartY

    let thisOffsetLeft = _this.node().offsetLeft + mouseOffsetX
    let thisOffsetTop = _this.node().offsetTop + mouseOffsetY

    let thisOffsetRight = thisOffsetLeft + _this.node().offsetWidth
    let thisOffsetBottom = thisOffsetTop + _this.node().offsetHeight
   //console.log(thisOffsetLeft, thisOffsetTop, thisOffsetRight, thisOffsetBottom, 'this')

   // 找到点击的标签的 当前parent 的index，然后在这个范围内去碰撞检测
   let nowparentIndex = _this.node().parentNode.parentNode.getAttribute('track-text-index')
   let labelList = d3.selectAll('.track-text__label-' + nowparentIndex)

   // 循环这个范围内的所有标签，不包括自己
   labelList.each(function(eachData, j) {

        let _eachThis = d3.select(this)
        let spanLabelsOffsetLeft = _eachThis.node().offsetLeft
        let spanLabelsOffsetTop = _eachThis.node().offsetTop

        let spanLabelsOffsetRight = spanLabelsOffsetLeft + _eachThis.node().offsetWidth
        let spanLabelsOffsetBottom = spanLabelsOffsetTop + _eachThis.node().offsetHeight

        // 为了 碰撞检测
        let noIndex = index !== j // 不包括自己碰撞
        let draggable = _eachThis.node().getAttribute('draggable') // 只能和draggable的碰撞

        if(noIndex && draggable == 'true') {

            if ((thisOffsetRight > spanLabelsOffsetLeft)
                && (thisOffsetLeft < spanLabelsOffsetRight)
                && (thisOffsetBottom > spanLabelsOffsetTop)
                && (thisOffsetTop < spanLabelsOffsetBottom)) {

                    _eachThis.node().style.backgroundColor = highlightBgColor
                    _eachThis.node().style.color = '#fff'

                    let nextIndex = j
                    let parentIndex = Number(_eachThis.node().parentNode.parentNode.getAttribute('track-text-index'))

                    // 为了回溯
                    pushBackList(parentIndex)
                    // console.log(backToMergeObj.wordList, 'backToMergeObj.wordList')
                    // 为了回溯结束

                    let newLabelText = '';
                    if(nextIndex > thisIndex) {
                        newLabelText =  data.content +  eachData.content
                    } else {
                        newLabelText =  eachData.content +  data.content
                    }
                    // console.log(nextIndex, thisIndex, 'newLabelText')

                    // 当我拼接的这两个词，其中有placeIndex，就拿这个去替换place数组的元素
                    let placeIndex;
                    if (eachData.placeIndex !== undefined) {
                        placeIndex = eachData.placeIndex
                        currentCase['track'][ parentIndex ]['word_segmentation'][nextIndex].content = newLabelText
                        currentCase['track'][ parentIndex ]['word_segmentation'][nextIndex].new = true
                        currentCase['track'][ parentIndex ]['place'][ placeIndex ].name = newLabelText
                        currentCase['track'][ parentIndex ]['word_segmentation'].splice(thisIndex, 1)

                        func(cityData);
                        showHint('合并成功！地图更新', true)

                        // _eachThis.node().style.opacity = 0.5
                        // _this.node().style.opacity = 0.5

                    } else if (data.placeIndex !== undefined) {
                        placeIndex = data.placeIndex
                        currentCase['track'][ parentIndex ]['word_segmentation'][thisIndex].content = newLabelText // 更新
                        currentCase['track'][ parentIndex ]['word_segmentation'][thisIndex].new = true
                        currentCase['track'][ parentIndex ]['place'][ placeIndex ].name = newLabelText // 替换
                        currentCase['track'][ parentIndex ]['word_segmentation'].splice(nextIndex, 1) // 删除

                        func(cityData);

                        showHint('合并成功!地图更新', true)

                        // _eachThis.node().style.opacity = 0.5
                        // _this.node().style.opacity = 0.5

                    } else {
                        currentCase['track'][ parentIndex ]['word_segmentation'][nextIndex].content = newLabelText
                        currentCase['track'][ parentIndex ]['word_segmentation'][nextIndex].new = true
                        currentCase['track'][ parentIndex ]['word_segmentation'].splice(thisIndex, 1)
                    }

                    createPanel() // 重绘所有dom

                    //标签合并后高亮
                    let nowparentIndex = _this.node().parentNode.parentNode.getAttribute('track-text-index')
                    let labelList = d3.selectAll('.track-text__label-' + nowparentIndex)
                    labelList.each(function(eachData, j) {
                        if (eachData.new === true) {

                            let _eachThis = d3.select(this)
                            _eachThis.node().style.backgroundColor = highlightBgColor
                            _eachThis.node().style.color = '#fff'

                            setTimeout(function() {
                                _eachThis.node().style.backgroundColor = themeBgColor
                                _eachThis.node().style.color = themeFontColor
                            },250)
                            eachData.new = false
                        }

                    })

                }
            }
        })
    // }
    // wasMoved = false;
    dataUpdate = true;
}

function draged(data,index) {

    let _this = d3.select(this)
    _this.node().style.backgroundColor = themeBgColor
    _this.node().style.color = themeFontColor

    mouseOffsetX =  d3.event.sourceEvent.clientX - mouseStartX
    mouseOffsetY =  d3.event.sourceEvent.clientY - mouseStartY

    let thisOffsetLeft = _this.node().offsetLeft + mouseOffsetX
    let thisOffsetTop = _this.node().offsetTop + mouseOffsetY

    let thisOffsetRight = thisOffsetLeft + _this.node().offsetWidth
    let thisOffsetBottom = thisOffsetTop + _this.node().offsetHeight
   //console.log(thisOffsetLeft, thisOffsetTop, thisOffsetRight, thisOffsetBottom, 'this')

    // clone 一个 node  // 悬浮小标签
    cloneNodeForDrag.style.top = d3.event.sourceEvent.clientY - _this.node().offsetHeight/2+ 'px'
    cloneNodeForDrag.style.left = d3.event.sourceEvent.clientX - _this.node().offsetWidth/2+ 'px'
    cloneNodeForDrag.style.zIndex = '10000'
    cloneNodeForDrag.style.fontSize = '12px'
    cloneNodeForDrag.style.opacity = '.8'

   // 找到点击的标签的 当前parent 的index，然后在这个范围内去碰撞检测
    let parentIndex = _this.node().parentNode.parentNode.getAttribute('track-text-index')
    let labelList = d3.selectAll('.track-text__label-' + parentIndex)
    // 循环这个范围内的所有标签，不包括自己
    labelList.each(function(p, j) {
        let _eachThis = d3.select(this)

        let spanLabelsOffsetLeft = _eachThis.node().offsetLeft
        let spanLabelsOffsetTop = _eachThis.node().offsetTop

        let spanLabelsOffsetRight = spanLabelsOffsetLeft + _eachThis.node().offsetWidth
        let spanLabelsOffsetBottom = spanLabelsOffsetTop + _eachThis.node().offsetHeight


        // let nextIndex = j
        let noIndex = index !== j // 不包括自己碰撞
        let draggable = _eachThis.node().getAttribute('draggable') // 只能和draggable的碰撞

        if(noIndex && draggable == 'true'){
            _eachThis.node().style.backgroundColor = themeBgColor
            _eachThis.node().style.color = themeFontColor
        }

        if(noIndex && draggable == 'true') {

            if ((thisOffsetRight > spanLabelsOffsetLeft)
                && (thisOffsetLeft < spanLabelsOffsetRight)
                && (thisOffsetBottom > spanLabelsOffsetTop)
                && (thisOffsetTop < spanLabelsOffsetBottom)) {

                    _eachThis.node().style.backgroundColor = highlightBgColor
                    _eachThis.node().style.color = '#fff'

                }
        }

   })

}

function dragStart(d) {
    // d3.event.sourceEvent.stopPropagation();
    mouseStartX = d3.event.sourceEvent.clientX // 获取相对于body的坐标
    mouseStartY = d3.event.sourceEvent.clientY

    // 悬浮小标签
    cloneNodeForDrag = d3.select(this).node().cloneNode('deep')
    document.getElementsByTagName('body')[0].appendChild(cloneNodeForDrag)
    cloneNodeForDrag.setAttribute('id', 'hover-label')
}


// 撤销操作
function backToMerge(currentCaseId) {

   if (backToMergeList.length > 0) {

       let backToMergeListId = backToMergeList.map(d=>d.currentCaseId)

       // 如果当前的 currentCaseId 存在于 backToMergeListId中
       if (backToMergeListId.indexOf(currentCaseId) !== -1) {
           // 在 backToMergeList 中找到第一个匹配的 id， pop出去
            for (let i = backToMergeList.length-1; i >= 0 ; i--) {
                if (backToMergeList[ i ].currentCaseId === currentCaseId) {
                    // 还原撤销注意：一定要对应 currentCase
                    let nowParentIndex = backToMergeList[ i ].parentIndex
                    currentCase['track'][ nowParentIndex ]['word_segmentation'] = backToMergeList[ i ].wordList
                    currentCase['track'][ nowParentIndex ]['place'] = backToMergeList[ i ].placeList
                    backToMergeList.splice(i, 1)

                    createPanel();  // 重绘所有dom
                    drawTrack(currentCase);
                    break;
                }
            }
       }

   }

}

function pushBackList(parentIndex) {
    let backToMergeObj = {}
    backToMergeObj.currentCaseId = currentCase._id
    backToMergeObj.parentIndex = parentIndex
    backToMergeObj.wordList = JSON.parse(JSON.stringify(currentCase['track'][ parentIndex ]['word_segmentation']))
    backToMergeObj.placeList = JSON.parse(JSON.stringify(currentCase['track'][ parentIndex ]['place']))
    backToMergeList.push(backToMergeObj)
    // console.log(backToMergeList, 'push成功')
}
