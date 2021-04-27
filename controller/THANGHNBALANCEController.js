var path = require("path");
var processingserver = require("../commonwebuser/ProcessingServer");
var commonUtil = require("../common/CommonUtil");
var Ioutput = require(path.resolve(__dirname, "../common/OutputInterface.js"));
var ConvertData = require("../services/ConvertData");
const { controllers } = require("chart.js");
module.exports = {
  getthanghn_balance: async function (req, res) {
    let data = req.body;
    let { TLID, ROLECODE } = req.session.userinfo;
    let rest = {
      p_refcursor: { dir: 3003, type: 2004 },
      p_tlid: TLID,
      p_role: ROLECODE,
      p_language: data.language,
      pv_objname: "THANGHNBALANCE",
    };
    let obj = {
      funckey: "get_select_custodycd_thanghn_balance",
      bindvar: rest,
    };
    processingserver.callAPI(obj, async function (err, rs) {
      if (err) {
        return res.send(err);
      }
      try {
        if (rs.EC == 0) {
          let result,
            resultdata = ConvertData.convert_to_Object(rs.DT.p_refcursor);
          result = resultdata.map((item) => {
            return {
              value: item.CUSTODYCD,
              label: item.CUSTODYCD,
              fullname: item.FULLNAME,
              idplace: item.IDPLACE,
              BIRTHDATE: item.BIRTHDATE,
              ACCOUNT: item.ACCOUNT,
              TYPE: item.TYPE,
              BALANCE: item.BALANCE,
            };
          });
          return res.send({ result, resultdata });
        } else {
          return res.send(rs);
        }
      } catch (error) {
        rs.EM = "Lỗi client gọi api";
        rs.EC = -1000;
        return res.send(rs);
      }
    });
  },
  // thangHNChangeBalance: function (req, res) {
  //   try {
  //     let data = req.body;
  //     data = commonUtil.convertPropsNullToEmpty(data);
  //     let { TLID, ROLECODE } = req.session.userinfo;
  //     console.log("ssssssssssssss", req.body);

  //     let rest = {
  //       p_tlid: TLID,
  //       p_role: ROLECODE,
  //       p_language: data.language,
  //       pv_objname: req.body.OBJNAME,
  //       p_autoid: data.AUTOID,
  //       p_account: data.ACCOUNT,
  //       p_action: data.ACTION,

  //       p_balance: data.BALANCE,
  //       p_custodycd: data.CUSTODYCD,
  //       p_fullname: data.FULLNAME,
  //       p_money: data.MONEY,
  //       p_type: data.TYPE,
  //       pv_action: "add",
  //       pv_language: data.language,
  //       pv_objname: "THANGHNBALANCE",
  //     };
  //     let obj = {
  //       funckey: "prc_thanghnbalance_2403",
  //       bindvar: rest,
  //     };
  //     processingserver.callAPI(obj, async function (err) {
  //       if (err) {
  //         sails.log.error(err);
  //         return res.send(Ioutput.errServer(err));
  //       }

  //       if (rs.EC == 0) {
  //         let DT = await ConvertData.convert_to_Object(rs.DT.p_refcursor);
  //         return res.send(Ioutput.success(DT));
  //       } else {
  //         return res.send(rs);
  //       }
  //       // return res.json({
  //       //   EC: 0,
  //       // });
  //     });
  //   } catch (error) {
  //     sails.log.error(error);
  //     return res.send(Ioutput.errServer(error));
  //   }
  // },
  thangHNChangeBalance: function (req, res) {
    try {
      let data = req.body;
      data = commonUtil.convertPropsNullToEmpty(data);
      let { TLID, ROLECODE } = req.session.userinfo;
      let rest = {
        p_tlid: TLID,
        p_role: ROLECODE,
        p_BIRTHDATE: data.p_BIRTHDATE,
        p_language: data.pv_language,
        pv_objname: data.pv_objname,
        p_action: data.p_action,
        p_custodycd: data.p_custodycd,
        p_birthdate: data.p_birthdate,
        p_account: data.p_account,
        p_type: data.p_type,
        p_balance: data.p_balance,
        p_money: data.p_money,
        pv_action: "ADD",
      };

      let obj = {
        funckey: "prc_thanghnbalance_2403",
        bindvar: rest,
      };
      let language = data.pv_language;
      processingserver.callAPI(obj, async function (err, rs) {
        if (err) {
          sails.log("err1:", err);
          return res.send(err);
        }
        try {
          if (rs.EC == 0) {
            rs.EM = await Ioutput.getMsgErrDefs(rs.EC, rs.EM, language);
            return res.send(rs);
          } else {
            rs.EM = await Ioutput.getMsgErrDefs(rs.EC, rs.EM, language);
            sails.log("err2:", rs);
            return res.send(rs);
          }
        } catch (error) {
          rs.EM = "Lỗi client gọi api";
          rs.EC = -1000;
          return res.send(rs);
        }
      });
    } catch (error) {
      sails.log.error(error);
      return res.send(Ioutput.errServer(error));
    }
  },
};
