import React, { Component } from "react";
import ReactTable from "react-table";
import { Checkbox } from "react-bootstrap";
import {
  ButtonAdd,
  ButtonDelete,
  ButtonExport,
} from "app/utils/buttonSystem/ButtonSystem";
import flow from "lodash.flow";
import translate from "app/utils/i18n/Translate.js";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import RestfulUtils from "app/utils/RestfulUtils";
import {
  DefaultPagesize,
  getExtensionByLang,
  getRowTextTable,
  getPageTextTable,
} from "app/Helpers";
import { requestData } from "app/utils/ReactTableUlti";
class ThangTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      pages: null,
      loading: true,
      checkedAll: false,
      checkboxChecked: false,
      selectedRows: new Set(),
      unSelectedRows: [],
      pagesize: DefaultPagesize,
      keySearch: {},
      sortSearch: {},
      page: 1,
      dataTest: [],
      data1: [],
      loaded: false,
      sorted1: [],
      filtered1: [],
      firstRender: true,
      lang: this.props.lang,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (this.state.lang != nextProps.currentLanguage) {
      this.state.lang = nextProps.currentLanguage;
      this.refReactTable.fireFetchData();
    }
    if (nextProps.loadgrid) {
      this.state.firstRender = true;
      this.refReactTable.fireFetchData();
    }
  }
  handleAdd(evt) {
    var that = this;
    that.props.showModalDetail("add");
  }
  handlEdit(data) {
    var that = this;
    that.props.showModalDetail("update", data);
  }
  handleChangeALL(evt) {
    var that = this;
    this.setState({
      checkedAll: evt.target.checked,
      selectedRows: new Set(),
      unSelectedRows: [],
    });
    if (evt.target.checked) {
      that.state.data.map(function (item) {
        if (!that.state.selectedRows.has(item.AUTOID)) {
          that.state.unSelectedRows.push(item.AUTOID);
          that.state.selectedRows.add(item.AUTOID);
        }
      });
      that.setState({
        selectedRows: that.state.selectedRows,
        unSelectedRows: that.state.unSelectedRows,
      });
    } else {
      that.setState({ selectedRows: new Set(), unSelectedRows: [] });
    }
  }
  handleChange(row) {
    if (!this.state.selectedRows.has(row.original.AUTOID))
      this.state.selectedRows.add(row.original.AUTOID);
    else {
      this.state.selectedRows.delete(row.original.AUTOID);
    }
    this.setState({ selectedRows: this.state.selectedRows, checkedAll: false });
  }
  onRowClick(state, rowInfo, column, instance) {
    var that = this;
    return {
      onDoubleClick: (e) => {
        that.props.showModalDetail("view", rowInfo.original);
      },
      style: {
        background:
          rowInfo == undefined
            ? ""
            : that.state.selectedRows.has(rowInfo.original.CUSTID)
            ? "#dbe1ec"
            : "",
        color:
          rowInfo == undefined
            ? ""
            : that.state.selectedRows.has(rowInfo.original.CUSTID)
            ? "black"
            : "",
      },
    };
  }
  fetchData(state, instance) {
    this.setState({
      colum: instance.props.columns,
    });
    if (this.state.loading) {
      new Promise((resolve, reject) => {
        let { pageSize, page, filtered, sorted } = state;
        setTimeout(
          () =>
            resolve(
              this.loadData(
                pageSize,
                page + 1,
                filtered,
                sorted,
                instance.props.columns
              )
            ),
          500
        );
      });
    }
    this.setState({ loading: true });
  }
  refresh() {
    let self = this;
    RestfulUtils.post("/THANGHNBRANCH/thanghngetlistbranch", {
      pagesize: this.state.pagesize,
      language: this.props.lang,
      OBJNAME: this.props.OBJNAME,
    }).then((resData) => {
      if (resData.EC == 0) {
        self.setState({
          data: resData.DT.data,
          pages: resData.DT.numOfPages,
          sumRecord: resData.DT.dataExport.length,
          dataALL: resData.DT.dataExport,
        });
      } else {
        toast.error(resData.EM, { position: toast.POSITION.BOTTOM_RIGHT });
      }
    });
  }
  async loadData(pagesize, page, keySearch, sortSearch, columns) {
    let that = this;
    await RestfulUtils.post("/THANGHNBRANCH/thanghngetlistbranch", {
      pagesize,
      page,
      keySearch,
      sortSearch,
      language: this.props.lang,
      OBJNAME: this.props.OBJNAME,
    }).then((resData) => {
      if (resData.EC == 0) {
        that.setState({
          data: resData.DT.data,
          pages: resData.DT.numOfPages,
          keySearch,
          page,
          pagesize,
          sortSearch,
          sumRecord: resData.DT.dataExport.length,
          dataALL: resData.DT.dataExport,
          colum: columns,
        });
      } else {
      }
    });
  }
  componentWillMount() {
    this.refresh();
  }
  reloadTable() {
    this.state.firstRender = true;
    this.refReactTable.fireFetchData();
  }
  delete = () => {
    let i = 0;
    // x??? l?? khi l???y ???????c id
    if (this.state.selectedRows.size > 0) {
      this.state.selectedRows.forEach((key, value, set) => {
        new Promise((resolve, reject) => {
          let data = this.state.data.filter((e) => e.AUTOID === value);
          let success = null;
          let datadelete = {
            // p_autoid: data[0].AUTOID,
            data: data[0],
            pv_language: this.props.lang,
            OBJNAME: "THANGHNBRANCH",
            // OBJNAME: this.props.OBJNAME,
          };
          resolve(
            RestfulUtils.posttrans(
              "/THANGHNBRANCH/prc_mt_ThangHNDeleteBranch",
              datadelete
            ).then((res) => {
              i += 1;
              success = res.EC == 0;
              success
                ? toast.success(this.props.strings.success, {
                    position: toast.POSITION.BOTTOM_RIGHT,
                  })
                : toast.error(this.props.strings.fail + res.EM, {
                    position: toast.POSITION.BOTTOM_RIGHT,
                  });
              if (this.state.selectedRows.size == i) {
                this.state.firstRender = true;
                this.refReactTable.fireFetchData();
              }
            })
          );
        });
      });
    } else
      toast.error(this.props.strings.warningchooserecord, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
  };
  render() {
    const { data, pages, pagesize } = this.state;
    var that = this;
    return (
      <div>
        <div className="row">
          <div
            style={{ marginLeft: "-12px", marginBottom: "10px" }}
            className="col-md-10 "
          >
            <ButtonAdd
              style={{ marginLeft: "5px" }}
              data={this.props.datapage}
              onClick={this.handleAdd.bind(this)}
            />
            <ButtonDelete
              style={{ marginLeft: "5px" }}
              onClick={this.delete}
              data={this.props.datapage}
            />
            <ButtonExport
              style={{ marginLeft: "5px" }}
              HaveChk={true}
              dataRows={this.state.data}
              colum={this.state.colum}
              data={this.props.datapage}
              dataHeader={this.props.strings}
            />
          </div>
          <div style={{ textAlign: "right" }} className="col-md-2 RightInfo">
            <h5 className="highlight" style={{ fontWeight: "bold" }}>
              <span
                style={{ textAlign: "left" }}
                className="glyphicon glyphicon-edit"
                aria-hidden="true"
              ></span>
              {this.props.strings.sumtitle} {this.state.sumRecord}
              <span
                className="ReloadButton"
                onClick={this.reloadTable.bind(this)}
              >
                <i className="fas fa-sync-alt"></i>
              </span>
            </h5>
          </div>
        </div>
        <div className="col-md-12">
          <ReactTable
            columns={[
              {
                Header: (props) => (
                  <div className=" header-react-table">
                    <Checkbox
                      checked={that.state.checkedAll}
                      style={{ marginBottom: "14px", marginLeft: "11px" }}
                      onChange={that.handleChangeALL.bind(that)}
                      inline
                    />
                  </div>
                ),
                maxWidth: 55,
                sortable: false,
                style: { textAlign: "center" },
                Cell: (row) => (
                  <div>
                    <Checkbox
                      style={{
                        textAlign: "center",
                        marginLeft: "11px",
                        marginTop: "-14px",
                      }}
                      checked={that.state.selectedRows.has(row.original.AUTOID)}
                      onChange={that.handleChange.bind(that, row)}
                      inline
                    />
                    <span
                      onClick={that.handlEdit.bind(that, row.original)}
                      className="glyphicon glyphicon-pencil"
                    ></span>
                  </div>
                ),
                Filter: ({ filter, onChange }) => null,
              },
              {
                Header: (props) => (
                  <div className="wordwrap" id="BRANCH_CODE">
                    {this.props.strings.BRANCH_CODE}
                  </div>
                ),
                id: "BRANCH_CODE",
                accessor: "BRANCH_CODE",
                width: 150,
                Cell: ({ value }) => (
                  <div
                    className="col-left"
                    style={{ float: "left" }}
                    id={"lbl" + value}
                  >
                    {value}
                  </div>
                ),
              },
              {
                Header: (props) => (
                  <div className="wordwrap" id="NAME">
                    {this.props.strings.NAME}
                  </div>
                ),
                id: "NAME",
                accessor: "NAME",
                width: 150,
                Cell: ({ value }) => (
                  <div
                    className="col-left"
                    style={{ float: "left" }}
                    id={"lbl" + value}
                  >
                    {value}
                  </div>
                ),
              },
              {
                Header: (props) => (
                  <div className="wordwrap" id="ADDRESS">
                    {this.props.strings.ADDRESS}
                  </div>
                ),
                id: "ADDRESS",
                accessor: "ADDRESS",
                width: 300,
                Cell: ({ value }) => (
                  <div
                    className="col-left"
                    style={{ float: "left" }}
                    id={"lbl" + value}
                  >
                    {value}
                  </div>
                ),
              },
              {
                Header: (props) => (
                  <div className="wordwrap" id="BANKCODE">
                    {this.props.strings.BANKCODE}
                  </div>
                ),
                id: "BANKCODE",
                accessor: "BANKCODE",
                width: 300,
                Cell: ({ value }) => (
                  <div
                    className="col-left"
                    style={{ float: "left" }}
                    id={"lbl" + value}
                  >
                    {value}
                  </div>
                ),
              },
              {
                Header: (props) => (
                  <div className="wordwrap" id="DIRECTOR">
                    {this.props.strings.DIRECTOR}
                  </div>
                ),
                id: "DIRECTOR",
                accessor: "DIRECTOR",
                width: 300,
                Cell: ({ value }) => (
                  <div
                    className="col-left"
                    style={{ float: "left" }}
                    id={"lbl" + value}
                  >
                    {value}
                  </div>
                ),
              },
              {
                Header: (props) => (
                  <div className="wordwrap" id="POPULATION">
                    {this.props.strings.POPULATION}
                  </div>
                ),
                id: "POPULATION",
                accessor: "POPULATION",
                width: 300,
                Cell: ({ value }) => (
                  <div
                    className="col-left"
                    style={{ float: "left" }}
                    id={"lbl" + value}
                  >
                    {value}
                  </div>
                ),
              },
              {
                Header: (props) => (
                  <div className="wordwrap" id="CDCONTENT">
                    {this.props.strings.STATUS}
                  </div>
                ),
                id: "CDCONTENT",
                accessor: "CDCONTENT",
                width: 300,
                Cell: ({ value }) => (
                  <div
                    className="col-left"
                    style={{ float: "left" }}
                    id={"lbl" + value}
                  >
                    {value}
                  </div>
                ),
              },
            ]}
            getTheadTrProps={() => {
              return {
                className: "head",
              };
            }}
            manual
            filterable
            pages={pages} // Display the total number of pages
            //  loading={loading} // Display the loading overlay when we need it
            onFetchData={this.fetchData.bind(this)}
            data={data}
            style={{
              maxHeight: "600px", // This will force the table body to overflow and scroll, since there is not enough room
            }}
            noDataText={this.props.strings.textNodata}
            pageText={getPageTextTable(this.props.lang)}
            rowsText={getRowTextTable(this.props.lang)}
            previousText={<i className="fas fa-backward" id="previous"></i>}
            nextText={<i className="fas fa-forward" id="next"></i>}
            // loadingText="??ang t???i..."
            ofText="/"
            getTrGroupProps={(row) => {
              return {
                id: "haha",
              };
            }}
            getTrProps={this.onRowClick.bind(this)}
            defaultPageSize={pagesize}
            className="-striped -highlight"
            ref={(refReactTable) => {
              this.refReactTable = refReactTable;
            }}
          />
        </div>
      </div>
    );
  }
}
ThangTable.defaultProps = {
  strings: {
    fullname: "H??? t??n",
    ??KSH: "S??? ??KSH",
    ccq: "T??i s???n giao d???ch",
    TTBT: "Ch??? TTBT",
    quyen: "Quy???n ch??? v???",
    desc: "Di???n gi???i",
    pageText: "Trang",
    rowsText: "b???n ghi",
    textNodata: "Kh??ng c?? k???t qu???",
    vsdSTATUS: "Tr???ng th??i VSD",
  },
};
const stateToProps = (state) => ({
  veryfiCaptcha: state.veryfiCaptcha,
  notification: state.notification,
  lang: state.language,
});
const decorators = flow([connect(stateToProps), translate("ThangTable")]);
module.exports = decorators(ThangTable);
