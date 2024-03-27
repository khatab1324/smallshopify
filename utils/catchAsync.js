module.exports = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
}; //this code funtoin acccepts a fuction and execute that function but it catch the error and pass it to next()
