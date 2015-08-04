var fs = require('fs');
var handlebars = require('handlebars');

handlebars.registerPartial('component', fs.readFileSync(__dirname + '/templates/component-partial.hbs').toString());

handlebars.registerHelper('defaultProp', function(options) {
  var str = options.fn(this);
  str = str.replace(/\s+/g,' ');
  if (str.length > 50) {
    str = str.substring(0, 50) + '...';
  }
  return str.length > 0 ? '`' + str + '`' : "";
});

function _generateDevPortal(comp) {
  var templateSource = fs.readFileSync(__dirname + '/templates/dev-portal.hbs');
  var template = handlebars.compile(templateSource.toString(), {noEscape: true});
  var result = template(comp);
  return result;
}

function _generateLibraryDocs(metadata) {
  var templateSource = fs.readFileSync(__dirname + '/templates/library-docs.hbs');
  var template = handlebars.compile(templateSource.toString(), {noEscape: true});
  var result = template(metadata);
  return result;
}

module.exports = {
  generateLibraryDocs: _generateLibraryDocs,
  generateDevPortal: _generateDevPortal
}