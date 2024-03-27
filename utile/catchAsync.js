module.exports = (func) => {
  //I am not understant it 100% how the req and res and next work that in prameter
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};
