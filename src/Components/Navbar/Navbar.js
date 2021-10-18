import React from "react";
import image from "../../assets/anime3.png";
import logo from "../../assets/logo.jpg";
import { Link } from "react-router-dom";

function Navbar(props) {

  const Logout = () => {
    localStorage.removeItem(("satlatic_token"));
    window.location.href = '/login'
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-absolute navbar-transparent">
      <div className="container-fluid">
        <div className="navbar-wrapper">
          <div className="navbar-toggle d-inline">
            <button type="button" className="navbar-toggler">
              <span className="navbar-toggler-bar bar1"></span>
              <span className="navbar-toggler-bar bar2"></span>
              <span className="navbar-toggler-bar bar3"></span>
            </button>
          </div>
          <Link className="navbar-brand" to="/dashboard">
            <img
              src={logo}
              alt="logo_satlantas"
              width="50"
              className="rounded-circle"
            />{" "}
            <span className="h5 text-white font-weight-bold">
              SATLANTAS MAKASSAR
            </span>
          </Link>
        </div>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navigation"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-bar navbar-kebab"></span>
          <span className="navbar-toggler-bar navbar-kebab"></span>
          <span className="navbar-toggler-bar navbar-kebab"></span>
        </button>
        <div className="collapse navbar-collapse" id="navigation">
          <ul className="navbar-nav ml-auto">
            <li className="dropdown nav-item">
              <div
                to='/'
                className="dropdown-toggle nav-link"
                data-toggle="dropdown"
              >
                <div className="photo">
                  <img src={image} alt="Profile" />
                </div>
                <b className="caret d-none d-lg-block d-xl-block"></b>
                <p className="d-lg-none">Log out</p>
              </div>
              <ul className="dropdown-menu dropdown-navbar">
                <li className="nav-link" onClick={() => Logout()}>
                  <p className="text-dark font-weight-bold ml-2">Log out</p>
                </li>
              </ul>
            </li>
            <li className="separator d-lg-none"></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
