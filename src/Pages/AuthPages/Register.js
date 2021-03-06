import React, {useState} from "react";
import axios from 'axios'
import swal from 'sweetalert'

import { Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import background from "../../assets/login.jpg";
import "./style.css";


function Register(props) {
  const [data, setData] = useState({})
  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/signup', data).then(res => {
      console.log(res)
      swal("Success", "Successfully registered, please login first", "success").then(r => window.location.href = '/login')
      
    }).catch(err => swal("Failed", "Email address already registered", "error"))
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-8 p-0 m-0">
          <div className="img-container">
            <img src={background} alt="" />
          </div>
        </div>
        <div className="col-md-4 login-container p-0 m-0 d-flex justify-content-center align-items-center vh-100">
          <div className="w-75">
            <h1
              className="font-weight-bold text-center"
              style={{ color: "#7d7878" }}
            >
              SIGN UP
            </h1>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  className="position-absolute mt-3"
                >
                  <title>letter</title>
                  <g
                    strokeWidth="1"
                    fill="none"
                    stroke="#212121"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11.5,5.5v4a1,1,0,0,1-1,1h-9a1,1,0,0,1-1-1v-4"></path>
                    <path
                      d="M11.5,3.5v-1a1,1,0,0,0-1-1h-9a1,1,0,0,0-1,1v1L6,6.5Z"
                      stroke="#212121"
                    ></path>
                  </g>
                </svg>
                <Form.Control
                  type="email"
                  placeholder="Email"
                  className="input"
                  onChange={e => setData({...data, "email": e.target.value})}
                />
                <span className="underline"></span>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicName">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  className="position-absolute mt-3"
                >
                  <title>profile</title>
                  <g
                    strokeWidth="1"
                    fill="none"
                    stroke="#212121"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="6" cy="2.5" r="2" stroke="#212121"></circle>
                    <path d="M6,6.5a5,5,0,0,0-5,5H11A5,5,0,0,0,6,6.5Z"></path>
                  </g>
                </svg>
                <Form.Control
                  type="text"
                  placeholder="Full Name"
                  className="input"
                  onChange={e => setData({...data, "name": e.target.value})}
                />
                <span className="underline"></span>
              </Form.Group>

              <Form.Group className="mb-4" controlId="formBasicPassword">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  className="position-absolute mt-3"
                >
                  <title>lock</title>
                  <g
                    strokeWidth="1"
                    fill="none"
                    stroke="#212121"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path
                      d="M3.5,5.5V3A2.5,2.5,0,0,1,6,.5H6A2.5,2.5,0,0,1,8.5,3V5.5"
                      stroke="#212121"
                    ></path>{" "}
                    <rect x="1.5" y="5.5" width="9" height="6"></rect>
                  </g>
                </svg>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  className="input"
                  onChange={e => setData({...data, "password": e.target.value})}
                />
                <span className="underline"></span>
              </Form.Group>
              <center>
                <Button className="" variant="primary" type="submit">
                  Sign Up
                </Button>
              </center>
            </Form>
            <div>
              <p
                className="text-dark text-center mt-4"
                style={{ fontSize: "12px" }}
              >
                Have an Account? <Link to="/login">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
