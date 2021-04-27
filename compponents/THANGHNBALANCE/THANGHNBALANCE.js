import React, { Component } from "react";
import flow from "lodash.flow";
import translate from "app/utils/i18n/Translate.js";
import { connect } from "react-redux";
import Select from "react-select";
import RestfulUtils from "app/utils/RestfulUtils";
import { showNotifi } from "app/action/actionNotification.js";
import { toast } from "react-toastify";
import "./THANGHNBALANCE.css";
class THANGHNBALANCE extends Component {
  constructor(props) {
    super(props);
    this.state = {
      CUSTID: "",
      datagroup: {
        p_autoid: "",
        p_custodycd: "",
        p_fullname: "",
        p_BIRTHDATE: "",
        p_address: "",
        p_account: "",
        p_type: "",
        p_balance: "0",
        p_money: "",
        p_action: "",
        pv_action: "add",
        pv_language: this.props.lang,
        pv_objname: this.props.OBJNAME,
      },
      checkFields: [
        { name: "p_custodycd", id: "txtcustodycd" },

        { name: "p_account", id: "txtaccount" },
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
    //this.getOptionsThangHNcustodycd();
    // if (nextProps.access == "update" || nextProps.access == "view") {
    //   this.setState({
    //     datagroup: {
    //       p_autoid: nextProps.DATA.AUTOID,
    //       p_custodycd: nextProps.DATA.CUSTODYCD,
    //       p_fullname: nextProps.DATA.FULLNAME,
    //       p_BIRTHDATE: nextProps.DATA.BIRTHDATE,
    //       p_address: nextProps.DATA.IDPLACE,
    //       p_account: nextProps.DATA.ACCOUNT,
    //       p_type: nextProps.DATA.TYPE,
    //       p_balance: nextProps.DATA.BALANCE,
    //     },
    //     access: nextProps.access,
    //     isDone: true,
    //   });
    // } else if (nextProps.isClear) {
    //   this.props.change();
    //   this.setState({
    //     datagroup: {
    //       p_custodycd: "",
    //       p_fullname: "",
    //       p_BIRTHDATE: "",
    //       p_address: "",
    //       p_account: "",
    //       p_type: "",
    //       p_balance: "0",
    //       p_autoid: "",
    //       pv_language: this.props.lang,
    //       pv_objname: this.props.OBJNAME,
    //     },
    //     new_create: true,
    //     access: nextProps.access,
    //     isDone: false,
    //     ADDRESS: "ADDRESS",
    //   });
    // }
  }
  componentDidMount() {
    this.getOptionsThangHNcustodycd();
    window.$("#txtcustodycd").focus();
  }
  handleChange(type) {
    this.state.collapse[type] = !this.state.collapse[type];
    this.setState({ collapse: this.state.collapse });
  }
  // onchang custodycd
  onChangeThangHNcustodycd(type, e) {
    if (type == "p_custodycd") {
      this.state.datagroup["p_custodycd"] = e.label;
      this.state.datagroup["p_fullname"] = e.fullname;
      this.state.datagroup["p_address"] = e.idplace;
      this.state.datagroup["p_BIRTHDATE"] = e.BIRTHDATE;
      this.state.datagroup["p_account"] = e.ACCOUNT;
      this.state.datagroup["p_type"] = e.TYPE;
      this.state.datagroup["p_balance"] = e.BALANCE;

      this.setState(this.state);
    } else {
      this.state.datagroup["p_custodycd"] = "";
      this.setState(this.state);
    }
  }
  // option custodycd
  getOptionsThangHNcustodycd() {
    //lay ds careby
    return RestfulUtils.post("/THANGHNBALANCE/getthanghn_balance", {
      language: this.props.lang,
      objname: "THANGHNBALANCE",
    }).then((res) => {
      this.setState({
        optioncustodycd: res.result,
      });
    });
  }
  onChange(type, event) {
    if (event.target) {
      this.state.datagroup[type] = event.target.value;
      this.setState(this.state);
    }
    if (type == "p_type") {
      if (this.state.datagroup["p_type"] === "TT") {
        this.state.datagroup["p_balance"] = "0";
        this.setState(this.state);
      } else {
        this.state.datagroup["p_balance"] = event.p_balance;
        this.setState(this.state);
      }
    }
    if (type == "p_balance") {
      const temp = Number(event.target.value);
      if (temp >= 0) {
        this.state.datagroup[type] = event.target.value;
        this.setState(this.state);
      } else {
        toast.error("Số dư phải là số dương ! ");
      }
    }
    this.setState({ datagroup: this.state.datagroup });
  }
  onSetDefaultValue = (type, value) => {
    if (!this.state.datagroup[type]) this.state.datagroup[type] = value;
  };
  async submitGroup() {
    var mssgerr = "";
    if (mssgerr == "") {
      var api = "/THANGHNBALANCE/thangHNChangeBalance";

      var { dispatch } = this.props;
      var datanotify = {
        type: "",
        header: "",
        content: "",
      };
      let data2 = this.state.datagroup;

      let data = {
        p_autoid: data2.p_autoid,
        p_custodycd: data2.p_custodycd,
        p_fullname: data2.p_fullname,
        p_birthdate: data2.p_BIRTHDATE,
        p_address: data2.idplace,
        p_account: data2.p_account,
        p_type: data2.p_type,
        p_balance: data2.p_balance,
        p_money: data2.p_money,
        p_action: data2.p_action,
        pv_objname: "THANGHNBALANCE",
        pv_action: this.state.access,
        pv_language: this.props.lang,
      };
      RestfulUtils.posttrans(api, data).then((res) => {
        if (res.EC == 0) {
          datanotify.type = "success";
          datanotify.content = this.props.strings.success;
          dispatch(showNotifi(datanotify));
          this.props.load();
          //this.props.closeModalDetail();
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
      case "p_custodycd":
        if (value == "") {
          mssgerr = this.props.strings.requiredcustodycd;
        }
        break;
      case "p_account":
        if (parseFloat("value") < 0) {
          // lấy value dạng số
          mssgerr = this.props.strings.requiredACCOUNT;
        }
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
    console.log("this.state balance", this.state.optioncustodycd);
    return (
      <div className="thanghn__balance ">
        <div className="title-content" style={{ height: "35px" }}>
          Giao dịch rút tiền - Nộp tiền{" "}
        </div>
        <div className="panel-body ">
          <div className="add-info-account">
            <div
              className={
                this.state.access == "view" ? "col-md-12 disable" : "col-md-12 "
              }
              style={{ paddingTop: "11px" }}
            >
              <div className="col-md-12 row">
                <div className="col-md-3">
                  <h5>
                    <b>{this.props.strings.custodycd}</b>
                  </h5>
                </div>
                <div className="col-md-5">
                  <Select
                    options={this.state.optioncustodycd}
                    onChange={this.onChangeThangHNcustodycd.bind(
                      this,
                      "p_custodycd"
                    )}
                    value={this.state.datagroup.p_custodycd}
                  />
                </div>
              </div>
              <div className="col-md-12 row">
                <div className="col-md-3">
                  <h5>
                    <b>{this.props.strings.fullname}</b>
                  </h5>
                </div>
                <div className="col-md-5">
                  <input
                    maxLength={30}
                    className="form-control"
                    type="text"
                    placeholder={this.props.strings.fullname}
                    id="p_fullname"
                    value={this.state.datagroup["p_fullname"]}
                    onChange={this.onChange.bind(this, "p_fullname")}
                    disabled
                  />
                </div>
              </div>
              <div className="col-md-12 row">
                <div className="col-md-3">
                  <h5>
                    <b>{this.props.strings.BIRTHDATE}</b>
                  </h5>
                </div>
                <div className="col-md-5">
                  <input
                    maxLength={30}
                    className="form-control"
                    type="text"
                    placeholder={this.props.strings.BIRTHDATE}
                    id="p_BIRTHDATE"
                    value={this.state.datagroup["p_BIRTHDATE"]}
                    onChange={this.onChange.bind(this, "p_BIRTHDATE")}
                    disabled
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
                    id="p_address"
                    value={this.state.datagroup["p_address"]}
                    onChange={this.onChange.bind(this, "p_address")}
                    disabled
                  />
                </div>
              </div>
              <div className="col-md-12 row">
                <div className="col-md-3">
                  <h5>
                    <b>{this.props.strings.ACCOUNT}</b>
                  </h5>
                </div>
                <div className="col-md-5">
                  <input
                    disabled
                    maxLength={30}
                    className="form-control"
                    type="text"
                    placeholder={this.props.strings.ACCOUNT}
                    id="p_account"
                    value={this.state.datagroup["p_account"]}
                    onChange={this.onChange.bind(this, "p_account")}
                  />
                </div>
              </div>
              <div className="col-md-12 row">
                <div className="col-md-3">
                  <h5>
                    <b>{this.props.strings.TYPE}</b>
                  </h5>
                </div>
                {/* <div className="col-md-5">
                    <Select
                      options={this.state.optionDiretor}
                      // onChange={this.onChangeThangHNTYPE.bind(this,"p_type" )}
                      value={this.state.datagroup.p_type}
                    />
                  </div> */}

                <div className="col-md-5">
                  <input
                    disabled
                    maxLength={30}
                    className="form-control"
                    type="text"
                    placeholder={this.props.strings.TYPE}
                    id="p_account"
                    value={this.state.datagroup["p_type"]}
                    onChange={this.onChange.bind(this, "p_type")}
                  />
                </div>
              </div>

              <div className="col-md-12 row  ">
                <div className="col-md-3">
                  <h5>
                    <b>{this.props.strings.BALANCE}</b>
                  </h5>
                </div>
                <div className="col-md-5">
                  <input
                    disabled
                    // disabled={
                    //   this.state.datagroup["p_type"] === "TT" ? true : false
                    // }
                    maxLength={30}
                    className="form-control"
                    type="text"
                    placeholder={this.props.strings.BALANCE}
                    id="p_balance"
                    value={this.state.datagroup["p_balance"]}
                    onChange={this.onChange.bind(this, "p_balance")}
                  />
                </div>
              </div>
              <div className="col-md-12 row  ">
                <div className="col-md-3">
                  <h5>
                    {/* <b>{this.props.strings.BALANCE}</b> */}
                    <b>Số dư giao dịch</b>
                  </h5>
                </div>
                <div className="col-md-5">
                  <input
                    maxLength={30}
                    className="form-control"
                    type="text"
                    placeholder={this.props.strings.MONEY}
                    id="p_money"
                    value={this.state.datagroup["p_money"]}
                    onChange={this.onChange.bind(this, "p_money")}
                  />
                </div>
              </div>
              <div className="col-md-12 row  ">
                <div className="col-md-3">
                  <h5>
                    <b>Thao tác</b>
                  </h5>
                </div>
                <div className="col-md-5">
                  <label className="check_type_account_container  ">
                    Rút tiền
                    <input
                      type="radio"
                      name="radio"
                      value="RT"
                      //value={this.state.datagroup["p_type"]}
                      checked={
                        this.state.datagroup["p_action"] === "RT" ? true : false
                      }
                      onChange={this.onChange.bind(this, "p_action")}
                    />
                    <span className="checkmark"></span>
                  </label>
                  <label className="check_type_account_container">
                    Nộp tiền
                    <input
                      type="radio"
                      checked="checked"
                      name="radio"
                      value="NT"
                      checked={
                        this.state.datagroup["p_action"] === "NT" ? true : false
                      }
                      onChange={this.onChange.bind(this, "p_action")}
                    />
                    <span className="checkmark"></span>
                  </label>
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
      </div>
    );
  }
}
const stateToProps = (state) => ({
  lang: state.language.language,
});
const decorators = flow([connect(stateToProps), translate("THANGHNBALANCE")]);
module.exports = decorators(THANGHNBALANCE);
