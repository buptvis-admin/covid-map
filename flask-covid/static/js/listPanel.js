// 生成病例列表
function createUserList(data, cityData) {
    var list_wrapper = document.getElementById('user-list__content');
    list_wrapper.innerHTML = '';
    data.forEach((d,i) => {
        var format_date = d3.timeParse("%Y-%m-%d")(d.release_date.split(' ')[0]);
        var date = d3.timeFormat("%m/%d")(format_date);
        var address = d.patient_information[0].current_address; //住址

        var patt = /为|地：/;
        if (address.search(patt) > -1) {
            address = address.split(patt)[1];
        }
            
        var block = address; //街区
        if (block.length > 6) {
            block = block.slice(0, 5) + "...";
        }

        var case_wrapper = document.createElement('div');
        case_wrapper.className = 'user-list__case';

        /*var portrait_span = document.createElement('div');
        portrait_span.className = 'case_title_img';
        case_wrapper.appendChild(portrait_span);*/

        var date_span = document.createElement('span');
        date_span.className = 'case_title_date';
        date_span.innerHTML = date;
        case_wrapper.appendChild(date_span);

        var id_span = document.createElement('span');
        id_span.className = 'case_title_id';
        id_span.innerHTML = '病例 ' + (i+1);
        case_wrapper.appendChild(id_span);

        var block_span = document.createElement('span');
        block_span.className = 'case_title_block';
        block_span.innerHTML = block;
        case_wrapper.appendChild(block_span);

        var address_wrapper = document.createElement('div');
        address_wrapper.className = 'case_body';
        //address_wrapper.style.visibility = 'hidden'
        address_wrapper.innerHTML = address;
        case_wrapper.appendChild(address_wrapper);

        case_wrapper.onclick = function() {
            // console.log(canBeClicked);
            //if (canBeClicked == true) {
                //判断数据是否更新
                if(dataUpdate == true){
                    $.ajax({
                        type: 'POST',
                        url: "/update",
                        data:JSON.stringify(currentCase),
                        contentType: 'application/json; charset=UTF-8',
                        success:function(data_2){ //成功的话，得到消息
                            console.log(data_2);
                        }
                    })
                }
                dataUpdate = false;

                canBeClicked = false;
                var cases = this.parentNode.childNodes;
                cases.forEach(case_item => {
                    case_item.style.height = "18px";
                    case_item.childNodes[2].style.opacity = 1;
                    case_item.childNodes[3].style.opacity = 0;
                });
                var add_length = address.length;
                if (add_length > 14) {
                    //console.log(address)
                    this.style.height = "57.2px";
                } else {
                    this.style.height = "42px";
                }
                this.childNodes[2].style.opacity = 0;
                this.childNodes[3].style.opacity = 1;

                index = i;
                currentCase = data[i];
                func(cityData);

                wordSegmentation()
                createPanel()
                console.log(cityData,currentCase)
                isSelectPlace = false
                isModifyPlace = false
                // document.getElementById('modify-place__btn').style.opacity = 1
                document.getElementById('select-place__btn').style.opacity = 1
            //}                
        }
        list_wrapper.appendChild(case_wrapper);
    });
}

// 改变列表顺序
function reorder(element,data) {
    element.className = 'order_active';
    if (element.id == 'btn_time') {
        //document.getElementById('btn_distance').className = 'order';
        data.sort((a,b) => {
            return Date.parse(b.release_date.replace(/-/g,"/"))-Date.parse(a.release_date.replace(/-/g,"/"));
        });
    } else {
        document.getElementById('btn_time').className = 'order';
    }
    //console.log("reorder", data)
    currentCase = data[0];
    createUserList(data);
    func(cityData);
}
