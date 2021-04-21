import React, { Component } from "react";
import { Modal } from "react-bootstrap";
import DropdownFactory from "../../../../../utils/DropdownFactory";
import flow from "lodash.flow";
import translate from "app/utils/i18n/Translate.js";
import { connect } from "react-redux";
import Select from "react-select";
import RestfulUtils from "app/utils/RestfulUtils";
import { showNotifi } from "app/action/actionNotification.js";
import { toast } from "react-toastify";
class ThangModalDetail_info extends Component {
  constructor(props) {
    super(props);
    this.state = {
      access: "add",
      CUSTID: "",
      datagroup: {
        p_autoid: "",
        p_branch_code: "",
        p_name: "",
        p_address: "",
        p_bankcode: "",
        p_director: "",
        p_population: "",
        pv_language: this.props.lang,
        pv_objname: this.props.OBJNAME,
      },
      checkFields: [
        { name: "p_branch_code", id: "txtbranchcode" },
        { name: "p_name", id: "txtname" },
        { name: "p_address", id: "txtaddress" },
        { name: "p_bankcode", id: "txtbankcode" },
        { name: "p_director", id: "txtdirector" },
        { name: "p_population", id: "txtpopulation" },
      ],
      isDone: true,
    };
  }

  close() {
    this.props.closeModalDetail();
  }
  /**
   * @param {*access} nextProps
   */
  componentWillReceiveProps(nextProps) {
    this.getOptionsThangHNDirector();
    this.getOptionsThangHNBank();
    if (nextProps.access == "update" || nextProps.access == "view") {
      this.setState({
        datagroup: {
          p_autoid: nextProps.DATA.AUTOID,
          p_branch_code: nextProps.DATA.BRANCH_CODE,
          p_name: nextProps.DATA.NAME,
          p_address: nextProps.DATA.ADDRESS,
          p_bankcode: nextProps.DATA.BANKCODE,
          p_director: nextProps.DATA.DIRECTOR,
          p_population: nextProps.DATA.POPULATION,
        },
        access: nextProps.access,
        isDone: true,
      });
    } else if (nextProps.isClear) {
      this.props.change();
      this.setState({
        datagroup: {
          p_branch_code: "",
          p_name: "",
          p_address: "",
          p_bankcode: "",
          p_director: "",
          p_population: "",
          p_autoid: "",
          //p_autoid: this.props.AUTOID,
          pv_language: this.props.lang,
          pv_objname: this.props.OBJNAME,
        },
        new_create: true,
        access: nextProps.access,
        isDone: false,
        ADDRESS: "ADDRESS",
      });
    }
  }
  componentDidMount() {
    window.$("#txtBRANCH_CODE").focus();
  }
  handleChange(type) {
    this.state.collapse[type] = !this.state.collapse[type];
    this.setState({ collapse: this.state.collapse });
  }
  // onchang director
  onChangeThangHNDirector(type, e) {
    if (type == "p_director") {
      this.state.datagroup["p_director"] = e.value;
      this.setState(this.state);
    } else {
      this.state.datagroup["p_director"] = "";
      this.setState(this.state);
    }
  }
  // option director
  getOptionsThangHNDirector() {
    //lay ds careby
    return RestfulUtils.post("/THANGHNBRANCH/getdirector", {
      language: this.props.lang,
      objname: this.props.OBJNAME,
    }).then((res) => {
      this.setState({
        optionDiretor: res.result,
      });
    });
  }
  // onchang bank
  onChangeThangHNBank(type, e) {
    if (type == "p_bankcode") {
      this.state.datagroup["p_bankcode"] = e.value;
      this.setState(this.state);
    } else {
      this.state.datagroup["p_bankcode"] = "";
      this.setState(this.state);
    }
  }
  // option bank
  getOptionsThangHNBank() {
    //lay ds careby
    return RestfulUtils.post("/THANGHNBRANCH/getbank", {
      language: this.props.lang,
      objname: this.props.OBJNAME,
    }).then((res) => {
      this.setState({
        optionBank: res.result,
      });
    });
  }
  onChange(type, event) {
    if (event.target) {
      this.state.datagroup[type] = event.target.value;
      this.setState(this.state);
    }
    //  else {
    //   if (type == "p_population") {
    //     const temp = Number(event.target.value);
    //     console.log("Kiểu data của số lượng thành viên", typeof temp);
    //     if (temp >= 0) {
    //       this.state.datagroup[type] = event.target.value;
    //       this.setState(this.state);
    //     } else {
    //       toast.error("Số lượng thành viên phải là số dương ! ");
    //     }
    //   }
    // }
    if (type == "p_population") {
      const temp = Number(event.target.value);
      if (temp >= 0) {
        this.state.datagroup[type] = event.target.value;
        this.setState(this.state);
      } else {
        toast.error("Số lượng thành viên phải là số dương ! ");
      }
    }
    this.setState({ datagroup: this.state.datagroup });
  }
  onSetDefaultValue = (type, value) => {
    if (!this.state.datagroup[type]) this.state.datagroup[type] = value;
  };
  async submitGroup() {
    var mssgerr = "";
    for (let index = 0; index < this.state.checkFields.length; index++) {
      const element = this.state.checkFields[index];
      mssgerr = this.checkValid(element.name, element.id);
      if (mssgerr !== "") break;
    }
    if (mssgerr == "") {
      var api = "/THANGHNBRANCH/prc_mt_ThangHNAddBranch";
      if (this.state.access == "update") {
        api = "/THANGHNBRANCH/prc_mt_ThangHNUpdateBranch";
      }
      var { dispatch } = this.props;
      var datanotify = {
        type: "",
        header: "",
        content: "",
      };
      let data2 = this.state.datagroup;
      let data = {
        p_autoid: data2.p_autoid,
        p_branch_code: data2.p_branch_code,
        p_name: data2.p_name,
        p_address: data2.p_address,
        p_bankcode: data2.p_bankcode,
        p_director: data2.p_director,
        p_population: data2.p_population,
        pv_objname: this.props.OBJNAME,
        pv_action: this.state.access,
        pv_language: this.props.lang,
      };
      RestfulUtils.posttrans(api, data).then((res) => {
        if (res.EC == 0) {
          datanotify.type = "success";
          datanotify.content = this.props.strings.success;
          dispatch(showNotifi(datanotify));
          this.props.load();
          this.props.closeModalDetail();
        } else {
          datanotify.type = "error";
          datanotify.content = res.EM;
          dispatch(showNotifi(datanotify));
        }
      });
    }
  }
  checkValid(name, id) {
    let value = this.state.datagroup[name];
    let mssgerr = "";

    switch (name) {
      // case "p_BRANCH_CODE":
      //   if (value == "") {
      //     mssgerr = this.props.strings.requiredBRANCH_CODE;
      //   } else {
      //     if (value.length == 10) {
      //       var i = ["C", "F", "P"].filter(
      //         (nodes) => nodes == value.substr(3, 1)
      //       );
      //       if (i == 0) mssgerr = this.props.strings.checkBRANCH_CODE;
      //     } else mssgerr = this.props.strings.checkBRANCH_CODE;
      //   }
      //   break;
      case "p_branch_code":
        if (value == "") {
          mssgerr = this.props.strings.requiredbranchcode;
        }
        break;
      case "p_name":
        if (value == "") {
          mssgerr = this.props.strings.requiredname;
        }
        break;
      case "p_address":
        if (value == "") {
          mssgerr = this.props.strings.requiredaddress;
        }
        break;
      case "p_bank":
        if (value == "") {
          mssgerr = this.props.strings.requiredbank;
        }
        break;
      case "p_director":
        if (value == "") {
          mssgerr = this.props.strings.requireddirector;
        }
        break;
      case "p_population":
        if (parseFloat("value") < 0) {
          // lấy value dạng số
          mssgerr = this.props.strings.requiredpopulation;
        }
        break;
      default:
        break;
    }
    if (mssgerr !== "") {
      var { dispatch } = this.props;
      var datanotify = {
        type: "",
        header: "",
        content: "",
      };
      datanotify.type = "error";
      datanotify.content = mssgerr;
      dispatch(showNotifi(datanotify));
      window.$(`#${id}`).focus();
    }
    return mssgerr;
  }
  render() {
    var cdname = "";
    var displayyADDRESS = false;
    if (
      (this.state.datagroup["p_custtype"] == "" ||
        this.state.datagroup["p_custtype"] == "CN") &&
      (this.state.datagroup["p_grinvestor"] == "" ||
        this.state.datagroup["p_grinvestor"] == "TN")
    ) {
      cdname = "ADDRESSTNCN";
    } else if (
      this.state.datagroup["p_custtype"] == "TC" &&
      this.state.datagroup["p_grinvestor"] == "TN"
    ) {
      cdname = "ADDRESSTKSD";
      displayyADDRESS = true;
    } else if (this.state.datagroup["p_grinvestor"] == "NN") {
      cdname = "ADDRESSTKSD";
      displayyADDRESS = true;
    }
    return (
      <Modal show={this.props.showModalDetail}>
        <Modal.Header>
          <Modal.Title>
            <div className="title-content col-md-6">
              {this.props.title}
              <button
                type="button"
                className="close"
                onClick={this.close.bind(this)}
              >
                <span aria-hidden="true">×</span>
                <span className="sr-only">Close</span>
              </button>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ overflow: "auto", height: "100%" }}>
          <div className="panel-body ">
            <div className="add-info-account">
              <div
                className={
                  this.state.access == "view"
                    ? "col-md-12 disable"
                    : "col-md-12 "
                }
                style={{ paddingTop: "11px" }}
              >
                <div className="col-md-12 row">
                  <div className="col-md-3">
                    <h5>
                      <b>{this.props.strings.BRANCH_CODE}</b>
                    </h5>
                  </div>
                  <div className="col-md-5">
                    <input
                      maxLength={30}
                      className="form-control"
                      type="text"
                      placeholder={this.props.strings.BRANCH_CODE}
                      id="BRANCH_CODE"
                      value={this.state.datagroup["p_branch_code"]}
                      onChange={this.onChange.bind(this, "p_branch_code")}
                    />
                  </div>
                </div>
                <div className="col-md-12 row">
                  <div className="col-md-3">
                    <h5>
                      <b>{this.props.strings.NAME}</b>
                    </h5>
                  </div>
                  <div className="col-md-5">
                    <input
                      maxLength={30}
                      className="form-control"
                      type="text"
                      placeholder={this.props.strings.NAME}
                      id="p_NAME"
                      value={this.state.datagroup["p_name"]}

                  


