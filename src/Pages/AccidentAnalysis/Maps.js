import React, { useEffect, useState } from "react";
import axios from "axios";
import queryString from "query-string";
import LoadingOverlay from "react-loading-overlay-ts";

import {
  MapContainer,
  TileLayer,
  Popup,
  Circle,
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
  const zoom = 14;
  const center = [-5.147975911780761, 119.43789672442817];
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [cluster, setCluster] = useState([]);
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
            let clusterData = [];
            data.map((i) => {
              let temp = {
                cluster: i.Cluster,
                color: i.Color,
              };
              clusterData.push(temp);
            });
            setCluster(getUnique(clusterData, "cluster"));
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

  function getUnique(arr, comp) {
    // store the comparison  values in array
    const unique = arr
      .map((e) => e[comp])

      // store the indexes of the unique objects
      .map((e, i, final) => final.indexOf(e) === i && i)

      // eliminate the false indexes & return unique objects
      .filter((e) => arr[e])
      .map((e) => arr[e]);

    return unique;
  }
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
                    <div className="row ml-1">
                      {cluster.map((i) =>
                        i.cluster !== undefined ? (
                          <div
                            className="cluster-content mb-3 mr-2"
                            style={{ backgroundColor: i.color }}
                          >
                            CLUSTER {i.cluster}
                          </div>
                        ) : (
                          ""
                        )
                      )}
                    </div>
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

                      {data.map((el) =>
                        el.lat !== undefined ? (
                          <FeatureGroup
                            pathOptions={{
                              color: el.Color,
                              fillColor: el.Color,
                            }}
                          >
                            <Popup>
                              <p className="text-danger text-center font-weight-bold">
                                [CLUSTER {el.Cluster}]
                              </p>
                              <table className="mt-2">
                                <tr>
                                  <td>Lokasi</td>
                                  <td>
                                    : {el.address.toUpperCase()},{" "}
                                    {el.district.toUpperCase()}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Hari</td>
                                  <td>: {el.day}</td>
                                </tr>
                                <tr>
                                  <td>Waktu</td>
                                  <td>: {el.time}</td>
                                </tr>
                                <tr>
                                  <td>Tipe Kecelakaan</td>
                                  <td>: {el.accident_types}</td>
                                </tr>
                                <tr>
                                  <td>Tipe Kendaraan</td>
                                  <td>
                                    :{" "}
                                    {el.suspect_vehicle !== "NOV"
                                      ? el.suspect_vehicle
                                      : ""}
                                    {el.victim_vehicle !== "NOV"
                                      ? " " + el.victim_vehicle
                                      : ""}
                                  </td>
                                </tr>
                              </table>
                            </Popup>
                            <Circle
                              center={
                                el.lat !== undefined
                                  ? [el.lat, el.long]
                                  : center
                              }
                              radius={100}
                            />
                          </FeatureGroup>
                        ) : (
                          ""
                        )
                      )}
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
