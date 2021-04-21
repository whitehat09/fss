var path = require("path");
var processingserver = require("../commonwebuser/ProcessingServer");
var commonUtil = require("../common/CommonUtil");
var Ioutput = require(path.resolve(__dirname, "../common/OutputInterface.js"));
var ConvertData = require("../services/ConvertData");
module.exports = {
  // get data
  thanghngetlistaccount: async function (req, res) {
    let data = req.body;
    let { TLID, ROLECODE } = req.session.userinfo;
    let rest = {
      p_refcursor: { dir: 3003, type: 2004 },
      p_tlid: TLID,
      p_role: ROLECODE,
      p_language: data.language,
      // p_custodycd: "ALL",
      // lang: data.language,
      pv_objname: data.OBJNAME,
    };
    let obj = {
      funckey: "prc_get_all_thanghn_account",
      bindvar: rest,
    };
    processingserver.callAPI(obj, async function (err, rs) {
      if (err) {
        return res.send(err);
      }
      try {
        if (rs.EC == 0) {
          let result = ConvertData.convert_to_Object(rs.DT.p_refcursor);
          let dataAll = result;
          let dataExport = result;
          let pv_sumRecord = result.length;
          //phan trang
          let { pagesize, page, keySearch, sortSearch } = req.body;
          if (keySearch)
            if (keySearch.length > 0) {
              result = await Paging.find(result, keySearch);
              dataExport = result;
            }
          let numOfPages = Math.ceil(result.length / pagesize);
          // search theo tung cot
          if (sortSearch)
            if (sortSearch.length > 0)
              result = await Paging.orderby(result, sortSearch);
          result = await Paging.paginate(result, pagesize, page ? page : 1);
          delete rs.DT["p_refcursor"];
          var DT = {
            data: result,
            numOfPages: numOfPages,
            sumRecord: pv_sumRecord,
            dataAll,
            dataExport,
          };
          return res.send(Ioutput.success(DT));
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
  // create account
  prc_mt_ThangHNAddAccount: function (req, res) {
    let data = req.body;
    console.log("--------------------------add", req.body);
    data.pv_tlid = req.session.userinfo.TLID;
    data.pv_role = req.session.userinfo.ROLECODE;
    data.MODELNAME = "mt_thanghnaccount";
    data.p_refcursor = { dir: 3003, type: 2004 };
    data = commonUtil.convertPropsNullToEmpty(data);
    let obj = { model: data };
    let language = data.language;
    processingserver.createmodel(obj, async function (err, rs) {
      if (err) {
        return res.send(err);
      }
      try {
        rs.EM = await Ioutput.getMsgErrDefs(rs.EC, rs.EM, language);
        return res.send(rs);
      } catch (error) {
        rs.EM = "Lỗi client gọi api";
        rs.EC = -1000;
        return res.send(rs);
      }
    });
  },
  // edit account
  prc_mt_ThangHNUpdateAccount: function (req, res) {
    let data = req.body;
    data.pv_tlid = req.session.userinfo.TLID;
    data.pv_role = req.session.userinfo.ROLECODE;
    data.MODELNAME = "mt_thanghnaccount";
    data.p_refcursor = { dir: 3003, type: 2004 };
    data = commonUtil.convertPropsNullToEmpty(data);
    let obj = { model: data };
    let language = data.language;
    processingserver.updatemodel(obj, async function (err, rs) {
      if (err) {
        return res.send(err);
      }
      try {
        rs.EM = await Ioutput.getMsgErrDefs(rs.EC, rs.EM, language);
        return res.send(rs);
      } catch (error) {
        rs.EM = "Lỗi client gọi api";
        rs.EC = -1000;
        return res.send(rs);
      }
    });
  },
  // delete account
  prc_mt_ThangHNDeleteAccount: function (req, res) {
    let data = {
      p_autoid: req.body.data.AUTOID,
      pv_tlid: req.session.userinfo.TLID,
      pv_role: req.session.userinfo.ROLECODE,
      p_account_code: "",
      p_name: "",
      p_address: "",
      p_bankcode: "",
      p_director: "",
      p_population: "",
      pv_language: req.body.pv_language,
      pv_objname: req.body.OBJNAME,
      p_refcursor: { dir: 3003, type: 2004 },
    };
    // if (data.STATUS == "A" || data.PSTATUS == "%A%") {
    //   return res.send({
    //     EM: "Không được sửa/xóa chi nhánh này !",
    //     EC: -120029,
    //   });
    // }
    data.MODELNAME = "mt_thanghnaccount";
    data = commonUtil.convertPropsNullToEmpty(data);
    console.log("aaaaaaaaaaaa", data);
    let obj = { model: data };
    let language = data.pv_language;
    processingserver.deletemodel(obj, async function (err, rs) {
      if (err) {
        return res.send(err);
      }
      try {
        rs.EM = await Ioutput.getMsgErrDefs(rs.EC, rs.EM, language);
        return res.send(rs);
      } catch (error) {
        rs.EM = "Lỗi client gọi api";
        rs.EC = -1000;
        return res.send(rs);
      }
    });
  },
  // get options kh select trong thêm account
  getcustodycd: async function (req, res) {
    let data = req.body;
    let { TLID, ROLECODE } = req.session.userinfo;
    let rest = {
      p_refcursor: { dir: 3003, type: 2004 },
      p_tlid: TLID,
      p_role: ROLECODE,
      p_language: data.language,
      pv_objname: data.objname,
    };
    let obj = {
      funckey: "get_custodycd_thanghnaccount",
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
};
