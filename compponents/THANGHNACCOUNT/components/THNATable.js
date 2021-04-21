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
class THNATable extends Component {
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
    RestfulUtils.post("/THANGHNACCOUNT/thanghngetlistaccount", {
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
    await RestfulUtils.post("/THANGHNACCOUNT/thanghngetlistaccount", {
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
    // xử lý khi lấy được id
    if (this.state.selectedRows.size > 0) {
      this.state.selectedRows.forEach((key, value, set) => {
        new Promise((resolve, reject) => {
          let data = this.state.data.filter((e) => e.AUTOID === value);
          let success = null;
          let datadelete = {
            data: data[0],
            pv_language: this.props.lang,
            OBJNAME: "THANGHNACCOUNT",
          };

          resolve(
            RestfulUtils.posttrans(
              "/THANGHNACCOUNT/prc_mt_ThangHNDeleteAccount",
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
    console.log("table", this.props);
    console.log("state", this.state);

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
                  <div className="wordwrap" id="FULLNAME">
                    {this.props.strings.FULLNAME}
                  </div>
                ),
                id: "FULLNAME",
                accessor: "FULLNAME",
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
                  <div className="wordwrap" id="BIRTHDATE">
                    {this.props.strings.BIRTHDATE}
                  </div>
                ),
                id: "BIRTHDATE",
                accessor: "BIRTHDATE",
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
                  <div className="wordwrap" id="">
                    {this.props.strings.IDPLACE}
                  </div>
                ),
                id: "IDPLACE",
                accessor: "IDPLACE",
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
                  <div className="wordwrap" id="ACCOUNT">
                    {this.props.strings.ACCOUNT}
                  </div>
                ),
                id: "ACCOUNT",
                accessor: "ACCOUNT",
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
                  <div className="wordwrap" id="type">
                    {this.props.strings.type}
                  </div>
                ),
                id: "type",
                accessor: "type",
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
                  <div className="wordwrap" id="BALANCE">
                    {this.props.strings.BALANCE}
                  </div>
                ),
                id: "BALANCE",
                accessor: "BALANCE",
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
            // loadingText="Đang tải..."
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
THNATable.defaultProps = {
  strings: {
    fullname: "Họ tên",
    ĐKSH: "Số ĐKSH",
    ccq: "Tài sản giao dịch",
    TTBT: "Chờ TTBT",
    quyen: "Quyền chờ về",
    desc: "Diễn giải",
    pageText: "Trang",
    rowsText: "bản ghi",
    textNodata: "Không có kết quả",
    vsdSTATUS: "Trạng thái VSD",
  },
};
const stateToProps = (state) => ({
  veryfiCaptcha: state.veryfiCaptcha,
  notification: state.notification,
  lang: state.language,
});
const decorators = flow([connect(stateToProps), translate("THNATable")]);
module.exports = decorators(THNATable);
