#!/usr/bin/env node

var fs = require('fs');
var reactDocs = require('react-docgen');
var doctrine = require('doctrine');
var program = require('commander');
var glob = require('glob');
var async = require('async');
var handlebars = require('handlebars');

var _parsePlayground = function(str) {
  var code = str.match(/(``|```)([\s\S]*)(``|```)/);
  if (code) {
    code = code[0];
    code = code.replace(/(``|```)\s*\n/g,'');
    code = code.replace(/(```|``)/g,'');
  }
  str = str.replace(/(``|```)([\s\S]*)(``|```)/, '');
  str = str.replace(/(``|```)/g, '');
  var flags = {};
  str = str.replace(/!([\s\S]*)!/, function(found) {
    found = found.replace(/!/g, '');
    flags[found] = true;
    return '';
  });
  str = str.replace(/^\s+/, '');
  str = str.replace(/\s+$/, '');
  return {
    title: str,
    flags: flags,
    code: code
  };
};

var _parseTags = function(str, target) {
  delete target.description;
  var parsed = doctrine.parse(str);
  target.description = parsed.description;
  for (var t in parsed.tags) {
    var tk = parsed.tags[t].title;
    var tv = parsed.tags[t].description;
    if (tk === 'playground') {
      if (target[tk] === undefined) {
        target[tk] = [];
      }
      target[tk].push(_parsePlayground(tv));
    } else {
      if (target[tk]) {
        target[tk] = [target[tk]];
        target[tk].push(tv);
      } else {
        target[tk] = tv;
      }
    }
  }
};

program
  .version('0.0.1')
  .option('-s --src <dir>', 'Source location', null, 'src')
  .option('-p --package <package>', 'Package file', null, 'package.json')
  .option('--metadata <file>', 'Metadata output file')
  .option('--markdown <file>', 'Markdown output file')
  .parse(process.argv);

var pkgJSON = fs.readFileSync(program.package);
var pkgInfo = JSON.parse(pkgJSON);

var metadata = {
  library: pkgInfo.name,
  description: pkgInfo.description,
  title: pkgInfo.title,
  components: []
};

glob(program.src + '/*.jsx', function(er, files) {
  async.each(files, function(file, done) {
    var src = fs.readFileSync(file);
    try {
      var componentInfo = reactDocs.parse(src);
      componentInfo.fileName = file;
      if (componentInfo.description) {
        _parseTags(componentInfo.description, componentInfo);
      }
      delete componentInfo.props.children;
      delete componentInfo.props.className;
      componentInfo.hasProps = false;
      if (componentInfo.props) {
        for (var p in componentInfo.props) {
          var pr = componentInfo.props[p];
          componentInfo.hasProps = true;
          _parseTags(pr.description, pr);
        }
      }
      if (componentInfo.private === undefined) {
        metadata.components.push(componentInfo);
      }
    } catch(e) {
    }
    done();
  }, function() {
    metadata.components = metadata.components.sort(function(a, b) {
      if (a.component < b.component ) {
        return -1;
      } else {
        return 1;
      }
    })

    if (program.metadata) {
      fs.writeFileSync(program.metadata,
        JSON.stringify(metadata, null, 2));
    }

    if (program.markdown) {
      var templateSource = fs.readFileSync(__dirname + '/templates/markdown.hbs');
      var template = handlebars.compile(templateSource.toString(), {noEscape: true});
      var result = template(metadata);
      fs.writeFileSync(program.markdown, result);
    }
  });
});
