var path = require("path");
var processingserver = require("../commonwebuser/ProcessingServer");
var commonUtil = require("../common/CommonUtil");
var Ioutput = require(path.resolve(__dirname, "../common/OutputInterface.js"));
var ConvertData = require("../services/ConvertData");
module.exports = {
  // get data
  thanghngetlistbranch: async function (req, res) {
    let data = req.body;
    let { TLID, ROLECODE } = req.session.userinfo;
    let rest = {
      p_refcursor: { dir: 3003, type: 2004 },
      p_tlid: TLID,
      p_role: ROLECODE,
      p_language: data.language,
      p_custodycd: "ALL",
      lang: data.language,
      pv_objname: data.OBJNAME,
    };
    let obj = {
      funckey: "prc_get_thanghn_branch",
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
  // create branch
  prc_mt_ThangHNAddBranch: function (req, res) {
    let data = req.body;
    data.pv_tlid = req.session.userinfo.TLID;
    data.pv_role = req.session.userinfo.ROLECODE;
    data.MODELNAME = "mt_thanghnbranch";
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
  // edit branch
  prc_mt_ThangHNUpdateBranch: function (req, res) {
    let data = req.body;
    data.pv_tlid = req.session.userinfo.TLID;
    data.pv_role = req.session.userinfo.ROLECODE;
    data.MODELNAME = "mt_thanghnbranch";
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
  // delete branch
  prc_mt_ThangHNDeleteBranch: function (req, res) {
    let data = {
      p_autoid: req.body.data.AUTOID,
      pv_tlid: req.session.userinfo.TLID,
      pv_role: req.session.userinfo.ROLECODE,
      p_branch_code: "",
      p_name: "",
      p_address: "",
      p_bankcode: "",
      p_director: "",
      p_population: "",
      pv_language: req.body.pv_language,
      pv_objname: req.body.OBJNAME,
      p_refcursor: { dir: 3003, type: 2004 },
    };

    data.MODELNAME = "mt_thanghnbranch";
    data = commonUtil.convertPropsNullToEmpty(data);

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
  // get options select trong thêm chi nhánh
  getdirector: async function (req, res) {
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
      funckey: "get_select_thanghn_branch_director",
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
              label: item.FULLNAME,
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
  // get option Ngân hàng trong thêm mới chi nhánh
  getbank: async function (req, res) {
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
      funckey: "get_select_thanghn_branch_bank",
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
              value: item.BANKCODE,
              label: item.BANKNAME,
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
