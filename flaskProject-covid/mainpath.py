import sys
import json
import os

sys.path.append("C:/Users/82574/AppData/Local/Programs/Python/Python37/Lib/site-packages")
from pyhanlp import *
import csv
import json
import re
from collections import OrderedDict


def transport(test):
    transports = '自驾|私家车|打车|救护车|国航|120|急救车|步行|散步|出租车|航班|网约车|驾车|乘车|火车|公交|客车|列车|通勤车|旅游车|大巴|地铁|拼车|专用车辆'
    idf = 0
    idh = 0
    # h = 0
    transport = ''
    for k in range(0, len(test)):
        # h += 1
        m = re.search(transports, test[idf:])
        if m is None:
            # if h == 1:
            # y["transport" + str(h)] = ""
            # print("")
            break
        else:
            idh = test[idf:].find(m.group())
            idf = idf + idh + 1
            # y["transport" + str(h)] = m.group()
            # print(m.group())
            transport = m.group()
            if m.group() == "私家车" or m.group() == "自驾" or m.group() == "驾车" or m.group() == "乘车":
                transport = "car"
            elif m.group() == "客车" or m.group() == "公交" or m.group() == "通勤车" or m.group() == "旅游车" or m.group() == "大巴":
                transport = "bus"
            elif m.group() == "救护车" or m.group() == "120" or m.group() == "急救车" or m.group() == "120急救车" or m.group() == "专用车辆":
                transport = "emergency"
            elif m.group() == "国航" or m.group() == "航班":
                transport = "plane"
            elif m.group() == "火车" or m.group() == "列车":
                transport = "train"
            elif m.group() == "步行" or m.group() == "散步":
                transport = "walk"
            elif m.group() == "地铁":
                transport = "subway"
            elif m.group() == "出租车" or m.group() == "网约车" or m.group() == "拼车" or m.group() == "打车":
                transport = "taxi"
            # elif m.group() == "专用车辆":
            # transport = "others"
    return transport


def hanlp_ner(sentence):
    # 动态添加词典
    CustomDictionary = JClass("com.hankcs.hanlp.dictionary.CustomDictionary")
    CustomDictionary.add("哈", "ns")
    CustomDictionary.add("哈尔滨", "ns")
    CustomDictionary.add("京", "ns")
    CustomDictionary.add("市", "ns")
    CustomDictionary.add("延兴路", "ns")
    CustomDictionary.add("哈医大四院", "nt")
    CustomDictionary.add("隔离点", "nt")
    CustomDictionary.add("家乐福", "nt")
    CustomDictionary.add("厨掌柜", "nt")
    CustomDictionary.add("文海溪畔", "nt")
    CustomDictionary.add("乐松店", "nt")
    CustomDictionary.add("乐松广场", "nt")
    CustomDictionary.add("群力翠湖天地璞园", "nt")
    CustomDictionary.add("宝宇天邑澜山", "nt")
    CustomDictionary.add("春运加油站", "nt")
    CustomDictionary.add("经停", "v")
    CustomDictionary.add("购物", "v")
    CustomDictionary.add("到", "v")
    CustomDictionary.add("核酸", "d")
    CustomDictionary.add("阳性", "d")
    CustomDictionary.add("专家", "d")

    nz = ["隔离点", "定点医院", "小区", "医院", "诊所", "公司", "单位", "超市", "市场", "家", "住处", "居住地", "街"]
    nonNz = ["私家车", "居家"]
    geo_collection = ["ns", "nis", "nt", "ntu"]  # 地名、机构后缀、机构名、大学
    isConj = ["/n", "/a", "/s", "/nhd", "/m", "号", "（", "附属", "的"]
    nonConj = ["公交车"]  # "/v"
    segment = HanLP.newSegment().enableOrganizationRecognize(True)

    entity_arr = segment.seg(sentence)
    # arr = analyzer.seg(line)
    tadd = ''
    nadd = ''
    longs = []
    number = 0
    interval = 0
    isAdd = False
    for i, li in enumerate(entity_arr):
        a = str(li)
        # print(a)
        if (any(name in a for name in geo_collection) or (any(name in a for name in nz)) and not any(
                name in a for name in nonNz)):
            # print("a", a)
            if (isAdd == False):
                if (0 < interval < 3 and number == interval):
                    tadd = tadd + nadd
                    # print("+", nadd)
                else:
                    # print("test", tadd)
                    # 应该在这里 append，第一个出口，间隔词个数太多或不满足连接条件
                    if (tadd != '' and not any(tadd in name for name in longs)):
                        # tadd = tadd.replace("（", " ")  #去掉括号之类的  用正则表达式????????????????????????
                        longs.append(tadd)
                        # print("t", tadd)
                    tadd = ''
                isAdd = True
            # else:
            tadd = tadd + a.split("/")[0]
            # print("tadd", tadd)
            # 第二个出口，最后一个词，没有后续连接词
            # ///////////最后一项/////////////////////////////没有出现过//////////////////

        else:
            # print("n", a)
            if (isAdd == True):  # 第一次执行就是 False
                # print(nadd)
                nadd = ''
                interval = 0
                number = 0
                isAdd = False
            if ((any(name in a for name in isConj) or any(a in name for name in isConj)) and not any(
                    name in a for name in nonConj)):
                number = number + 1
                # print("+", a)
            nadd += a.split("/")[0]  # 没必要加吧
            interval = interval + 1

        if (i == len(entity_arr) - 1 and (not any(tadd in name for name in longs)) and tadd != ''):
            # tadd = tadd.replace("（", " ")  # 去掉括号之类的  用正则表达式????????????????????????
            longs.append(tadd)
            # print("end", tadd)
    # print(longs)
    # print('------')
    return longs


