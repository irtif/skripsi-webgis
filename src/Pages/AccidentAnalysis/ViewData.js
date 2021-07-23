import React, { useEffect, useState } from "react";
import axios from "axios";
import queryString from "query-string";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, {
    PaginationProvider,
} from "react-bootstrap-table2-paginator";
import ToolkitProvider, {
    Search,
} from "react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit";
const { SearchBar } = Search;

import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";

function ViewData(props) {
    // const [params, setParams] = useState({});
    // const [data, setData] = useState([]);
    // const [columnData, setColumn] = useState([]);

    // useEffect(() => {
    //     const { id, path } = queryString.parse(props.location.search);
    //     setParams({ id, path });
    //     axios
    //         .get(`http://127.0.0.1:8000/api/file/view/${path}`)
    //         .then((res) => {
    //             let data = [];
    //             let cells = res.data.split("\n").map(function (el) {
    //                 return el.split("/");
    //             });
    //             let columns = cells[0][0]
    //                 .split('"')
    //                 .filter((e) => e && e !== ",");
    //             cells.shift();
    //             cells.map((i) => {
    //                 let arr = i[0]
    //                     .split('"')
    //                     .filter((e) => e && e !== ",")
    //                     .map((i) => i.trim());
    //                 data.push(
    //                     Object.assign.apply(
    //                         {},
    //                         columns.map((v, i) => ({ [v]: arr[i] }))
    //                     )
    //                 );
    //             });

    //             setData(data);
    //             setColumn([
    //                 {
    //                     dataField: "no",
    //                     text: "No",
    //                     headerStyle: { textAlign: "center", color: "white" },
    //                     style: { textAlign: "center", color: "black" },
    //                 },
    //                 {
    //                     dataField: "day",
    //                     text: "Day",
    //                     headerStyle: { textAlign: "center", color: "white" },
    //                     style: { textAlign: "center", color: "black" },
    //                 },
    //                 {
    //                     dataField: "date",
    //                     text: "date",
    //                     headerStyle: { textAlign: "center", color: "white" },
    //                     style: { textAlign: "center", color: "black" },
    //                 },
    //                 {
    //                     dataField: "time",
    //                     text: "Time",
    //                     headerStyle: { textAlign: "center", color: "white" },
    //                     style: { textAlign: "center", color: "black" },
    //                 },
    //                 {
    //                     dataField: "address",
    //                     text: "Address",
    //                     headerStyle: { textAlign: "center", color: "white" },
    //                     style: { textAlign: "center", color: "black" },
    //                 },
    //                 {
    //                     dataField: "district",
    //                     text: "District",
    //                     headerStyle: { textAlign: "center", color: "white" },
    //                     style: { textAlign: "center", color: "black" },
    //                 },
    //                 {
    //                     dataField: "accident_types",
    //                     text: "Accident Types",
    //                     headerStyle: { textAlign: "center", color: "white" },
    //                     style: { textAlign: "center", color: "black" },
    //                 },
    //             ]);
    //         })
    //         .catch((err) => console.log(err));
    // }, []);

    // const customTotal = (from, to, size) => (
    //     <span className="react-bootstrap-table-pagination-total ml-3">
    //         Menampilkan {from} - {to} dari {size} Hasil
    //     </span>
    // );

    // const options = {
    //     aginationSize: 4,
    //     pageStartIndex: 1,
    //     firstPageText: "First",
    //     prePageText: "Back",
    //     nextPageText: "Next",
    //     lastPageText: "Last",
    //     nextPageTitle: "First page",
    //     prePageTitle: "Pre page",
    //     firstPageTitle: "Next page",
    //     lastPageTitle: "Last page",
    //     showTotal: true,
    //     paginationTotalRenderer: customTotal,
    //     disablePageTitle: true,
    //     sizePerPageList: [
    //         {
    //             text: "10",
    //             value: 10,
    //         },
    //         {
    //             text: "25",
    //             value: 25,
    //         },
    //         {
    //             text: "All",
    //             value: data.length,
    //         },
    //     ], // A numeric array is also available. the purpose of above example is custom the text
    // };

    // const contentTable = ({ paginationProps, paginationTableProps }) => (
    //     <div>
    //         <ToolkitProvider
    //             keyField="id"
    //             columns={columnData}
    //             data={data}
    //             search={{ searchFormatted: true }}
    //         >
    //             {(toolkitprops) => (
    //                 <div>
    //                     <SearchBar
    //                         {...toolkitprops.searchProps}
    //                         className="float-right"
    //                     />
    //                     <BootstrapTable
    //                         bordered={false}
    //                         striped
    //                         hover
    //                         {...toolkitprops.baseProps}
    //                         {...paginationTableProps}
    //                     />
    //                 </div>
    //             )}
    //         </ToolkitProvider>
    //     </div>
    // );

    // const executeData = () => {
    //     window.location.href = `/maps?id=${params.id}&path=${params.path}`;
    // };
    return (
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
                                        View Imported Data
                                    </h3>
                                    <button
                                        className="btn btn-primary float-right"
                                        onClick={executeData}
                                    >
                                        Execute
                                    </button>
                                </div>
                                {/* <div className="card-body">
                                    {data.length && columnData.length > 0 ? (
                                        <PaginationProvider
                                            pagination={paginationFactory(
                                                options
                                            )}
                                        >
                                            {contentTable}
                                        </PaginationProvider>
                                    ) : (
                                        ""
                                    )}
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewData;
