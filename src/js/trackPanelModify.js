// var isModifyPlace = false
// function modifyPlaceState() {
//     if(!isModifyPlace) {
//         document.getElementById('modify-place__btn').style.opacity = .3
//         document.getElementById('select-place__btn').style.opacity = 1

//         // 清空所有选择
//         createPanel()

//         currentCase.track.forEach((item, index) => {
//             d3.selectAll('.track-text__label-' + index )
//             .call(
//                 d3.drag()
//                 // .clickDistance(400)
//                 .on("start", null)
//                 .on("drag", null)
//                 .on("end", null)
//             )
//             .on('dblclick', modifyPlace)
//             .on('click', null)
//         })

//         isModifyPlace = true
//         isSelectPlace = false

//         d3.select('#place-home__btn')
//         .on('click', null)

//         // 清空所有选择
//         let transIcon = document.getElementsByClassName('trans-btn')
//         for(let i = 0; i < transIcon.length; i++) {
//             transIcon[i].style.opacity = 0
//             transIcon[i].style.display = 'none'
//         }
//     } else {
//         document.getElementById('modify-place__btn').style.opacity = 1
//         currentCase.track.forEach((item, index) => {
//             d3.selectAll('.track-text__label-' + index )
//             .call(
//                 d3.drag()
//                 // .clickDistance(400)
//                 .on("start", dragStart)
//                 .on("drag", draged)
//                 .on("end", dragEnd)
//             )
//             .on('dblclick', null)
//             // .on('dblclick', null)
//             .on('click', null)
//         })

//         d3.select('#place-home__btn')
//         .on('click', null)

//         if (document.getElementById('modi-input')) {
//             document.getElementById('modi-input').parentNode.innerHTML = document.getElementById('modi-input').value
//         }

//         isModifyPlace = false   
//         isSelectPlace = true  
//     }
// }


function modifyPlace(data, index) {
    d3.event.stopPropagation(); // 没用！！！?
    // 我只append一次
    let _this = d3.select(this).node()

    if (!document.getElementById('modi-input')) {
        let modiInput = document.createElement('input')
        modiInput.setAttribute('id', 'modi-input')
        // modiInput.classList.add('modi-input')
        modiInput.value = _this.innerHTML
        modiInput.style.width = modiInput.value.length * 12 + 'px'
        _this.innerHTML = ''
        _this.appendChild(modiInput)
    } else {
        document.getElementById('modi-input').parentNode.innerHTML = document.getElementById('modi-input').value
    }

    document.onkeydown=function(ev){
        var event = ev || event
        if(event.keyCode == 13){
         
            if (document.getElementById('modi-input').value.indexOf(' ') !== -1) {
                let newWords = document.getElementById('modi-input').value.split(' ')
 
                let parentIndex = Number(_this.parentNode.parentNode.getAttribute('track-text-index'))

                // 为了回溯
                pushBackList(parentIndex)

                // 最后一个不更新， 其他都更新
                let newWordsObjList = []
                newWords.forEach((w, i) => {
                    if (i !== newWords.length-1) {
                        let obj = {}
                        obj.content = w
                        obj.tag = 'n'
                        obj.placeIndex = undefined
                        newWordsObjList.push(obj)
                    } else {
                        currentCase['track'][ parentIndex ]['word_segmentation'][index].content = w
                        // 如果分的这个词里边 tag 有 place，那么就更新这个 place
                        if (data.tag === 'place') {
                            currentCase['track'][ parentIndex ]['place'][data.placeIndex].name = w
                            showHint('标签分离，地图更新', true)
                        }

                    }
                })
              
                // 添加到 word-segment 里边
                newWordsObjList.forEach((obj, i) => {
                    currentCase['track'][ parentIndex ]['word_segmentation'].splice(index, 0, obj)
                    index += 1
                })

                document.getElementById('modi-input').parentNode.removeChild(document.getElementById('modi-input'))
                

                createPanel()
                func(cityData)
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
                
            } else {
                // 什么都没改 & 更新这个词
                let parentIndex = Number(_this.parentNode.parentNode.getAttribute('track-text-index'))
                
                currentCase['track'][ parentIndex ]['word_segmentation'][index].content = document.getElementById('modi-input').value
                if (data.tag === 'place') {
                    currentCase['track'][ parentIndex ]['place'][data.placeIndex].name = document.getElementById('modi-input').value
                } 
                createPanel()
                func(cityData)
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

                // document.getElementById('modi-input').parentNode.innerHTML = document.getElementById('modi-input').value

                // console.log(currentCase['track'][ parentIndex ]['word_segmentation'],  '@@@@')
                // console.log(currentCase['track'][ parentIndex ]['place'][data.placeIndex], '###')
                // document.getElementById('modi-input').parentNode.removeChild(document.getElementById('modi-input'))
            }
            // alert("修改成功")

        }
    }
}

// createPanel()
// d3.select('#track-info__box').on('click', function() {

//     if (document.getElementById('modi-input')) {
//         document.getElementById('modi-input').parentNode.innerHTML = document.getElementById('modi-input').value
//     }
// })