def addTag(place):
    place_tag = ''
    company = ["公司", "单位", "上班", "酒店"]
    home = ["家"]
    hospital = ["隔离点", "院", "诊所", "门诊", "药店", "药房", "卫生院"]
    market = ["超市", "蔬菜店", "市场", "菜场", "商场", "便利店", "仓买"]
    restaurant = ["餐厅", "饭店", "厨", "掌柜"]
    station = ["站"]
    if (any(name in place for name in hospital)):
        place_tag = 'hospital'
    elif (any(name in place for name in company)):
        place_tag = 'company'
    elif (any(name in place for name in market)):
        place_tag = 'market'
    elif ('家' in place):
        place_tag = 'home'
    elif (any(name in place for name in restaurant)):
        place_tag = 'restaurant'
    elif (any(name in place for name in station)):
        place_tag = 'station'
    return place_tag


def split(line, isFirstDay):
    pattern = r'，|。|；|、'
    text_list = re.split(pattern, line)
    path = []
    pre_tgt = ''
    if (isFirstDay == True):
        pre_tgt = '家'
    place_tag = ''
    for text in text_list:
        vehicle = transport(text)
        place_arr = hanlp_ner(text)
        place = ' '.join(hanlp_ner(text))
        place = place.replace("回家", "家")
        place = place.replace("到家", "家")

        if (place and ("由" in text or "从" in text) and len(place_arr) == 2):
            src = place.split()[0]
            src_tag = addTag(src)
            tgt = place.split()[1]
            tgt_tag = addTag(tgt)
            path.append({
                'source': {
                    'name': src,
                    'tag': src_tag
                },
                'target': {
                    'name': tgt,
                    'tag': tgt_tag
                },
                'vehicle': vehicle
            })
            pre_tgt = tgt
        elif (place and not place in pre_tgt):
            place_tag = addTag(place)
            path.append({
                'source': {
                    'name': pre_tgt,
                    'tag': addTag(pre_tgt)
                },
                'target': {
                    'name': place,
                    'tag': place_tag
                },
                'vehicle': vehicle
            })
            pre_tgt = place
            # print("t" + vehicle, "p" + place)
    # print(path)
    # print('------')
    return path


def segmentation(sentence, entities):
    # HanLP.Config.ShowTermNature = False  # 不显示词性
    ssegment = HanLP.newSegment().enableOrganizationRecognize(True)
    isSource = False
    pattern = r'，|。|；|、'
    paras = re.split(pattern, sentence)
    firstP = re.split(pattern, sentence)[0]
    firstP_longs = hanlp_ner(firstP)
    if (("由" in firstP or "从" in firstP) and len(firstP_longs) == 2):
        isSource = True
    if (len(paras) > 1):
        secondP = re.split(pattern, sentence)[1]
        secondP_longs = hanlp_ner(secondP)
        if (("由" in secondP or "从" in secondP) and len(secondP_longs) == 2):
            isSource = True

    places = []
    text = ''
    if (len(entities) > 0):
        next = ''
        for e, entity in enumerate(entities):
            print(e,entity)
            pre = sentence.split(entity, 1)[0]
            next = sentence.split(entity, 1)[1]
            vehicle = transport(pre + entity)
            print(pre,next)

            words_arr = ssegment.seg(pre)
            print(words_arr)
            words = ''
            for w in words_arr:
                word = str(w)
                words = words + ' ' + word
            if (isSource == False):
                text = text + words + ' ' + entity + '/place/' + str(e + 1)
            else:
                text = text + words + ' ' + entity + '/place/' + str(e)

            entity = entity.replace('回家', '家').replace('返家', '家').replace('到家', '家').replace('住处', '家').replace('居住地',
                                                                                                                '家').replace(
                '（', ' ')
            if (e == 0):
                if (isSource == False):
                    places.append({
                        'name': '',
                        'tag': ''
                    })
                    places.append({
                        'name': entity,
                        'tag': addTag(entity),
                        'vehicle': vehicle
                    })
                else:
                    places.append({
                        'name': entity,
                        'tag': addTag(entity)
                    })
            else:
                places.append({
                    'name': entity,
                    'tag': addTag(entity),
                    'vehicle': vehicle
                })
                if (e == len(entities)):
                    words_arr = ssegment.seg(next)
                    words = ''
                    for w in words_arr:
                        word = str(w)
                        words = words + ' ' + word
                    text = text + words
            sentence = next

        print(next)
        text = text.strip()  # 去掉字符串首尾空格
        next_arr = ssegment.seg(next)
        words_a = ''
        for w in next_arr:
            word = str(w)
            words_a = words_a + ' ' + word
        # print(places)
        print(text)
        print(words_a)
        print('------')
        obj = {}
        obj['places'] = places
        obj['text'] = text + words_a
        return obj
    else:
        words = ''
        words_arr = ssegment.seg(sentence)
        for w in words_arr:
            word = str(w)
            words = words + ' ' + word
        words = words.strip()
        # print(words)
        obj = {}
        obj['places'] = places
        obj['text'] = words
        return obj


