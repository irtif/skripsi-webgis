from flask import Flask, jsonify
from flask.helpers import send_from_directory
import werkzeug, os, time
from flask_restful import reqparse, fields, marshal_with, abort
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
UPLOAD_DIR = "E:/_PROJECT/flask_reactjs/api/files"
ALLOWED_EXTENSIONS = {'csv'}

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

class FileModel(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  file = db.Column(db.String(50), nullable=False)

  def __repr__(self):
    return f"File(file={self.file}"

db.create_all()

file_add_arg = reqparse.RequestParser()
file_add_arg.add_argument("file", type=werkzeug.datastructures.FileStorage, location="files", help="File is required", required=True)

file_upt_arg = reqparse.RequestParser()
file_upt_arg.add_argument("file", type=werkzeug.datastructures.FileStorage, location="files")

resource_fields = {
  'id': fields.Integer,
  'file': fields.String
}

def file_serializer(file):
  return{
  'id': file.id,
  'file': file.file
}

@app.route('/files', methods=['GET'])
def getAll():
  res = FileModel.query.all()
  return jsonify([*map(file_serializer, res)])

@app.route('/file/<int:id>', methods=['GET'])
@marshal_with(resource_fields)
def get(id):
  res = FileModel.query.filter_by(id=id).first()
  if not res:
    abort(404, message="File doesn't exist")
  return res

@app.route('/file', methods=['POST'])
@marshal_with(resource_fields)
def post():
    arg = file_add_arg.parse_args()
    file = arg['file']
    file_name = file.filename.replace('.csv', f"_{str(time.time())}.csv")
    
    data = FileModel(file=file_name)

    if not os.path.isdir(UPLOAD_DIR):
      os.mkdir(UPLOAD_DIR)

    file.save(f"{UPLOAD_DIR}/{file_name}")
    db.session.add(data)
    db.session.commit()
    return data

@app.route('/file/<int:id>', methods=['PATCH'])
@marshal_with(resource_fields)
def patch(id):
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

@app.route('/file/<int:id>', methods=['DELETE'])
def delete(id):
  res = FileModel.query.filter_by(id=id).first()
  if not res:
    abort(404, message="File doesn't exist")
  os.remove(UPLOAD_DIR + '/' + res.file)
  db.session.delete(res)
  db.session.commit()
  return {'message' : 'Successfully deleted'}, 200

@app.route('/download/<string:name>', methods=['GET'])
def get_file(name):
  return send_from_directory(directory=UPLOAD_DIR, path=name)

if __name__ == "__main__":
  app.run(debug=True)