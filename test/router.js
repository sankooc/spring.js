const springJS = require('../index');

// 测试看看
const { s2 } = springJS.get();
/**
 * 
 * @path /v1/pau
 * @method post
 * @midware log,men
 * @extention json
 */
exports.login = async () => {
  // 里面测试
  // console.log(s2);
  await s2.play();
};


/**
 * 
 * @path /v1/logit
 * 
 */

/**
 * @path /v1/logout
 * @method post
 * 
 */

exports.logout = async () => {

};