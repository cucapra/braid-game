function assign() {
  var t = arguments[0];
  for (var i = 1; i < arguments.length; ++i)
    for (var k in arguments[i])
      t[k] = arguments[i][k];
  return t;
}
function splice(outer, id, inner, level) {
  var token = '__SPLICE_' + id + '__';
  var code = inner.prog;
  for (var i = 0; i < level; ++i) {
    // Escape the string to fit at the appropriate nesting level.
    code = JSON.stringify(code).slice(1, -1);
  }
  return {
    prog: outer.prog.replace(token, code),
    persist: assign({}, outer.persist, inner.persist)
  };
}
function call(closure, args) {
  return closure.proc.apply(void 0, args.concat(closure.env));
}
function run(code) {
  // Get the persist names and values to bind.
  var params = [];
  var args = [];
  for (var name in code.persist) {
    params.push(name);
    args.push(code.persist[name]);
  }

  // Inject the names into the quote's top-level function wrapper.
  var js = code.prog.replace("()", "(" + params.join(", ") + ")");
  // Strip off the invocation from the end.
  js = js.slice(0, -2);
  // Invoke the extracted function.
  var func = eval(js);
  return func.apply(void 0, args);
}
export default (function (rt) {
  var gl = rt.gl;
  function f990(v991) {
    return [(1), (2), (3), (4)];
  }
  function f1028(v1029, v989) {
    var v1265, v1248, v1217, v1200, v1145, v1124, v1085, v1068, v1059, v1042;
    v1042 = ((v1029).length);
    v1059 = (0);
    v1068 = ([]);
    v1085 = ([(1)]);
    while ((v1059) <= ((v1042) - (1))) {
      v1124 = ((v1029)[(v1059)]);
      v1145 = ([(true), (false)]);
      ((v1145)[0]) ? ((v1068).push((v1124)),
      0) : (0);
      v1200 = (call((v989), [(v1124)]));
      v1217 = ((v1200).length);
      ((v1217) >= (1)) ? (v1248 = ((v1200).length),
      v1265 = (0),
      while ((v1265) <= ((v1248) - (1))) {
        (v1085).push(((v1200)[(v1265)]));
        v1265 = ((v1265) + (1));
      },
      0) : (0);
      v1059 = ((v1059) + (1));
    };
    return [(v1068), (v1085)];
  }
  function q1396(v1027) {
    return call((v1027), [([(1), (2), (3)])]);
  }
  function main() {
    var v1027, v989;
    v989 = ({ proc: f990, env: [] });
    v1027 = ({ proc: f1028, env: [v989] });
    return { proc: q1396, env: [v1027] };
  }
  return main();
})
