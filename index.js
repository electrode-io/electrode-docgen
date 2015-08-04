#!/usr/bin/env node

var fs = require('fs');
var reactDocs = require('react-docgen');
var doctrine = require('doctrine');
var program = require('commander');
var glob = require('glob');
var async = require('async');
var generateMarkdown = require('./generate-markdown');

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

var _demoReplace = function(code, section, content) {
  var re = new RegExp('(\/\/\/ start ' + section + "\n" + '[\\s\\S]*\/\/\/ end ' + section + ')');
  content = '/// start ' + section + "\n" + content + '/// end ' + section;
  code = code.replace(re, content);
  return code;
}

program
  .version('0.0.12')
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
    })

    if (program.metadata) {
      fs.writeFileSync(program.metadata,
        JSON.stringify(metadata, null, 2));
    }

    if (program.markdown) {
      fs.writeFileSync(program.markdown, generateMarkdown.generateLibraryDocs(metadata));
    }

    if (program.demo) {
      var index = fs.readFileSync(program.demo + '/index.jsx').toString();

      var imports = "";
      var examples = {};
      var eIndex = 1;
      for (var c in metadata.components) {
        var comp = metadata.components[c];
        if (comp.playground) {
          imports += "import " + comp.component + " from '../" + comp.fileName + "';\n";
          for (var p in comp.playground) {
            var pg = comp.playground[p];

            var example = "example" + eIndex;
            examples[example] = {
              component: comp,
              playground: pg
            };

            imports += "var " + example + " = require('raw!./examples/" + example + ".example');\n";

            fs.writeFileSync(program.demo + '/examples/' + example + '.example', pg.code);

            eIndex++;
          }
        }
      }
      index = _demoReplace(index, 'imports', imports);

      var render = "";
      render += "    return (\n";
      render += "      <div className=\"component-documentation\">\n";
      for (var e in examples) {
        var example = examples[e];
        render += "        <h3 id={\"" + example.playground.title + "\"}>" + example.playground.title + "</h3>\n";
        render += "        <Playground\n";
        render += "          codeText={" + e + "}\n";
        render += "          scope={assign({React, " + example.component.component + "}, this.props.scope || {})}\n";
        render += "          noRender={" + ( example.playground.flags.noRenderFalse ? 'false' : 'true' ) + "}/>\n";
      }
      render += "      </div>\n";
      render += "    );\n";
      index = _demoReplace(index, 'render', render);

      console.log('Writing ' + program.demo + '/index.jsx');
      fs.writeFileSync(program.demo + '/index.jsx', index);
    }
  });
});
