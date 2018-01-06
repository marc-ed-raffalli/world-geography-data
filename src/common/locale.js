const locale = {
  getMainLocale: locale => locale.split('-')[0],

  getBestMatchingLocaleValue: (object, localeCode) => {
    if (!object) return undefined;

    if (object[localeCode]) return object[localeCode];

    const localeLowerCase = localeCode.toLocaleLowerCase(),
      matchingKey = Object.keys(object).find(key => localeLowerCase === key);

    return object[matchingKey]
      ? object[matchingKey]
      : locale.getBestMatchingLocaleValue(object, locale.getMainLocale(localeCode));
  }
};

module.exports = locale;