def basic_message(message):
    m = []
    y = OrderedDict()

    gender = "男|女"
    isgender = re.search(gender, message)
    if isgender is None:
        y["gender"] = ""
    else:
        y["gender"] = isgender.group()

    punctuation = ",|，|。|；|;|（| "
    ispunctuation = re.search(punctuation, message)
    if ispunctuation is None:
        y["name"] = ""
    else:
        y["name"] = message[0:ispunctuation.span()[0]]

    isage = re.search('\d+岁',message)
    if isage is None:
        y["age"] = ""
    else:
        y["age"] = isage.group()

    current_address_delete1 = "长住|长期居住|现居住|现住址为|现居住地为|居住在|居住：|居住于|福建家庭住址：|系|现住址于|常住地|现住址："
    current_address_delete2 = "家住|现居|居住|现住|现住址|住|居民|在"

    isadress1 = re.search(current_address_delete1, message)
    isadress2 = re.search(current_address_delete2, message)

    if isadress1 is None:
        if isadress2 is None:
            y["current_address"] = ""
        else:
            y["current_address"] = message[isadress2.span()[1]:]
    else:
        y["current_address"] = message[isadress1.span()[1]:]
    m.append(y)
    return m


def everydayTrack(track):
    # isday = re.compile("\d+年\d+月\d+日\d+时\d+分|\d+年\d+月\d+日\d+时|\d+月\d+日\d+时\d+分|\d+月\d+日\d+时|\d+年\d+月\d+日|\d+月\d+日|\d+日")
    isday = re.compile("\d*年?\d+月\d+日\d*时?\d*分?至\d*年?\d+月\d+日\d*时?\d*分?|\d*年?\d+月\d+日\d*时?\d*分?")
    time = isday.findall(track)
    way = []
    for k in range(len(time), 0, -1):
        print(k, time[k - 1])
        isway = track.rfind(time[k - 1])
        way.append(track[isway + len(time[k - 1])+1:])
        track = track[0:isway]

    path = []
    isFirstDay = True
    # print(way)

    health = 0  # 判断是否有健康时期
    healthy = 0  # 标识发病期后的每一天
    hea = "武汉|确诊病例"
    for k in range(len(way),0,-1):
        message = way[k-1]
        head = re.search(hea, message)
        if head is None:
            health = 0
        else:
            health = 1
            break

    for j in range(len(way), 0, -1):
        z = OrderedDict()
        z["date"] = time[len(time)-j]
        behaviours = way[j-1]
        hel = "就诊|诊治|120急救车|隔离点|治疗|医院"
        he = re.search(hel, behaviours)

        head = re.search(hea, behaviours)
        if health == 1:
            if head is None:
                z["health_status"] = "健康"
            else:
                z["health_status"] = "潜伏期"
                health = 0
        else:
            if healthy == 1:
                z["health_status"] = "发病期"
            elif he is None:
                z["health_status"] = "潜伏期"
            elif "亲属" in behaviours or "母亲" in behaviours:
                z["health_status"] = "潜伏期"
            else:
                z["health_status"] = "发病期"
                healthy = 1

        entities = hanlp_ner(behaviours)
        z["place"] = segmentation(behaviours, entities)['places']
        z["word_segmentation"] = segmentation(behaviours, entities)['text']
        z["sentence"] = behaviours
        isFirstDay = False
        path.append(z)
    return path





