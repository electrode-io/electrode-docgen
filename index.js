#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var reactDocs = require('react-docgen');
var doctrine = require('doctrine');
var program = require('commander');
var glob = require('glob');
var async = require('async');
var generateMarkdown = require('./generate-markdown');
var markdown = require('markdown-js').makeHtml;
var indentString = require('indent-string');

var _mergeProps = function(comp1, comp2) {
  for(var k in comp2.props) {
    if(comp1.props[k] === undefined) {
      comp1.props[k] = comp2.props[k];
    }
  }
};

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
  if (str === undefined) {
    return;
  }
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
    } if (tk === 'synonym') {
      if (target[tk]) {
        target[tk].push(tv);
      } else {
        target[tk] = [tv];
      }
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

function _createDemo(dir, done) {
  glob(dir + '/data/*.*', function(er, files) {
    var items = [];
    for(var f in files) {
      var file = files[f];
      console.log(file);
      items.push("  " +
        path.basename(file, path.extname(file)) +
        ": require(\"./data/" +
        path.basename(file) +
        "\")");
    }
    var data = "module.exports = {\n" +
      items.join(",\n") +
      "\n};\n";
    console.log('Writing ' + dir + '/data.jsx');
    fs.writeFileSync(dir + '/data.jsx', data);
    done();
  });
}

function _createImages(dir, done) {
  glob(dir + '/images/*.*', function(er, files) {
    var items = [];
    for(var f in files) {
      var file = files[f];
      console.log(file);
      items.push("  \"" +
        path.basename(file, path.extname(file)) +
        "\": require(\"./images/" +
        path.basename(file) +
        "\")");
    }
    var images = "module.exports = {\n" +
      items.join(",\n") +
      "\n};\n";
    console.log('Writing ' + dir + '/images.jsx');
    fs.writeFileSync(dir + '/images.jsx', images);
    done();
  });
}

program
  .version('0.0.17')
  .option('-s --src <dir>', 'Source location', null, 'src')
  .option('-p --package <package>', 'Package file', null, 'package.json')
  .option('--metadata <file>', 'Metadata output file')
  .option('--markdown <file>', 'Markdown output file')
  .option('--demo <dir>', 'Demo output directory')
  .parse(process.argv);

var pkgJSON = fs.readFileSync(program.package);
var pkgInfo = JSON.parse(pkgJSON);

var metadata = {
  library: pkgInfo.name,
  description: pkgInfo.description,
  title: pkgInfo.title,
  components: []
};

glob(program.src + '/*/**.jsx', function(er, files) {
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
      delete componentInfo.props.style;
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
      // console.log(e.stack);
      // console.log(e);
    }
    done();
  }, function() {
    metadata.components = metadata.components.sort(function(a, b) {
      if (a.component < b.component ) {
        return -1;
      } else {
        return 1;
      }
    });

    var componentsByName = {};
    for(var i in metadata.components) {
      var comp = metadata.components[i];
      componentsByName[comp.component] = comp;
    }

    for(var i in metadata.components) {
      var comp = metadata.components[i];
      if(comp.wraps) {
        var wrappedComp = componentsByName[comp.wraps];
        if(wrappedComp) {
          _mergeProps(comp, wrappedComp);
        }
      }
    }

    if (program.metadata) {
      fs.writeFileSync(program.metadata,
        JSON.stringify(metadata, null, 2));
    }

    if (program.markdown) {
      fs.writeFileSync(program.markdown, generateMarkdown.generateLibraryDocs(metadata));
    }

    if (program.demo) {
      async.series([
        function(done) { _createDemo(program.demo, done); },
        function(done) { _createImages(program.demo, done); }
      ]);
    }
  });
});
