from flask import Flask
from flask import render_template
from flask import request
from collections import OrderedDict
import mainpath
import json
from bson import json_util
import import_mongo

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/test', methods=['POST', 'GET'])
def track():
    rev = request.get_json()
    obj = {}
    file_input = "input-data"
    import_mongo.JsonToMongo().write_database(json.loads(json_util.dumps(rev)), file_input)
    obj["province"] = rev["province"]
    obj["city"] = rev["city"]
    obj["District / County"] = rev["place"]
    obj["patient_information"] = mainpath.basic_message(rev["user_name"])
    obj["release_date"] = rev["pub_time"]
    obj["track"] = mainpath.everydayTrack(rev["track"])
    file_deal = "input-deal"
    # print(obj)
    print(type(obj))
    # import_mongo.JsonToMongo().write_database(import_mongo.JSONEncoder().encode(obj), file_deal)
    import_mongo.JsonToMongo().write_database(json.loads(json_util.dumps(obj)), file_deal)
    return obj


@app.route('/update', methods=['POST', 'GET'])
def dataUpdate():
    data_update = request.get_json()
    print(data_update)
    file_update = "update-data"
    import_mongo.JsonToMongo().write_database(json.loads(json_util.dumps(data_update)), file_update)
    return data_update


if __name__ == '__main__':
    app.run()
