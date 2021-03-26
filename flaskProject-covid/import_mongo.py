from pymongo import *
import json
from bson import ObjectId

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

class JsonToMongo(object):
    def __init__(self):
        self.host = '182.92.174.94'
        self.port = 27017

    def write_database(self, data, file):

        # 创建mongodb客户端
        self.client = MongoClient(self.host, self.port)

        # 创建数据库
        self.db = self.client.covid19
        # 创建集合
        self.db.authenticate("covid19", "covid1920")

        self.collection = self.db[file]

        try:
            self.collection.insert_one(data)
            print("写入成功")
        except Exception as e:
            print(e)


# if __name__ == '__main__':
# data1 = {"name": "RUNOOB", "alexa": "10000", "url": "https://www.runoob.com"}
# file = "beijing-6"
# JsonToMongo().write_database(data1,file)
