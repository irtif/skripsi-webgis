from flask import Flask
import werkzeug, os, time, copy
from flask_restful import Api, Resource, reqparse, fields, marshal_with, abort
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
api = Api(app)
UPLOAD_DIR = "E:/_PROJECT/flask_reactjs/api/files"
ALLOWED_EXTENSIONS = {'csv'}

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

class FileModel(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  file = db.Column(db.String(50), nullable=False)

  def __repr__(self):
    return f"File(file={self.file}"

# db.create_all()

file_add_arg = reqparse.RequestParser()
file_add_arg.add_argument("file", type=werkzeug.datastructures.FileStorage, location="files", help="File is required", required=True)

file_upt_arg = reqparse.RequestParser()
file_upt_arg.add_argument("file", type=werkzeug.datastructures.FileStorage, location="files")

resource_fields = {
  'id': fields.Integer,
  'file': fields.String
}

class Files(Resource):
  @marshal_with(resource_fields)
  def get(self):
    res = FileModel.query.all()
    return res

class File(Resource):
  @marshal_with(resource_fields)
  def get(self, id):
    res = FileModel.query.filter_by(id=id).first()
    if not res:
      abort(404, message="File doesn't exist")
    return res, 200
  
  def post(self, id):
    arg = file_add_arg.parse_args()
    res = FileModel.query.filter_by(id=id).first()
    if res:
      abort(404, message="File already exist")
    file = arg['file']
    file_name = file.filename.replace('.csv', f"_{str(time.time())}.csv")
    
    data = FileModel(id=id, file=file_name)

    if not os.path.isdir(UPLOAD_DIR):
      os.mkdir(UPLOAD_DIR)

    file.save(f"{UPLOAD_DIR}/{file_name}")
    db.session.add(data)
    db.session.commit()
    return {"message": "Data Created Successfully"}

  @marshal_with(resource_fields)
  def patch(self, id):
    arg = file_upt_arg.parse_args()
    file = arg['file']
    file_name = file.filename.replace('.csv', f'_{str(time.time())}.csv')

    res = FileModel.query.filter_by(id=id).first()  
    if not res:
      abort(404, message="File doesn't exist")

    os.remove(UPLOAD_DIR + '/' + res.file)
    res.file = file_name
    file.save(UPLOAD_DIR + '/' + file_name)
    db.session.commit()
    return res

  def delete(self, id):
    res = FileModel.query.filter_by(id=id).first()
    if not res:
      abort(404, message="File doesn't exist")
    os.remove(UPLOAD_DIR + '/' + res.file)
    db.session.delete(res)
    db.session.commit()
    return {'message' : 'Successfully deleted'}, 200

api.add_resource(File, '/file/<int:id>')
api.add_resource(Files, '/files')

if __name__ == "__main__":
  app.run(debug=True)