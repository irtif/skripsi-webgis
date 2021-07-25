from flask import Flask, jsonify
from flask.helpers import send_from_directory
import werkzeug, os
from werkzeug.security import generate_password_hash, check_password_hash
from flask_restful import reqparse, fields, marshal_with, abort
from flask_sqlalchemy import SQLAlchemy

from app import data_mining_process


app = Flask(__name__)
UPLOAD_DIR = "E:/_PROJECT/flask_reactjs/api/files"
ALLOWED_EXTENSIONS = {'csv'}

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

class User(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  email = db.Column(db.String(100), unique=True)
  name = db.Column(db.String(100))
  password = db.Column(db.String(100))

class FileModel(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  file = db.Column(db.String(50), nullable=False)

  def __repr__(self):
    return f"File(file={self.file}"

# db.create_all()

signup_args = reqparse.RequestParser()
signup_args.add_argument("email")
signup_args.add_argument("name")
signup_args.add_argument("password")

login_args = reqparse.RequestParser()
login_args.add_argument("email")
login_args.add_argument("password")



# --- AUTH CONTROLLER --- #
@app.route('/signup', methods=['POST'])
def signup():
  # code to validate and add user to database goes here
  args = signup_args.parse_args()
  user = User.query.filter_by(email=args['email']).first()
  if user:
    return "email address already registered"
  # create a new user with the form data. Hash the password so the plaintext version isn't saved.
  new_user = User(email=args["email"], name=args["name"], password=generate_password_hash(args["password"], method='sha256'))
  db.session.add(new_user)
  db.session.commit()
  return 'successfully registered'

@app.route('/login', methods=['POST'])
def login():
  args = login_args.parse_args()

  user = User.query.filter_by(email=args["email"]).first()
  
  if not user or not check_password_hash(user.password, args["password"]):
    return "Please check your login details and try again."
  
  return "login successfully"
  
# --- FILE CONTROLLER --- #
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
    file_name = file.filename
    
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
  file_name = file.filename

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


# @app.route('/execute/<string:file_name>', methods=['GET'])
# def execute(file_name):
#   return data_mining_process(file_name)


if __name__ == "__main__":
  app.run(debug=True)