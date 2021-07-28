import React, { useEffect, useState } from "react";
import axios from "axios";
import queryString from "query-string";
import LoadingOverlay from "react-loading-overlay-ts";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  Circle,
  LayerGroup,
  Rectangle,
  FeatureGroup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import Navbar from "../../Components/Navbar/Navbar";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./style.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: icon,
  shadowUrl: iconShadow,
});
const headers = {
  "Content-Type": "application/json",
  "x-access-token": localStorage.getItem("satlatic_token"),
};

function Result(props) {
  const zoom = 10;
  const center = [-5.1342962, 119.4124282];
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const rectangle = [
    [51.49, -0.08],
    [51.5, -0.06],
  ];
  useEffect(() => {
    // setLoading(true);

    const { id, path } = queryString.parse(props.location.search);
    let file_path = path.replace(".csv", "");
    axios
      .get("/execute/" + file_path, { headers })
      .then((res) => {
        setLoading(true);
        axios
          .get("/show/" + file_path, { headers })
          .then((res) => {
            let data = [];
            let cells = res.data.split("\n").map(function (el) {
              return el.split("/");
            });
            let columns = cells[0][0].split(",");
            cells.shift();
            cells.map((i) => {
              let arr = i[0]
                .split(",")
                .filter((e) => e && e !== ",")
                .map((i) => i.trim());
              data.push(
                Object.assign.apply(
                  {},
                  columns.map((v, i) => ({ [v.trim()]: arr[i] }))
                )
              );
            });
            console.log(data);
            setData(data);
            setLoading(false);
          })
          .catch((err) => {
            console.log(err);
            setLoading(false);
          });
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);
  const fillBlueOptions = { fillColor: "blue" };
  const fillRedOptions = { fillColor: "red" };
  const greenOptions = { color: "green", fillColor: "green" };
  const purpleOptions = { color: "purple" };
  return (
    <LoadingOverlay active={loading} spinner text="Loading your content...">
      <div className="wrapper">
        <Sidebar />
        <div className="main-panel">
          <Navbar />
          <div className="content">
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header pt-4">
                    <h3 className="card-title float-left font-weight-bold">
                      Result
                    </h3>
                  </div>
                  <div className="card-body">
                    {/* <MapContainer
                      center={center}
                      zoom={zoom}
                      style={{ height: "350px" }}
                    >
                      <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
                      />
                      <Marker position={center}>
                        <Popup>
                          A pretty CSS3 popup. <br /> Easily customizable.
                        </Popup>
                      </Marker>
                    </MapContainer> */}
                    <MapContainer
                      center={center}
                      zoom={zoom}
                      scrollWheelZoom={false}
                      style={{ height: "100vh", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      {data.map((el) => (
                        <LayerGroup>
                          <Circle
                            center={
                              el.lat !== undefined ? [el.lat, el.long] : center
                            }
                            pathOptions={
                              el.Color !== undefined
                                ? {  color: el.Color, fillColor: el.Color }
                                : ""
                            }
                            radius={200}
                          />
                        </LayerGroup>
                      ))}
                    </MapContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LoadingOverlay>
  );
}

export default Result;
