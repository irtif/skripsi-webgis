import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingOverlay from "react-loading-overlay-ts";
import { Modal } from "react-bootstrap";
import {
  MapContainer,
  TileLayer,
  Popup,
  Circle,
  FeatureGroup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";

import Navbar from "../../Components/Navbar/Navbar";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./style.css";

const headers = {
  "Content-Type": "application/json",
  "x-access-token": localStorage.getItem("satlatic_token"),
};

function Result2(props) {
  const zoom = 13;
  const center = [-5.147975911780761, 119.43789672442817];
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [data, setData] = useState([]);
  const [cluster, setCluster] = useState([]);
  const [modalData, setModalData] = useState([]);
  const [column, setColumn] = useState([]);
  const [markerData, setMarkerData] = useState([]);

  useEffect(() => {
    setLoading(true);
    executeMapData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const executeMapData = () => {
    axios
      .get("/show/result.csv", { headers })
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
          return "";
        });
        setData(data);

        let initiate_marker = data.filter((el) => el.Cluster === "0");
        setMarkerData(initiate_marker);
        executeModalData();
      })
      .catch((err) => {
        executeClustering();
      });
  };

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

  const executeModalData = () => {
    axios
      .get("/show/result.json", { headers })
      .then((res) => {
        let result = JSON.parse(res.data.replace(/'/g, '"'));
        let clusterData = [];
        result.map((data) => {
          let times = "";
          for (let i = 0; i < data.time.length; i++) {
            times += data.time[i] + " ";
          }

          let accident_types = "";
          for (let i = 0; i < data.accident_types.length; i++) {
            accident_types += data.accident_types[i] + " ";
          }

          let vehicle_types = "";

          for (let i = 0; i < data.vehicle_types.length; i++) {
            vehicle_types += data.vehicle_types[i] + " ";
          }
          let temp = {
            cluster: data.cluster,
            color: data.color[0],
            time: times,
            accident_types: accident_types,
            vehicle_types: vehicle_types
          };
          console.log(temp)
          clusterData.push(temp);
          return "";
        });

        let new_clusters = getUnique(clusterData, "cluster");
        console.log(new_clusters)
        setCluster(new_clusters);
        setModalData(result);
        setColumn([
          {
            dataField: "cluster",
            text: "Cluster",
            headerStyle: { textAlign: "center", color: "white" },
            style: { textAlign: "center", color: "black" },
          },
          {
            dataField: "days",
            text: "Hari",
            headerStyle: { textAlign: "center", color: "white" },
            style: { textAlign: "center", color: "black" },
            formatter: (row) => {
              return row.map((i, index) => <span key={index}>{i + " "}</span>);
            },
          },
          {
            dataField: "time",
            text: "Waktu",
            headerStyle: { textAlign: "center", color: "white" },
            style: { textAlign: "center", color: "black" },
            formatter: (row) => {
              return row.map((i, index) => <span key={index}>{i + " "}</span>);
            },
          },
          {
            dataField: "address",
            text: "Lokasi",
            headerStyle: { textAlign: "center", color: "white" },
            style: { textAlign: "center", color: "black" },
            formatter: (row) => {
              return row.map((i, index) => (
                <span key={index} className="text-capitalize">
                  {i + " | "}
                </span>
              ));
            },
          },
          {
            dataField: "accident_types",
            text: "Tipe Kecelakaan",
            headerStyle: { textAlign: "center", color: "white" },
            style: { textAlign: "center", color: "black" },
            formatter: (row) => {
              return row.map((i, index) => <span key={index}>{i + " "}</span>);
            },
          },
          {
            dataField: "vehicle_types",
            text: "Kendaraan Rawan",
            headerStyle: { textAlign: "center", color: "white" },
            style: { textAlign: "center", color: "black" },
            formatter: (row) => {
              return row.map((i, index) => <span key={index}>{i + " "}</span>);
            },
          },
        ]);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const executeClustering = () => {
    var startTime = new Date();
    console.log(startTime.getHours() + ":" + startTime.getMinutes() + ":" + startTime.getSeconds())
    axios
      .get("/execute", { headers })
      .then((res) => {
        console.log(res)
        var endTime = new Date();
        console.log(endTime.getHours() + ":" + endTime.getMinutes() + ":" + endTime.getSeconds())
        executeMapData();
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const showClusterMarkers = (cluster) => {
    // console.log(data)
    let filter_data = data.filter((el) => el.Cluster === String(cluster));
    console.log(filter_data)
    setMarkerData(filter_data);
  };

  const customTotal = (from, to, size) => (
    <span className="react-bootstrap-table-pagination-total">
      Showing {from} to {to} of {size} Results
    </span>
  );

  const options = {
    paginationSize: 2,
    pageStartIndex: 0,
    // alwaysShowAllBtns: true, // Always show next and previous button
    // withFirstAndLast: false, // Hide the going to First and Last page button
    hideSizePerPage: true, // Hide the sizePerPage dropdown always
    // hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
    firstPageText: "First",
    prePageText: "Back",
    nextPageText: "Next",
    lastPageText: "Last",
    nextPageTitle: "First page",
    prePageTitle: "Pre page",
    firstPageTitle: "Next page",
    showTotal: true,
    paginationTotalRenderer: customTotal,
    lastPageTitle: "Last page",
    sizePerPage: 1, // A numeric array is also available. the purpose of above example is custom the text
  };

  function MyVerticallyCenteredModal(props) {
    return (
      <Modal
        {...props}
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="modal-table"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            TABEL HASIL
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ marginTop: "-2rem" }}>
          <BootstrapTable
            bordered={false}
            hover={true}
            keyField="id"
            data={modalData}
            columns={column}
            pagination={paginationFactory(options)}
          />
        </Modal.Body>
      </Modal>
    );
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
                    <h3 className="card-title float-left font-weight-bold float-left">
                      CLUSTERING RESULT
                    </h3>
                    <div
                      class="btn-group btn-group-toggle float-right"
                      data-toggle="buttons"
                    >
                      <label
                        class="btn btn-sm btn-primary btn-simple active"
                        id="0"
                      >
                        <input type="radio" name="options" checked />
                        <span
                          class="d-none d-sm-block d-md-block d-lg-block d-xl-block"
                          onClick={() => setModal(true)}
                        >
                          Show Table
                        </span>
                        <span class="d-block d-sm-none">
                          <i class="tim-icons icon-single-02"></i>
                        </span>
                      </label>
                      <label class="btn btn-sm btn-primary btn-simple" id="1">
                        <input
                          type="radio"
                          class="d-none d-sm-none"
                          name="options"
                        />
                        <span
                          class="d-none d-sm-block d-md-block d-lg-block d-xl-block"
                          onClick={() => (window.location.href = "/input")}
                        >
                          Input New
                        </span>
                        <span class="d-block d-sm-none">
                          <i class="tim-icons icon-gift-2"></i>
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="card-body">
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

                      {markerData.map((el, index) => {
                        return el.lat !== undefined ? (
                          <FeatureGroup
                            key={index}
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
                                    :
                                    {el.suspect_vehicle !== "NOV"
                                      ? ` ${el.suspect_vehicle} `
                                      : ""}
                                    {el.victim_vehicle !== "NOV"
                                      ? ` ${el.victim_vehicle} `
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
                              radius={150}
                            />
                          </FeatureGroup>
                        ) : (
                          ""
                        );
                      })}
                    </MapContainer>
                    <div className="row ml-4 mt-5">
                      {cluster.map((i, index) => {
                        return i.cluster !== undefined ? (
                          
                          <div
                            key={index}
                            className="cluster-content mb-3 mr-2"
                            style={{ backgroundColor: i.color }}
                            onClick={() => showClusterMarkers(i.cluster)}
                          >
                            CLUSTER {index} - {i.time} - {i.accident_types}
                           <span className="d-block" style={{marginTop:'-2rem'}}> {i.vehicle_types}</span>
                          </div>
                        ) : (
                          ""
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MyVerticallyCenteredModal show={modal} onHide={() => setModal(false)} />
    </LoadingOverlay>
  );
}

export default Result2;
