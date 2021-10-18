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
    <nav class="navbar navbar-expand-lg navbar-absolute navbar-transparent">
      <div class="container-fluid">
        <div class="navbar-wrapper">
          <div class="navbar-toggle d-inline">
            <button type="button" class="navbar-toggler">
              <span class="navbar-toggler-bar bar1"></span>
              <span class="navbar-toggler-bar bar2"></span>
              <span class="navbar-toggler-bar bar3"></span>
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
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navigation"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-bar navbar-kebab"></span>
          <span class="navbar-toggler-bar navbar-kebab"></span>
          <span class="navbar-toggler-bar navbar-kebab"></span>
        </button>cd
        <div class="collapse navbar-collapse" id="navigation">
          <ul class="navbar-nav ml-auto">
            <li class="dropdown nav-item">
              <div
                to='/'
                class="dropdown-toggle nav-link"
                data-toggle="dropdown"
              >
                <div class="photo">
                  <img src={image} alt="Profile" />
                </div>
                <b class="caret d-none d-lg-block d-xl-block"></b>
                <p class="d-lg-none">Log out</p>
              </div>
              <ul class="dropdown-menu dropdown-navbar">
                <li class="nav-link" onClick={() => Logout()}>
                  <p className="text-dark font-weight-bold ml-2">Log out</p>
                </li>
              </ul>
            </li>
            <li class="separator d-lg-none"></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
