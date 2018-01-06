module.exports = {
  array: {
    removeIfPresent: (needle, haystack) => {
      const index = haystack.indexOf(needle);

      if (index !== -1) {
        haystack.splice(index, 1);
        return true;
      }

      return false;
    }
  },
  object: {
    reverseKeyValueMapping:
      object =>
        Object.keys(object).reduce((res, key) => ({
          ...res,
          [object[key]]: key
        }), {})
  }
};