                      onChange={this.onChange.bind(this, "p_name")}
                    />
                  </div>
                </div>
                <div className="col-md-12 row">
                  <div className="col-md-3">
                    <h5>
                      <b>{this.props.strings.ADDRESS}</b>
                    </h5>
                  </div>
                  <div className="col-md-5">
                    <input
                      maxLength={30}
                      className="form-control"
                      type="text"
                      placeholder={this.props.strings.ADDRESS}
                      id="p_ADDRESS"
                      value={this.state.datagroup["p_address"]}
                      onChange={this.onChange.bind(this, "p_address")}
                    />
                  </div>
                </div>
                <div className="col-md-12 row">
                  <div className="col-md-3">
                    <h5>
                      <b>{this.props.strings.BANKCODE}</b>
                    </h5>
                  </div>
                  <div className="col-md-5">
                    <Select
                      options={this.state.optionBank}
                      onChange={this.onChangeThangHNBank.bind(
                        this,
                        "p_bankcode"
                      )}
                      value={this.state.datagroup.p_bankcode}
                    />
                  </div>
                </div>
                <div className="col-md-12 row">
                  <div className="col-md-3">
                    <h5>
                      <b>{this.props.strings.DIRECTOR}</b>
                    </h5>
                  </div>
                  <div className="col-md-5">
                    <Select
                      options={this.state.optionDiretor}
                      onChange={this.onChangeThangHNDirector.bind(
                        this,
                        "p_director"
                      )}
                      value={this.state.datagroup.p_director}
                    />
                  </div>
                </div>
                <div className="col-md-12 row">
                  <div className="col-md-3">
                    <h5>
                      <b>{this.props.strings.POPULATION}</b>
                    </h5>
                  </div>
                  <div className="col-md-5">
                    <input
                      maxLength={30}
                      className="form-control"
                      type="text"
                      placeholder={this.props.strings.POPULATION}
                      id="POPULATION"
                      value={this.state.datagroup["p_population"]}
                      onChange={this.onChange.bind(this, "p_population")}
                    />
                  </div>
                </div>
                <div className="col-md-12 row">
                  <div className="pull-right">
                    <input
                      type="button"
                      onClick={this.submitGroup.bind(this)}
                      className="btn btn-primary"
                      style={{ marginRight: 15 }}
                      value={this.props.strings.submit}
                      id="btnSubmit"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}
const stateToProps = (state) => ({
  lang: state.language.language,
});
const decorators = flow([
  connect(stateToProps),
  translate("ThangModalDetail_info"),
]);
module.exports = decorators(ThangModalDetail_info);
